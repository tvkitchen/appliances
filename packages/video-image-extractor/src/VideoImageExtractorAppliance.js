import { spawn } from 'child_process'
import commandExists from 'command-exists'
import { AbstractAppliance } from '@tvkitchen/appliance-core'
import {
	PayloadArray,
	Payload,
} from '@tvkitchen/base-classes'
import { dataTypes } from '@tvkitchen/base-constants'
import pngSplitStream from 'png-split-stream'

/**
 * The VideoImageExtractorAppliance converts a video stream into a stream of
 * png images.
 *
 * @extends AbstractVideoIngestionAppliance
 */
class VideoImageExtractorAppliance extends AbstractAppliance {
	ffmpegProcess = null

	/**
	 * Create a VideoImageExtractorAppliance.
	 */
	constructor(settings = {}) {
		super(settings)
	}

	static getInputTypes = () => [dataTypes.STREAM.CONTAINER]

	static getOutputTypes = () => ['IMAGE.PNG']

	/**
	 * Process a line of ccextractor output and emit new Payloads as appropriate.
	 *
	 * @param  {Buffer} data The raw output from a ccextractor process.
	 * @return {null}
	 */
	handlePngSplitStreamData = (data) => {
		const payload = new Payload({
			data: data,
			type: 'IMAGE.PNG',
			// position: start,
			// duration: end - start,
		})
		this.push(payload)
	}

	/** @inheritdoc */
	audit = async () => {
		let passed = true
		if (!commandExists.sync('ffmpeg')) {
			passed = false
			this.logger.error('FFmpeg must be installed and the `ffmpeg` command must work.')
		}
		return passed
	}

	/** @inheritdoc */
	start = async () => {
		this.ffmpegProcess = spawn(
			'ffmpeg',
			[
				'-i', '-',
				'-f', 'image2pipe',
				'-vcodec', 'png',
				'-',
			],
			{ stdio: ['pipe', 'pipe', 'ignore'] },
		)
		this.ffmpegProcess.stdout
			.pipe(pngSplitStream())
			.on('data', this.handlePngSplitStreamData)
	}

	/** @inheritdoc */
	stop = async () => {
		if (this.ffmpegProcess !== null) {
			this.ffmpegProcess.kill()
		}
	}

	/** @inheritdoc */
	invoke = async (payloadArray) => {
		const unprocessedPayloadArray = new PayloadArray()
		const streamContainerPayloads = payloadArray.filterByType(dataTypes.STREAM.CONTAINER)
		streamContainerPayloads.toArray().forEach((payload) => {
			this.ffmpegProcess.stdin.write(payload.data)
		})
		return unprocessedPayloadArray
	}
}

export { VideoImageExtractorAppliance }
