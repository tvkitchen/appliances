import { isPayloadInstance } from './utils/payload'

/**
 * Responsible for collecting payloads of various type, keeping them organized, and
 * handling buffer maintenance.
 */
class PayloadBuffer {
	payloads = {}

	/**
	 * Ensure that the PayloadBuffer is prepared to ingest a given data type.
	 *
	 * @param  {String} dataType The data type that needs to be prepared.
	 * @return {null}
	 */
	prepareDataType = (dataType) => {
		if (dataType in this.payloads) return
		this.payloads[dataType] = []
	}

	/**
	 * Add a payload to the appropriate list.
	 *
	 * @param  {Payload} payload The payload to be added.
	 * @return {Boolean}         Indication of whether the payload was added.
	 */
	add = (payload) => {
		if (!isPayloadInstance(payload)) return false
		const { dataType } = payload
		this.prepareDataType(dataType)
		this.payloads[dataType] = payload
		return true
	}
}

export default PayloadBuffer
