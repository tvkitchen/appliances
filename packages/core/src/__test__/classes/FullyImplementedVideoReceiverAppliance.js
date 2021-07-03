import { AbstractVideoReceiverAppliance } from '../../AbstractVideoReceiverAppliance'

class FullyImplementedVideoReceiverAppliance extends AbstractVideoReceiverAppliance {
	constructor(settings = {}) {
		super(settings)
		this.readableStream = settings.readableStream
	}

	getInputStream() {
		return this.readableStream
	}
}

export { FullyImplementedVideoReceiverAppliance }
