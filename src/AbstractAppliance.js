import assert from 'assert'
import EventEmitter from 'events'
import { AbstractInstantiationError } from '@tvkitchen/base-errors'
import { IAppliance } from '@tvkitchen/base-interfaces'
import PayloadBuffer from './PayloadBuffer'
import { isPayloadInstance } from './utils/payload'
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

	payloadBuffer = new PayloadBuffer()

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

	/**
	 * Called by a third party to pass data into the appliance.
	 * If the payload is valid, it is added to the buffer and the appliance is invoked.
	 *
	 * @throws
	 * @param  {[type]} payload [description]
	 * @return {[type]}         [description]
	 */
	ingestPayload = async (payload) => {
		this.emitter.emit(INPUT_RECEIVED, { payload })
		assert(isPayloadInstance(payload), 'You cannot ingest data that is not an instance of Payload.')
		assert(await this.isValidPayload(payload), 'Payload does not satisfy appliance ingestion conditions.')
		this.payloadBuffer.add(payload)
		return this.invoke()
	}

	/**
	 * Registers a listener to the appliance for a given event type.
	 *
	 * Event types are listed in constants/events.js
	 *
	 * @param  {String} eventType  The type of event being listened to.
	 * @param  {Function} listener The listener to be registered for that event.
	 * @return {EventEmitter}      The EventEmitter (so events can be chained).
	 */
	on = (eventType, listener) => this.emitter.on(eventType, listener)

	/**
	 * Called by an implemented appliance when there is data worth sharing.
	 *
	 * @param  {Payload} payload The result that is ready to share.
	 * @return {Boolean}         Returns true if there are output listeners, false otherwise.
	 */
	emitResult = (payload) => this.emitter.emit(OUTPUT, { payload })
}

export default AbstractAppliance
