/**
 * NotImplementedError is thrown when an abstract method has not been implemented.
 * This is a workaround to the fact that ES6 does not formally support abstract classes.
 */
class NotImplementedError extends Error {
	/**
	 * @param {String} methodName The name of the method that was not implemented.
	 */
	constructor(methodName) {
		super(`You implemented an abstract class but forgot to define the ${methodName} method.`)
	}
}

export default NotImplementedError
