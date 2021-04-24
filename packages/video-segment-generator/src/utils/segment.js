import dayjs from 'dayjs'
import { Payload } from '@tvkitchen/base-classes'
import { INTERVALS } from '../constants'

/**
 * Calculates the interal segmenter position associated with a given frame's zero reference.
 * This starting position might be negative (e.g. if the zero reference happened before
 * the start of the reference stream).
 *
 * @param  {String} startingTimestamp      The ISO string associated with the segmenter internal
 *                                         zero position.
 * @param  {String} zeroReferenceTimestamp The ISO string associated with an external zero position.
 * @return {Number}                        The position associated with the segmenter's start.
 */
export const calculateStartingPosition = (startingTimestamp, zeroReferenceTimestamp) => (
	dayjs(startingTimestamp).diff(dayjs(zeroReferenceTimestamp))
)

/**
 * Generates a complete set of payments starting from a given position.
 *
 * Segments can either be represented as an integer (the offset) or as an object with offset
 * and data values.
 *
 * @param  {Number} periodPosition The start position for the period.
 * @param  {object[]} segments     The segments being used to generate payloads.
 * @return {Payload[]}             The resulting segment payloads.
 */
export const generateSegmentPayloadsFromPosition = (periodPosition, segments) => segments.map(
	(segment) => {
		const data = Number.isInteger(segment) ? null : Buffer.from(JSON.stringify(segment.data))
		const offset = Number.isInteger(segment) ? segment : segment.offset
		return new Payload({
			data,
			type: 'SEGMENT.START',
			position: periodPosition + offset,
			duration: 0,
		})
	},
)

/**
 * Returns the starting position of the period that contains the input position.
 *
 * A zero value for interval will always return the originPosition.
 *
 * @param  {Number} position                  The position being checked
 * @param  {Number} segmenterStartingPosition The starting position of the first period
 * @param  {Number} interval                  The period interval size
 * @return {Number}                           The starting position of the containing period
 */
export const getPeriodPosition = (position, segmenterStartingPosition, interval) => {
	if (interval === INTERVALS.INFINITE) {
		return segmenterStartingPosition
	}
	const offsetPosition = Math.floor((position - segmenterStartingPosition) / interval) * interval
	return segmenterStartingPosition + offsetPosition
}


/**
 * Creates an array of values.
 * @param  {Number} start The first value to create.
 * @param  {Number} count The number of values to create.
 * @param  {Number} step) The increment between each value.
 * @return {Number[]}     The resulting array of values
 */
const range = (start, count, step) => Array.from(
	{ length: count },
	(_, i) => start + i * step,
)

/**
 * Create a sequence of segment payloads for a range of stream positions.
 *
 * If the position range spans multiple periods, segments will be generated for each period.
 *
 * An interval of 0 means an infinite interval, and the originPosition will be used as the
 * starting point.
 *
 * The start and end position are inclusive, which means that segments whose positions match
 * the start or end position will be included in the result.
 *
 * @param  {Number} rangeStartPosition        The earliest segment position to generate.
 * @param  {Number} rangeEndPosition          The latest segment position to generate.
 * @param  {Number} segmenterStartingPosition The zero position of the segmenter.
 * @param  {Number} interval                  The interval being used to generate segment sets.
 * @param  {object[]} segments                The segments being generated.
 * @return {Payload[]}                        The resulting Payloads
 */
export const generateSegmentPayloadsForPositionRange = (
	rangeStartPosition,
	rangeEndPosition,
	segmenterStartingPosition,
	interval,
	segments,
) => {
	let segmentPayloads = []
	if (interval === INTERVALS.INFINITE) {
		segmentPayloads = generateSegmentPayloadsFromPosition(
			segmenterStartingPosition,
			segments,
		)
	} else {
		const startPeriodPosition = getPeriodPosition(
			rangeStartPosition,
			segmenterStartingPosition,
			interval,
		)
		const endPeriodPosition = getPeriodPosition(
			rangeEndPosition,
			segmenterStartingPosition,
			interval,
		)
		const periodCount = Math.floor((endPeriodPosition - startPeriodPosition) / interval) + 1
		const periodPositions = range(startPeriodPosition, periodCount, interval)
		segmentPayloads = periodPositions.flatMap(
			(periodPosition) => generateSegmentPayloadsFromPosition(periodPosition, segments),
		)
	}
	return segmentPayloads.filter((segment) => (
		segment.position >= rangeStartPosition
		&& segment.position <= rangeEndPosition
	))
}
