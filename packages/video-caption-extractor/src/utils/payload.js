import { Payload } from '@tvkitchen/base-classes'
import { dataTypes } from '@tvkitchen/base-constants'

/**
 * Generates a newline TEXT.ATOM payload at a specified position.
 *
 * @param  {Number} position The position of the newline atom.
 * @return {Payload}     The resulting Payload
 */
export const generateNewlineTextAtomPayload = (position) => new Payload({
	data: '\n',
	type: dataTypes.TEXT.ATOM,
	position,
	duration: 0,
})
