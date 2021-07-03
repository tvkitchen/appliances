import fs from 'fs'
import { AbstractVideoReceiverAppliance } from '@tvkitchen/appliance-core'

class VideoFileReceiverAppliance extends AbstractVideoReceiverAppliance {
	/**
	* Create a VideoFileReceiverAppliance.
	*
	* @param  {String} settings.filePath The path of the file being processed.
	*/
	constructor(settings) {
		super({
			filePath: '',
			...settings,
		})
		if (!settings.filePath) {
			throw new Error('VideoFileReceiverAppliances must be instantiated with a configured filePath.')
		}
	}

	/** @inheritdoc */
	getInputStream = () => fs.createReadStream(this.settings.filePath)
}

export { VideoFileReceiverAppliance }
