import { AbstractAppliance } from '@tvkitchen/appliance-core'
import {
	isHlsUrl,
	loadWebVttData,
	getRootUrl,
	convertWebVttCueToPayload,
} from './utils'
import { HlsPlaylistProcessor } from './HlsPlaylistProcessor'

/**
 * The WebVttHlsReceiverAppliance is able to convert an m3u8 URL into a stream of WebVTT strings.
 * It is an implementation of AbstractAppliance, which reads in a stream, converts it into a
 * series of Palyloads,and then emits those Payloads.
 *
 * @extends AbstractAppliance
 */
class WebVttHlsReceiverAppliance extends AbstractAppliance {

	static getInputTypes = () => []

	static getOutputTypes = () => ['TEXT.WEBVTT']
	/**
	 * Create a WebVttHlsReceiverAppliance.
	 *
	 * @param  {string} settings.url The m3u8 url to be ingested
	 */
	constructor(settings) {
		super({
			url: '',
			calculateCurrentOrigin: null,
			...settings,
		})
		if (!settings.url
		|| !isHlsUrl(settings.url)) {
			throw new Error(
				'WebVttHlsReceiverAppliance must be instantiated with an HTTP Live Streaming (HLS) URL',
			)
		}
		this.currentSegments = []
		this.refreshIntervalId = null
		this.hlsPlaylistProcessor = new HlsPlaylistProcessor({
			playlistUrl: settings.url,
			onSegment: this.processSegment,
			refreshInterval: 1000,
		})
	}

	/** @inheritdoc */
	audit = async () => true

	processSegment = async (segment) => {
		const webVttUrl = `${getRootUrl(this.settings.url)}/${segment.uri}`
		const webVttData = await loadWebVttData(webVttUrl)
		if (this.settings.calculateCurrentOrigin) {
			const currentOrigin = this.settings.calculateCurrentOrigin(
				webVttUrl,
				webVttData,
			)
			this.setCurrentOrigin(currentOrigin.toISOString())
		}
		webVttData.cues.forEach((cue) => {
			this.push(convertWebVttCueToPayload(cue))
		})
	}

	/** @inheritdoc */
	start = async () => {
		this.hlsPlaylistProcessor.start()
	}

	/** @inheritdoc */
	stop = async () => {
		this.hlsPlaylistProcessor.stop()
	}

	/** @inheritdoc */
	invoke = async (payloadArray) => payloadArray

}

export { WebVttHlsReceiverAppliance }
