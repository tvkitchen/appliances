import { CCExtractorLine } from '..'

describe('CCExtractorLine', () => {
	describe('constructor', () => {
		it('should construct properly with no parameters', () => {
			const line = new CCExtractorLine()
			expect(line.start).toBe(0)
			expect(line.end).toBe(0)
			expect(line.text).toBe('')
		})
		it('should construct with values', () => {
			const line = new CCExtractorLine({
				start: 15,
				end: 30,
				text: 'banana',
			})
			expect(line.start).toBe(15)
			expect(line.end).toBe(30)
			expect(line.text).toBe('banana')
		})
	})
})
