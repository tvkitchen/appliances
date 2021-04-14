import { getDiff } from '../string'

describe('string utils #unit', () => {
	describe('getDiff', () => {
		it('should return an empty string if no difference exists', () => {
			expect(getDiff('apple', 'apple')).toBe('')
		})
		it('should return the different characters if there is some overlap', () => {
			expect(getDiff('boxcar', 'box')).toBe('car')
		})
		it('should return the original string if there is no similarity', () => {
			expect(getDiff('apple', 'orange')).toBe('apple')
		})
	})
})
