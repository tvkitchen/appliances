import { AbstractAppliance } from '@tvkitchen/appliance-core'
import {
	PayloadArray,
	Payload,
} from '@tvkitchen/base-classes'
import { dataTypes } from '@tvkitchen/base-constants'
import { msToSrtTimestamp } from './utils/srt'

/**
 * The CaptionSrtGeneratorAppliance converts a stream of text into chunks of SRT.
 *
 * @extends AbstractVideoIngestionAppliance
 */
class CaptionSrtGeneratorAppliance extends AbstractAppliance {
	/**
	 * Create a CaptionSrtGeneratorAppliance.
	 */
	constructor(settings = {
		includeCounter: true,
	}) {
		super({
			includeCounter: true,
			...settings,
		})
		this.setOriginPosition(0)
	}

	static getInputTypes = () => [
		dataTypes.TEXT.ATOM,
		'SEGMENT.START',
	]

	static getOutputTypes = () => ['TEXT.SRT']

	/**
	 * Takes an array of TEXT.ATOM payloads to be converted into a TEXT.SRT payload.
	 *
	 * @param  {PayloadArray} payloadArray The TEXT.ATOM payloads to be converted
	 * @return {Payload}                   The resulting TEXT.SRT payload.
	 */
	generateSrtPayload = (payloadArray) => {
		this.counter += 1
		const position = payloadArray.getPosition()
		const duration = payloadArray.getDuration()
		const counterLine = (this.settings.includeCounter ? `${this.counter}\n` : '')
		const srtStartTimestamp = msToSrtTimestamp(position - this.getOriginPosition())
		const srtEndTimestamp = msToSrtTimestamp(position - this.getOriginPosition() + duration)
		const timestampLine = `${srtStartTimestamp} --> ${srtEndTimestamp}\n`
		const captionLine = payloadArray.toArray().map((payload) => payload.data).join('')
		return new Payload({
			data: `${counterLine}${timestampLine}${captionLine}`,
			type: 'TEXT.SRT',
			position,
			duration,
		})
	}

	setOriginPosition(newOriginPosition) { this.originPosition = newOriginPosition }

	getOriginPosition() { return this.originPosition }

	resetCounter = () => { this.counter = 0 }

	getCounter = () => this.counter

	/** @inheritdoc */
	audit = async () => true

	/** @inheritdoc */
	start = async () => {
		this.resetCounter()
	}

	/** @inheritdoc */
	stop = async () => {}

	/** @inheritdoc */
	invoke = async (payloadArray) => {
		const unprocessedPayloadArray = new PayloadArray()
		payloadArray.toArray().forEach((payload) => {
			switch (payload.type) {
			case 'SEGMENT.START':
				this.resetCounter()
				this.setOriginPosition(payload.position)
				break
			case dataTypes.TEXT.ATOM:
				unprocessedPayloadArray.insert(payload)
				if (payload.data.includes('\n')) {
					this.push(this.generateSrtPayload(unprocessedPayloadArray))
					unprocessedPayloadArray.empty()
				}
				break
			default:
				break
			}
		})
		return unprocessedPayloadArray
	}
}

export { CaptionSrtGeneratorAppliance }
