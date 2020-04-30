import { isPayloadInstance } from '../payload'
import Payload from '../../Payload'

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
