import {
	Payload,
	PayloadArray,
} from '@tvkitchen/base-classes'
import {
	isPayloadInstance,
	isPayloadArrayInstance,
} from '../payload'

describe('payload utilities #unit', () => {
	describe('isPayloadInstance', () => {
		it('should detect payload instances', () => {
			const input = new Payload()
			expect(isPayloadInstance(input)).toBe(true)
		})
		it('should detect non-payload instances', () => {
			const input = 5
			expect(isPayloadInstance(input)).toBe(false)
		})
	})
	describe('isPayloadArrayInstance', () => {
		it('should detect PayloadArray instances', () => {
			const input = new PayloadArray()
			expect(isPayloadArrayInstance(input)).toBe(true)
		})
		it('should detect non-PayloadArray instances', () => {
			const input = 5
			expect(isPayloadArrayInstance(input)).toBe(false)
		})
	})
})
