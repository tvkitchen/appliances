import { PassThrough } from 'stream'
import fetch from 'node-fetch'
import { AbstractVideoReceiverAppliance } from '@tvkitchen/appliance-core'

/**
 * The VideoHttpReceiverAppliance is able to process data from an HTTP video stream. It is an
 * implementation of AbstractVideoReceiverAppliance, which reads in a stream, converts it into
 * an MPEG-TS stream represented as a series of Payloads, and then emits those Payloads.
 *
 * @extends AbstractVideoReceiverAppliance
 */
class VideoHttpReceiverAppliance extends AbstractVideoReceiverAppliance {
	/**
	 * Create a VideoHttpReceiverAppliance.
	 *
	 * @param  {string} settings.url The url of the stream to be ingested
	 */
	constructor(settings) {
		super({
			url: '',
			...settings,
		})
		if (!settings.url) {
			throw new Error(
				'VideoHttpReceiverAppliance must be instantiated with a stream URL',
			)
		}
	}

	/**
	 * @inheritdoc
	 */
	getInputStream = () => {
		const stream = new PassThrough()

		fetch(this.settings.url)
			.then((response) => {
				response.body.pipe(stream)
			})
			.catch((err) => {
				stream.emit('error', err)
			})

		return stream
	}
}

export { VideoHttpReceiverAppliance }
