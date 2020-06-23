import assert from 'assert'
import EventEmitter from 'events'
import { AbstractInstantiationError } from '@tvkitchen/base-errors'
import { IAppliance } from '@tvkitchen/base-interfaces'
import { PayloadArray } from '@tvkitchen/base-classes'
import {
	isPayloadInstance,
	isPayloadArrayInstance,
} from './utils/payload'
import {
	INPUT_RECEIVED,
	OUTPUT,
} from './constants/events'

/**
 * The Abstract Appliance begins to implement the IAppliance interface and implements
 * a few universal pieces of functionality, such as:
 *
 * - Event emission
 * - Payload validation process flow
 * - Appliance configuration
 *
 * For more information about the TV Kitchen architecture visit:
 * https://github.com/tvkitchen/tv-kitchen/blob/master/docs/ARCHITECTURE.md
 */
class AbstractAppliance extends IAppliance {
	settings = {}

	emitter = new EventEmitter()

	payloads = new PayloadArray()

	constructor(overrideSettings = {}) {
		super()
		if (this.constructor === AbstractAppliance) {
			throw new AbstractInstantiationError('AbstractAppliance')
		}
		Object.assign(
			this.settings,
			overrideSettings,
		)
	}

	ingestPayload = async (payload) => {
		this.emitter.emit(INPUT_RECEIVED, { payload })
		assert(
			isPayloadInstance(payload),
			'You cannot ingest data that is not an instance of Payload.',
		)
		assert(
			await this.isValidPayload(payload),
			'Payload does not satisfy appliance ingestion conditions.',
		)
		this.payloads.insert(payload)
		const remainingPayloads = await this.invoke(this.payloads)
		assert(
			isPayloadArrayInstance(remainingPayloads),
			'The invoke method was not properly defined; it must return a PayloadArray.',
		)
		const werePayloadsProcessed = this.payloads.length !== remainingPayloads.length
		this.payloads = remainingPayloads
		return werePayloadsProcessed
	}

	on = (eventType, listener) => this.emitter.on(eventType, listener)

	emitResult = (payload) => this.emitter.emit(OUTPUT, { payload })
}

export default AbstractAppliance
