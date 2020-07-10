import AbstractAppliance from '../../AbstractAppliance'

class FullyImplementedAppliance extends AbstractAppliance {
	getInputTypes = () => []

	getOutputTypes = () => []

	isValidPayload = async () => true

	invoke = async (payloads) => payloads
}

export default FullyImplementedAppliance
