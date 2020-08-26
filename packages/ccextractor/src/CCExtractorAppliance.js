import { spawn } from 'child_process'
import commandExists from 'command-exists'
import {
	PayloadArray,
} from '@tvkitchen/base-classes'
import {
	dataTypes,
	applianceEvents,
} from '@tvkitchen/base-constants'
import { AbstractAppliance } from '@tvkitchen/appliance-core'
import {
	parseCcExtractorLines,
	convertCcExtractorLineToPayload,
} from './utils/ccextractor'

class CaptionAppliance extends AbstractAppliance {
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
			.map((line) => {
				const previousLine = this.mostRecentLine
				this.mostRecentLine = line
				return convertCcExtractorLineToPayload(line, previousLine)
			})
			.filter((payload) => payload.data !== '')
		payloads.forEach((payload) => this.emit(applianceEvents.PAYLOAD, payload))
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
		this.emit(applianceEvents.STARTING)
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
		this.emit(applianceEvents.READY)
	}

	/** @inheritdoc */
	stop = async () => {
		this.emit(applianceEvents.STOPPING)
		if (this.ccExtractorProcess !== null) {
			this.ccExtractorProcess.kill()
		}
		this.emit(applianceEvents.STOPPED)
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

export default CaptionAppliance
