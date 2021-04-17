import { AbstractAppliance } from '../../AbstractAppliance'

class FullyImplementedAppliance extends AbstractAppliance {
	static getInputTypes() {
		return ['FOO']
	}

	static getOutputTypes() {
		return ['BAR']
	}

	invoke = async (payloads) => payloads
}

export { FullyImplementedAppliance }
