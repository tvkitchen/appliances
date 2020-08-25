import fs from 'fs'
import { applianceEvents } from '@tvkitchen/base-constants'
import { AbstractVideoIngestionAppliance } from '@tvkitchen/appliance-core'

class VideoFileIngestionAppliance extends AbstractVideoIngestionAppliance {
	filePath = null

	/**
	* Create a VideoFileIngestionEngine.
	*
	* @param  {String} overrideSettings.filePath The path of the file to be ingested.
	*/
	constructor(overrideSettings = {
		filePath: '',
	}) {
		super(overrideSettings)
		if (!overrideSettings.filePath) {
			throw new Error('VideoFileIngestionAppliances must be instantiated with a configured filePath.')
		}
		this.filePath = overrideSettings.filePath
	}

	/** @inheritdoc */
	getInputStream = () => fs.createReadStream(this.filePath)

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
