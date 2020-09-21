import { spawn } from 'child_process'
import {
	pipeline,
	Writable,
	Transform,
} from 'stream'
import commandExists from 'command-exists'
import { Payload } from '@tvkitchen/base-classes'
import {
	dataTypes,
	applianceEvents,
} from '@tvkitchen/base-constants'
import {
	AbstractInstantiationError,
	NotImplementedError,
} from '@tvkitchen/base-errors'
import { TSDemuxer } from 'ts-demuxer'
import AbstractAppliance from './AbstractAppliance'
import {
	tsToMilliseconds,
	generateEmptyPacket,
} from './utils/mpegts'

/**
 * An AbstractVideoIngestionAppliance provides generic functionality for converting an arbitrary
 * video input stream into VIDEO.CONTAINER payloads.
 *
 * We decided to make this a core abstract class that other appliances could extend because
 * ingesting video from different types of source in a normalized way is a core aspect of TV
 * Kitchen functionality.
 */
class AbstractVideoIngestionAppliance extends AbstractAppliance {
	// The FFmpeg process used to wrap the ingestion stream in an MPEG-TS container
	ffmpegProcess = null

	// The ingestion stream consumed by this engine, started by `start()` and stopped by `stop()`
	activeInputStream = null

	// Utility for processing the MPEG-TS stream produced by ffmpeg
	mpegtsDemuxer = null

	// A shim variable that allows us to use the output of TSDemuxer in our engine
	mostRecentDemuxedPacket = null

	// A Transformation stream that will convert MPEG-TS data into TV Kitchen Payloads
	mpegtsProcessingStream = null

	// A Writeable stream that will ingest Payloads into the TV Kitchen pipeline.
	payloadIngestionStream = null

	constructor(settings = {}) {
		super(settings)
		if (this.constructor === AbstractVideoIngestionAppliance) {
			throw new AbstractInstantiationError(this.constructor.name)
		}

		this.mpegtsDemuxer = new TSDemuxer(this.onDemuxedPacket)

		this.mpegtsProcessingStream = Transform({
			objectMode: true,
			transform: this.processMpegtsStreamData,
		})

		this.payloadIngestionStream = Writable({
			objectMode: true,
			write: (payload, enc, done) => {
				this.emit(applianceEvents.PAYLOAD, payload)
				done()
			},
		})
	}

	/**
	 * Returns an FFmpeg settings array for this ingestion engine.
	 *
	 * @return {String[]} A list of FFmpeg command line parameters
	 */
	getFfmpegSettings = () => [
		'-loglevel', 'quiet',
		'-i', '-',
		'-codec', 'copy',
		'-f', 'mpegts',
		'-',
	]

	/**
	 * The ReadableStream that is being ingested by the ingestion engine.
	 *
	 * NOTE: THIS MUST BE IMPLEMENTED
	 *
	 * @return {ReadableStream} The stream of data to be ingested by the ingestion engine
	 */
	getInputStream = () => {
		throw new NotImplementedError('getInputStream')
	}

	/**
	 * Updates ingestion state based on the latest demuxed packet data.
	 *
	 * This method is called by our MPEG-TS demuxer, and allows the ingestion engine to track
	 * the most recent demuxed packet.
	 *
	 * @param  {Packet} packet The latest TSDemuxer Packet object
	 */
	onDemuxedPacket = (packet) => {
		this.mostRecentDemuxedPacket = packet
	}

	/**
	 * Returns the most recent coherent stream packet processed by the ingestion engine.
	 * This packet is lower level than the MPEG-TS container, and represents an audio or video
	 * packet demuxed from the MPEG-TS stream.
	 *
	 * @return {Packet} The most recent Packet object extracted by TSDemuxer
	 */
	getMostRecentDemuxedPacket = () => this.mostRecentDemuxedPacket

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
	processMpegtsStreamData = (mpegtsData, enc, done) => {
		this.mpegtsDemuxer.process(mpegtsData)
		const demuxedPacket = this.getMostRecentDemuxedPacket() || generateEmptyPacket()
		const payload = new Payload({
			data: mpegtsData,
			type: dataTypes.STREAM.CONTAINER,
			duration: 0,
			position: tsToMilliseconds(demuxedPacket.pts),
			createdAt: (new Date()).toISOString(),
		})
		done(null, payload)
	}

	/** @inheritdoc */
	isValidPayload = async () => true

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
		this.emit(applianceEvents.STARTING)
		this.ffmpegProcess = spawn(
			'ffmpeg',
			this.getFfmpegSettings(),
			{ stdio: ['pipe', 'pipe', 'ignore'] },
		)
		this.activeInputStream = this.getInputStream()

		this.logger.info(`Starting ingestion from ${this.constructor.name}...`)
		this.activeInputStream.pipe(this.ffmpegProcess.stdin)
		pipeline(
			this.ffmpegProcess.stdout,
			this.mpegtsProcessingStream,
			this.payloadIngestionStream,
			() => this.stop(),
		)
		this.emit(applianceEvents.READY)
		return true
	}

	/** @inheritdoc */
	stop = async () => {
		this.emit(applianceEvents.STOPPING)
		if (this.activeInputStream !== null) {
			this.activeInputStream.destroy()
		}
		if (this.ffmpegProcess !== null) {
			this.ffmpegProcess.kill()
		}
		this.logger.info(`Ended ingestion from ${this.constructor.name}...`)
		this.emit(applianceEvents.STOPPED)
		return true
	}

	/** @inheritdoc */
	invoke = async () => {
		throw new Error('Ingestion Appliances cannot be invoked.')
	}

	/** @inheritdoc */
	static getInputTypes = () => []

	/** @inheritdoc */
	static getOutputTypes = () => [dataTypes.STREAM.CONTAINER]
}

export default AbstractVideoIngestionAppliance
