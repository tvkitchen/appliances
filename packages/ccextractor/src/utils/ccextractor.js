import { Payload } from '@tvkitchen/base-classes'
import { dataTypes } from '@tvkitchen/base-constants'
import { CCExtractorLine } from '../CCExtractorLine'
import { getDiff } from './string'

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
 * Takes a pair of CCExtractorLines and generates a payload based on their
 * differences.
 *
 * @param  {CCExtractorLine} line         [description]
 * @param  {CCExtractorLine} previousLine [description]
 * @return {[type]}      [description]
 */
export const convertCcExtractorLineToPayloads = (line, previousLine = null) => {
	const newCharacters = getDiff(line.text, previousLine ? previousLine.text : '')
	const isNewLine = (newCharacters === line.text)
	const start = previousLine ? previousLine.end : line.start
	const { end } = line
	const payloads = []
	if (isNewLine && previousLine !== null) {
		payloads.push(new Payload({
			data: '\n',
			type: dataTypes.TEXT.ATOM,
			position: start,
			duration: 0,
		}))
	}
	payloads.push(new Payload({
		data: newCharacters,
		type: dataTypes.TEXT.ATOM,
		position: start,
		duration: end - start,
	}))
	return payloads
}
