import AbstractAppliance from '../../AbstractAppliance'

class FullyImplementedAppliance extends AbstractAppliance {
	getInputTypes = () => []

	getOutputTypes = () => []

	isValidPayload = async () => true

	invoke = async () => true
}

export default FullyImplementedAppliance
