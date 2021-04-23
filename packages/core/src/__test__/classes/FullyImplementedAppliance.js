import { AbstractAppliance } from '../../AbstractAppliance'

class FullyImplementedAppliance extends AbstractAppliance {
	static getInputTypes() {
		return ['FOO']
	}

	static getOutputTypes() {
		return ['BAR']
	}

	// eslint-disable-next-line class-methods-use-this
	async invoke(payloads) { return payloads }
}

export { FullyImplementedAppliance }
