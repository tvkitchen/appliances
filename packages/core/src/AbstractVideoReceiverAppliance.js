import { spawn } from 'child_process'
import {
	pipeline,
	Writable,
	Transform,
} from 'stream'
import commandExists from 'command-exists'
import { Payload } from '@tvkitchen/base-classes'
import { dataTypes } from '@tvkitchen/base-constants'
import {
	AbstractInstantiationError,
	NotImplementedError,
} from '@tvkitchen/base-errors'
import { MpegTsDemuxer } from 'mpegts-demuxer'
import { AbstractAppliance } from './AbstractAppliance'
import {
	tsToMilliseconds,
	generateEmptyPacket,
	areDiscontinuousPositions,
	getRolloverTimestamp,
} from './utils/mpegts'

// This is defined in the demuxer we're using, but it is
// not exported so we have to re-define it here.
const MPEGTS_CONTENT_TYPE_VIDEO = 2

/**
 * An AbstractVideoReceiverAppliance provides generic functionality for converting an arbitrary
 * video input stream into VIDEO.CONTAINER payloads.
 *
 * We decided to make this a core abstract class that other appliances could extend because
 * receiving video from different types of source in a normalized way is a core aspect of TV
 * Kitchen functionality.
 */
class AbstractVideoReceiverAppliance extends AbstractAppliance {
	// The FFmpeg process used to wrap the input stream in an MPEG-TS container
	ffmpegProcess = null

	// The stream consumed by this engine, started by `start()` and stopped by `stop()`
	activeInputStream = null

	// Utility for processing the MPEG-TS stream produced by ffmpeg
	mpegTsDemuxer = null

	// A shim variable that allows us to use the output of TSDemuxer in our engine
	mostRecentDemuxedVideoPacket = null

	// A Transformation stream that will convert MPEG-TS data into TV Kitchen Payloads
	mpegtsProcessingStream = null

	// A Writeable stream that will receive Payloads into the TV Kitchen pipeline.
	payloadReceiverStream = null

	// The number of times the TS stream has rolled over it's timestamps
	// This happens once every 2^33 / 90000 MS
	rolloverCount = 0

	// A tracker for the most recent position emitted by the MPEG-TS demuxer
	latestPosition = 0

	// A tracker for the most recent MPEG-TS origin point, accounting for rollovers
	rolloverOrigin = ''

	/**
	* Create a AbstractVideoReceiverAppliance.
	*
	* @param  {String} settings.origin The ISO timestamp that marks the absoulte time associated
	*                                  with position 0.
	*/
	constructor(settings = {}) {
		super({
			origin: (new Date()).toISOString(),
			...settings,
		})
		if (this.constructor === AbstractVideoReceiverAppliance) {
			throw new AbstractInstantiationError(this.constructor.name)
		}

		this.rolloverOrigin = this.settings.origin
		this.mpegTsDemuxer = new MpegTsDemuxer()
		this.mpegTsDemuxer.on(
			'data',
			this.onDemuxedPacket.bind(this),
		)

		this.mpegtsProcessingStream = Transform({
			objectMode: true,
			transform: this.processMpegtsStreamData.bind(this),
		})

		this.payloadReceiverStream = Writable({
			objectMode: true,
			write: (payload, enc, done) => {
				this.push(payload)
				done()
			},
		})
	}

	/**
	 * Returns an FFmpeg settings array for this receiver appliance.
	 *
	 * @return {String[]} A list of FFmpeg command line parameters
	 */
	static getFfmpegSettings() {
		return [
			'-loglevel', 'quiet',
			'-err_detect', 'aggressive',
			'-fflags', 'discardcorrupt',
			'-i', '-',
			'-codec', 'copy',
			'-f', 'mpegts',
			'-',
		]
	}

	/**
	 * The ReadableStream that is being consumed by the receiver appliance.
	 *
	 * NOTE: THIS MUST BE IMPLEMENTED
	 *
	 * @return {ReadableStream} The stream of data to be consumed by the receiver appliance
	 */
	// eslint-disable-next-line class-methods-use-this
	getInputStream() {
		throw new NotImplementedError('getInputStream')
	}

	/**
	 * Updates receiver state based on the latest demuxed video packet data.
	 *
	 * This method is called by our MPEG-TS demuxer, and allows the receiver appliance to track
	 * the most recent demuxed video packet.
	 *
	 * @param  {Packet} packet The latest TSDemuxer Packet object
	 */
	onDemuxedPacket(packet) {
		if (packet.content_type === MPEGTS_CONTENT_TYPE_VIDEO) {
			this.mostRecentDemuxedVideoPacket = packet
		}
	}

	/**
	 * Returns the most recent coherent stream packet processed by the receiver appliance.
	 * This packet is lower level than the MPEG-TS container, and represents an audio or video
	 * packet demuxed from the MPEG-TS stream.
	 *
	 * @return {Packet} The most recent Packet object extracted by TSDemuxer
	 */
	getMostRecentDemuxedVideoPacket() {
		return this.mostRecentDemuxedVideoPacket
	}

	/**
	 * Process a new chunk of data from an MPEG-TS stream. The chunks passed to this
	 * function should be presented sequentially, and combine to form a coherent MPEG-TS
	 * data stream, but they can be of arbitrary size.
	 *
	 * This method is called by a NodeJS Transform stream and so matches that spec.
	 *
	 * @param  {Buffer} mpegtsData The latest sequential chunk of MPEG-TS data
	 * @param  {String} enc        The encoding of the passed data
	 * @param  {Function(err,result)} done     A `(err, result) => ...` callback
	 *
	 */
	processMpegtsStreamData(mpegtsData, enc, done) {
		this.mpegTsDemuxer.write(mpegtsData)
		const demuxedVideoPacket = this.getMostRecentDemuxedVideoPacket() || generateEmptyPacket()
		const newPosition = tsToMilliseconds(demuxedVideoPacket.pts)

		if (areDiscontinuousPositions(this.latestPosition, newPosition)) {
			this.rolloverCount += 1
			this.rolloverOrigin = getRolloverTimestamp(
				this.settings.origin,
				this.rolloverCount,
			)
		}
		this.latestPosition = newPosition

		const payload = new Payload({
			data: mpegtsData,
			type: dataTypes.STREAM.CONTAINER,
			duration: 0,
			position: this.latestPosition,
			createdAt: (new Date()).toISOString(),
			origin: this.rolloverOrigin,
		})
		done(null, payload)
	}

	/** @inheritdoc */
	// eslint-disable-next-line class-methods-use-this
	async isValidPayload() {
		return true
	}

	/** @inheritdoc */
	async audit() {
		let passed = true
		if (!commandExists.sync('ffmpeg')) {
			passed = false
			this.logger.error('FFmpeg must be installed and the `ffmpeg` command must work.')
		}
		return passed
	}

	/** @inheritdoc */
	async start() {
		this.ffmpegProcess = spawn(
			'ffmpeg',
			this.constructor.getFfmpegSettings(),
			{ stdio: ['pipe', 'pipe', 'ignore'] },
		)
		this.activeInputStream = this.getInputStream()

		this.logger.info(`Starting receiving data from ${this.constructor.name}...`)
		this.activeInputStream.pipe(this.ffmpegProcess.stdin)
		pipeline(
			this.ffmpegProcess.stdout,
			this.mpegtsProcessingStream,
			this.payloadReceiverStream,
			() => this.stop(),
		)
		return true
	}

	/** @inheritdoc */
	async stop() {
		if (this.activeInputStream !== null) {
			this.activeInputStream.destroy()
		}
		if (this.ffmpegProcess !== null) {
			this.ffmpegProcess.kill()
		}
		this.logger.info(`Stopped receiving data from ${this.constructor.name}...`)
		return true
	}

	/** @inheritdoc */
	// eslint-disable-next-line class-methods-use-this
	async invoke() {
		throw new Error('Receiver Appliances cannot be invoked.')
	}

	/** @inheritdoc */
	static getInputTypes() {
		return []
	}

	/** @inheritdoc */
	static getOutputTypes() {
		return [dataTypes.STREAM.CONTAINER]
	}
}

export { AbstractVideoReceiverAppliance }
