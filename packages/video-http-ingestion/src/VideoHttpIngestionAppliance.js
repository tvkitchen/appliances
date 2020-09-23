import { PassThrough } from 'stream'
import fetch from 'node-fetch'
import { AbstractVideoIngestionAppliance } from '@tvkitchen/appliance-core'

/**
 * The VideoHttpIngestionAppliance handles processing a HTTP video stream. It is a concrete
 * implementation of AbstractIngestionAppliance, which reads in a stream, converts it into
 * an MPEG-TS stream represented as a series of Payloads, and then emits those Payloads.
 *
 * @extends AbstractVideoIngestionAppliance
 */
class VideoHttpIngestionAppliance extends AbstractVideoIngestionAppliance {
	/**
	 * Create a VideoHttpIngestionEngine.
	 *
	 * @param  {string} settings.url The url of the stream to be ingested
	 */
	constructor(settings = {
		url: '',
	}) {
		super(settings)
		if (!settings.url) {
			throw new Error(
				'HttpIngestionAppliance must be instantiated with a stream URL',
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

export { VideoHttpIngestionAppliance }
