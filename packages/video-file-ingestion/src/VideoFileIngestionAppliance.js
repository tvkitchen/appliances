import fs from 'fs'
import { AbstractVideoIngestionAppliance } from '@tvkitchen/appliance-core'

class VideoFileIngestionAppliance extends AbstractVideoIngestionAppliance {
	/**
	* Create a VideoFileIngestionEngine.
	*
	* @param  {String} settings.filePath The path of the file to be ingested.
	*/
	constructor(settings) {
		super({
			filePath: '',
			...settings,
		})
		if (!settings.filePath) {
			throw new Error('VideoFileIngestionAppliances must be instantiated with a configured filePath.')
		}
	}

	/** @inheritdoc */
	getInputStream = () => fs.createReadStream(this.settings.filePath)
}

export { VideoFileIngestionAppliance }
