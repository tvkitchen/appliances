import { AbstractAppliance } from '@tvkitchen/appliance-core'
import { INTERVALS } from './constants'
import {
	calculateOriginPosition,
	generatePositionRangeSegmentPayloads,
	getPeriodPosition,
} from './utils/segment'

/**
 * The VideoSegmentGeneratorAppliance creates new segments based on the timestamps of a payload
 * stream.
 *
 * @extends AbstractAppliance
 */
class VideoSegmentGeneratorAppliance extends AbstractAppliance {
	/**
	 * Create a VideoSegmentGeneratorAppliance.
	 */
	constructor(settings) {
		super({
			interval: INTERVALS.INFINITE,
			origin: (new Date()).toISOString(),
			segments: [0],
			...settings,
		})
		this.latestSegmentPayload = null
	}

	static getInputTypes = () => ['STREAM.CONTAINER']

	static getOutputTypes = () => ['SEGMENT.START']

	/** @inheritdoc */
	audit = async () => true

	/** @inheritdoc */
	start = async () => {}

	/** @inheritdoc */
	stop = async () => {}

	/** @inheritdoc */
	invoke = async (payloadArray) => {
		const originPosition = calculateOriginPosition(
			this.settings.origin,
			payloadArray.getTimestamp(),
			payloadArray.getPosition(),
		)
		const endPosition = payloadArray.getPosition() + payloadArray.getDuration()
		const startPosition = (this.latestSegmentPayload !== null)
			? this.latestSegmentPayload.position + 1
			: getPeriodPosition(0, originPosition, this.settings.interval)
		const segmentPayloads = generatePositionRangeSegmentPayloads(
			startPosition,
			endPosition,
			originPosition,
			this.settings.interval,
			this.settings.segments,
		)
		segmentPayloads.forEach((segmentPayload) => this.push(segmentPayload))
		if (segmentPayloads.length > 0) {
			[this.latestSegmentPayload] = segmentPayloads.slice(-1)
		}
		return null
	}
}

export { VideoSegmentGeneratorAppliance }
