import assert from 'assert'
import { AbstractInstantiationError } from '@tvkitchen/base-errors'
import { IAppliance } from '@tvkitchen/base-interfaces'
import {
	Payload,
	PayloadArray,
} from '@tvkitchen/base-classes'
import { silentLogger } from './silentLogger'

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

	payloads = new PayloadArray()

	constructor(settings = {}) {
		super(settings)
		if (this.constructor === AbstractAppliance) {
			throw new AbstractInstantiationError('AbstractAppliance')
		}
		this.settings = {
			logger: silentLogger,
			...settings,
		}
		this.logger = this.settings.logger
		this.currentOrigin = ''
	}

	setCurrentOrigin(origin) { this.currentOrigin = origin }

	getCurrentOrigin() { return this.currentOrigin }

	/** @inheritdoc */
	async isValidPayload(payload) {
		assert(
			this.constructor.getInputTypes(this.settings).includes(payload.type),
			`${payload.type} is not a valid Payload type for this appliance.`,
		)
		return true
	}

	/** @inheritdoc */
	async ingestPayload(payload) {
		assert(
			Payload.isPayload(payload),
			'You cannot ingest data that is not an instance of Payload.',
		)
		assert(
			await this.isValidPayload(payload),
			'Payload does not satisfy appliance ingestion conditions.',
		)
		this.payloads.insert(payload)
		this.setCurrentOrigin(payload.origin)
		const remainingPayloads = (await this.invoke(this.payloads)) ?? new PayloadArray()
		assert(
			PayloadArray.isPayloadArray(remainingPayloads),
			'The invoke method was not properly defined; it must return a PayloadArray.',
		)
		const werePayloadsProcessed = this.payloads.length !== remainingPayloads.length
		this.payloads = remainingPayloads
		return werePayloadsProcessed
	}

	push(payload) {
		const origin = (payload.origin === '')
			? this.getCurrentOrigin()
			: payload.origin

		super.push(new Payload({
			...payload,
			origin,
		}))
	}
}

export { AbstractAppliance }
