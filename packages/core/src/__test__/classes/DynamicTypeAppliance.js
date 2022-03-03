import { AbstractAppliance } from '../../AbstractAppliance'

export class DynamicTypeAppliance extends AbstractAppliance {
	static getInputTypes(settings) {
		return settings.inputTypes
	}

	static getOutputTypes(settings) {
		return settings.outputTypes
	}

	// eslint-disable-next-line class-methods-use-this
	async invoke(payloads) { return payloads }
}
