import { Payload } from '@tvkitchen/base-classes'
import { dataTypes } from '@tvkitchen/base-constants'
import { CCExtractorLine } from '../CCExtractorLine'
import { generateNewlineTextAtomPayload } from './payload'

/**
 * Converts a ccextractor timestamp (HH:MM:SS,MS) to milliseconds.
 *
 * @param  {String} str The string timestamp in ccextractor's timestamp format.
 * @return {Number}     The number of milliseconds represented by that timestamp.
 */
export const ccExtractorTimestampToMs = (str) => {
	const [
		timestamp,
		milliseconds,
	] = str.split(',')
	const [
		hours,
		minutes,
		seconds,
	] = timestamp.split(':')
	return (parseInt(hours, 10) * 3600000
		+ parseInt(minutes, 10) * 60000
		+ parseInt(seconds, 10) * 1000
		+ parseInt(milliseconds, 10)
	)
}

/**
 * Parses a line of output from CCExtractor using our custom configured format.
 *
 * The format parsed is assuming the following CCExtractor parameters
 *
 * - `-out=txt`
 * - `-customtxt 1100100`
 *
 * @param  {String} line     The raw output to be parsed.
 * @return {CCExtractorLine} The parsed line.
 */
export const parseCcExtractorLine = (line) => {
	const parts = line.split('|')
	if (parts.length !== 3) {
		throw new Error('Cannot parse an invalid CCExtractor line')
	}
	return new CCExtractorLine({
		start: ccExtractorTimestampToMs(parts[0]),
		end: ccExtractorTimestampToMs(parts[1]),
		text: parts[2],
	})
}

/**
 * Parses ccextractor output containing multiple lines using our custom configured format.
 *
 * See the documentation of `parseLine` for more information on that format.
 *
 * @param  {String} str        The string to be parsed.
 * @return {CCExtractorLine[]} The parsed lines.
 */
export const parseCcExtractorLines = (str) => str
	.replace(/\r\n/g, '\n')
	.split('\n')
	.map((line) => {
		try {
			return parseCcExtractorLine(line)
		} catch (err) {
			return null
		}
	})
	.filter((line) => line !== null)

/**
 * Takes a CCExtractorLine and generates a series of TEXT.ATOM payloads.
 *
 * The timing of the payloads will be evenly distribted between the start and end
 * of the CCExtractorLine.
 *
 * Since this is converting a line, it will include an additional newline payload immediately after
 * the final character to signal the end of the line's data in the payload stream.
 *
 * @param  {CCExtractorLine} The CCEXtractorLine to process
 * @return {Payload[]}       An array of resulting TEXT.ATOM payloads.
 */
export const convertCcExtractorLineToPayloads = (line) => {
	const atomCount = line.text.length
	const lineDuration = line.end - line.start
	const atomDuration = lineDuration / atomCount
	const payloads = Array.from(line.text)
		.map((atom, index) => new Payload({
			data: atom,
			type: dataTypes.TEXT.ATOM,
			position: Math.trunc(line.start + atomDuration * index),
			duration: Math.trunc(atomDuration),
		}))
	payloads.push(generateNewlineTextAtomPayload(line.end))
	return payloads
}
