import AbstractAppliance from '../../AbstractAppliance'

class FullyImplementedAppliance extends AbstractAppliance {
	static getInputTypes = () => ['FOO']

	static getOutputTypes = () => ['BAR']

	invoke = async (payloads) => payloads
}

export default FullyImplementedAppliance
