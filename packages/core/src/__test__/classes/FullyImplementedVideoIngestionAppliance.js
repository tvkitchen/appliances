import { AbstractVideoIngestionAppliance } from '../../AbstractVideoIngestionAppliance'

class FullyImplementedVideoIngestionAppliance extends AbstractVideoIngestionAppliance {
	constructor(settings = {}) {
		super(settings)
		this.readableStream = settings.readableStream
	}

	getInputStream() {
		return this.readableStream
	}
}

export { FullyImplementedVideoIngestionAppliance }
