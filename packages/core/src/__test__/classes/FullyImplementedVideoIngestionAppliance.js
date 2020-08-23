import AbstractVideoIngestionAppliance from '../../AbstractVideoIngestionAppliance'

class FullyImplementedVideoIngestionAppliance extends AbstractVideoIngestionAppliance {
	constructor(readableStream) {
		super()
		this.readableStream = readableStream
	}

	getInputStream = () => this.readableStream
}

export default FullyImplementedVideoIngestionAppliance
