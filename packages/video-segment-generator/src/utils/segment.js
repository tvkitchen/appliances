import dayjs from 'dayjs'
import { Payload } from '@tvkitchen/base-classes'
import { INTERVALS } from '../constants'

/**
 * Calculates the position associated with the origin time when compared to a reference
 * position / timestamp pair.  This origin position might be negative (e.g. if the origin
 * happened before the start of the reference stream)
 *
 * @param  {String} originTimestamp    The ISO string associated with the origin time.
 * @param  {String} referenceTimestamp The ISO string associated with the reference time.
 * @param  {Number} referencePosition  The payload associated with th ereference time.
 * @return {Number}                    The origin payload when compared to the reference stream.
 */
export const calculateOriginPosition = (originTimestamp, referenceTimestamp, referencePosition) => (
	dayjs(originTimestamp).diff(dayjs(referenceTimestamp)) + referencePosition
)

/**
 * Generates a complete set of payments for the period starting at a given position.
 *
 * Segments can either be represented as an integer (the offset) or as an object with offset
 * and data values.
 *
 * @param  {Number} periodPosition The start position for the period.
 * @param  {object[]} segments     The segments being used to generate payloads.
 * @return {Payload[]}             The resulting segment payloads.
 */
export const generatePeriodSegmentPayloads = (periodPosition, segments) => segments.map(
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
 * @param  {Number} position       The position being checked
 * @param  {Number} originPosition The starting position of the first period
 * @param  {Number} interval       The period interval size
 * @return {Number}                The starting position of the containing period
 */
export const getPeriodPosition = (position, originPosition, interval) => (
	(interval === INTERVALS.INFINITE)
		? originPosition
		: Math.floor((position - originPosition) / interval) * interval + originPosition
)

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
 * @param  {Number} startPosition  The earliest segment position to generate.
 * @param  {Number} endPosition    The latest segment position to generate.
 * @param  {Number} originPosition The origin position, used to calculate segment positions.
 * @param  {Number} interval       The interval being used to generate segment sets.
 * @param  {object[]} segments     The segments being generated.
 * @return {Payload[]}             The resulting Payloads
 */
export const generatePositionRangeSegmentPayloads = (
	startPosition,
	endPosition,
	originPosition,
	interval,
	segments,
) => {
	let segmentPayloads = []
	if (interval === INTERVALS.INFINITE) {
		segmentPayloads = generatePeriodSegmentPayloads(originPosition, segments)
	} else {
		const startPeriodPosition = getPeriodPosition(startPosition, originPosition, interval)
		const endPeriodPosition = getPeriodPosition(endPosition, originPosition, interval)
		const periodCount = Math.floor((endPeriodPosition - startPeriodPosition) / interval) + 1
		const periodPositions = range(startPeriodPosition, periodCount, interval)
		segmentPayloads = periodPositions.flatMap(
			(periodPosition) => generatePeriodSegmentPayloads(periodPosition, segments),
		)
	}
	return segmentPayloads.filter((segment) => (
		segment.position >= startPosition
		&& segment.position <= endPosition
	))
}
