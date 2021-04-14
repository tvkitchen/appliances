import { spawn } from 'child_process'
import commandExists from 'command-exists'
import {
	PayloadArray,
} from '@tvkitchen/base-classes'
import { dataTypes } from '@tvkitchen/base-constants'
import { AbstractAppliance } from '@tvkitchen/appliance-core'
import {
	parseCcExtractorLines,
	convertCcExtractorLineToPayloads,
} from './utils/ccextractor'

class VideoCaptionExtractorAppliance extends AbstractAppliance {
	ccExtractorProcess = null

	mostRecentLine = null

	static getInputTypes = () => [dataTypes.STREAM.CONTAINER]

	static getOutputTypes = () => [dataTypes.TEXT.ATOM]

	/**
	 * Process a line of ccextractor output and emit new Payloads as appropriate.
	 *
	 * @param  {Buffer} data The raw output from a ccextractor process.
	 * @return {null}
	 */
	handleCcExtractorData = (data) => {
		const lines = parseCcExtractorLines(data.toString())
		const payloads = lines
			.filter((line) => line.text !== '')
			.flatMap((line) => {
				const previousLine = this.mostRecentLine
				this.mostRecentLine = line
				return convertCcExtractorLineToPayloads(line, previousLine)
			})
			.filter((payload) => payload.data !== '')
		payloads.forEach((payload) => this.push(payload))
	}

	/** @inheritdoc */
	audit = async () => {
		let passed = true
		if (!commandExists.sync('ccextractor')) {
			passed = false
			this.logger.error('CCExtractor must be installed and the `ccextractor` command must work.')
		}
		return passed
	}

	/** @inheritdoc */
	start = async () => {
		this.ccExtractorProcess = spawn('ccextractor', [
			'-stdout',
			'--stream',
			'-out=txt',
			'-dru', // output characters as they arrive
			'-ru1', // only render the current line
			'-customtxt', '1100100', // start time, end time, use relative timestamp
			'-',
		])
		this.ccExtractorProcess.stdout.on('data', this.handleCcExtractorData)
	}

	/** @inheritdoc */
	stop = async () => {
		if (this.ccExtractorProcess !== null) {
			this.ccExtractorProcess.kill()
		}
	}

	/** @inheritdoc */
	invoke = async (payloadArray) => {
		const unprocessedPayloadArray = new PayloadArray()
		const streamContainerPayloads = payloadArray.filterByType(dataTypes.STREAM.CONTAINER)
		streamContainerPayloads.toArray().forEach((payload) => {
			this.ccExtractorProcess.stdin.write(payload.data)
		})
		return unprocessedPayloadArray
	}
}

export { VideoCaptionExtractorAppliance }
