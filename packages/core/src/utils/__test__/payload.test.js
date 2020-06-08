import { Payload } from '@tvkitchen/base-classes'
import { isPayloadInstance } from '../payload'

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
})
