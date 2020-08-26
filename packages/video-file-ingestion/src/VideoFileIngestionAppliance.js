import fs from 'fs'
import { applianceEvents } from '@tvkitchen/base-constants'
import { AbstractVideoIngestionAppliance } from '@tvkitchen/appliance-core'

class VideoFileIngestionAppliance extends AbstractVideoIngestionAppliance {
	/**
	* Create a VideoFileIngestionEngine.
	*
	* @param  {String} settings.filePath The path of the file to be ingested.
	*/
	constructor(settings = {
		filePath: '',
	}) {
		super(settings)
		if (!settings.filePath) {
			throw new Error('VideoFileIngestionAppliances must be instantiated with a configured filePath.')
		}
	}

	/** @inheritdoc */
	getInputStream = () => fs.createReadStream(this.settings.filePath)

	/** @inheritdoc */
	start = async () => {
		this.emit(applianceEvents.STARTING)
		await super.start()
		this.emit(applianceEvents.READY)
	}

	/** @inheritdoc */
	stop = async () => {
		this.emit(applianceEvents.STOPPING)
		await super.stop()
		this.emit(applianceEvents.STOPPED)
	}
}

export default VideoFileIngestionAppliance
