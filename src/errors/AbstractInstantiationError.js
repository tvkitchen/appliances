/**
 * AbstractInstantiationError is thrown when an abstract class is instantiated directly.
 * This is a workaround to the fact that ES6 does not formally support abstract classes.
 */
class AbstractInstantiationError extends Error {
	/**
	 * @param  {String} methodName The name of the abstract class being instantiated
	 */
	constructor(className) {
		super(`You cannot instantiate abstract class: ${className}`)
	}
}

export default AbstractInstantiationError
