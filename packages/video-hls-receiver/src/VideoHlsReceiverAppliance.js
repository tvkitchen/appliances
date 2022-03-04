import { AbstractVideoReceiverAppliance } from '@tvkitchen/appliance-core'
import { isHlsUrl } from './utils'

/**
 * The VideoHlsReceiverAppliance is able to convert an m3u8 URL into a video stream. It is an
 * implementation of AbstractVideoReceiverAppliance, which reads in a stream, converts it into
 * an MPEG-TS stream represented as a series of Payloads, and then emits those Payloads.
 *
 * @extends AbstractVideoReceiverAppliance
 */
class VideoHlsReceiverAppliance extends AbstractVideoReceiverAppliance {
	/**
	 * Create a VideoHlsReceiverAppliance.
	 *
	 * @param  {string} settings.url The m3u8 url to be ingested
	 */
	constructor(settings) {
		super({
			url: '',
			...settings,
		})
		if (!settings.url
		|| !isHlsUrl(settings.url)) {
			throw new Error(
				'VideoHlsReceiverAppliance must be instantiated with an HTTP Live Streaming (HLS) URL',
			)
		}
	}

	/**
	 * @inheritdoc
	 */
	getInputStream = () => {
		const ffmpegProcess = spawn(
			'ffmpeg',
			[
				'-loglevel', 'quiet',
				'-i', this.settings.url,
				'-codec', 'copy',
				'-f', 'mpegts',
				'-',
			],
			{ stdio: ['pipe', 'pipe', 'ignore'] },
		)
		return ffmpegProcess.stdout
	}
}

export { VideoHlsReceiverAppliance }
