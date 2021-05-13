import {
	parseCcExtractorLine,
	parseCcExtractorLines,
	ccExtractorTimestampToMs,
	convertCcExtractorLineToPayloads,
} from '../ccextractor'
import { CCExtractorLine } from '../../CCExtractorLine'

describe('ccextractor utils #unit', () => {
	describe('parseCcExtractorLine', () => {
		it('should properly parse a valid line', () => {
			const ccExtractorLine = parseCcExtractorLine('00:00:56,723|00:00:58,591|CALLED BILL BARR THE IRAN/CONTRA')
			expect(ccExtractorLine).toEqual(new CCExtractorLine({
				start: 56723,
				end: 58591,
				text: 'CALLED BILL BARR THE IRAN/CONTRA',
			}))
		})
		it('should throw an error on an invalid line', () => {
			expect(() => parseCcExtractorLine('lol this is not valid')).toThrow()
		})
	})
	describe('parseCcExtractorLines', () => {
		it('should properly parse a valid lines', () => {
			const ccExtractorLines = parseCcExtractorLines(`00:00:58,892|00:00:59,726|CLEANUP GUY AND IF YOU L
00:00:58,892|00:00:59,759|CLEANUP GUY AND IF YOU LOO`)
			expect(ccExtractorLines).toEqual([
				new CCExtractorLine({
					start: 58892,
					end: 59726,
					text: 'CLEANUP GUY AND IF YOU L',
				}),
				new CCExtractorLine({
					start: 58892,
					end: 59759,
					text: 'CLEANUP GUY AND IF YOU LOO',
				}),
			])
		})
		it('should skip invalid lines', () => {
			expect(parseCcExtractorLines('lol this is not valid'))
				.toEqual([])
			expect(parseCcExtractorLines(`00:00:58,892|00:00:59,726|CLEANUP GUY AND IF YOU L
lol this is not valid`))
				.toEqual([
					new CCExtractorLine({
						start: 58892,
						end: 59726,
						text: 'CLEANUP GUY AND IF YOU L',
					}),
				])
		})
	})
	describe('ccExtractorTimestampToMs', () => {
		it('should properly parse ms', () => {
			expect(ccExtractorTimestampToMs('00:00:00,723')).toBe(723)
		})
		it('should properly parse seconds', () => {
			expect(ccExtractorTimestampToMs('00:00:56,000')).toBe(56000)
		})
		it('should properly parse minutes', () => {
			expect(ccExtractorTimestampToMs('00:10:00,000')).toBe(600000)
		})
		it('should properly parse hours', () => {
			expect(ccExtractorTimestampToMs('11:00:00,000')).toBe(39600000)
		})
		it('should properly parse everything', () => {
			expect(ccExtractorTimestampToMs('90:11:14,123')).toBe(324674123)
		})
	})
	describe('convertCcExtractorLineToPayloads', () => {
		it('should convert a single line', () => {
			const ccExtractorLine = new CCExtractorLine({
				start: 58892,
				end: 59726,
				text: 'CLEANUP GUY AND IF YOU L',
			})
			const payloads = convertCcExtractorLineToPayloads(ccExtractorLine)
			payloads.forEach((payload) => {
				expect(payload).toMatchSnapshot({
					createdAt: expect.any(String),
				})
			})
		})
		it('should convert the diff between two lines', () => {
			const previousLine = new CCExtractorLine({
				start: 58892,
				end: 59726,
				text: 'CLEANUP GUY AND IF YOU L',
			})
			const newLine = new CCExtractorLine({
				start: 58892,
				end: 59759,
				text: 'CLEANUP GUY AND IF YOU LOO',
			})
			const payloads = convertCcExtractorLineToPayloads(newLine, previousLine)
			payloads.forEach((payload) => {
				expect(payload).toMatchSnapshot({
					createdAt: expect.any(String),
				})
			})
		})
		it('should detect and emit new lines', () => {
			const previousLine = new CCExtractorLine({
				start: 58892,
				end: 59726,
				text: 'Singing he was, or fluting all the day;',
			})
			const newLine = new CCExtractorLine({
				start: 58892,
				end: 59759,
				text: 'He was as fresh as is the month of May.',
			})
			const payloads = convertCcExtractorLineToPayloads(newLine, previousLine)
			payloads.forEach((payload) => {
				expect(payload).toMatchSnapshot({
					createdAt: expect.any(String),
				})
			})
		})
		it('should use previous timestamp end as end if new end is zero', () => {
			const previousLine = new CCExtractorLine({
				start: 58892,
				end: 59726,
				text: 'Singing he was, or fluting all the day;',
			})
			const newLine = new CCExtractorLine({
				start: 0,
				end: 0,
				text: 'He was as fresh as is the month of May.',
			})
			const payloads = convertCcExtractorLineToPayloads(newLine, previousLine)
			expect(payloads[1].position).toBe(59726)
		})
		it('should use the current start if previous end is zero', () => {
			const previousLine = new CCExtractorLine({
				start: 58890,
				end: 0,
				text: 'Singing he was, or fluting all the day;',
			})
			const newLine = new CCExtractorLine({
				start: 58892,
				end: 58896,
				text: 'He was as fresh as is the month of May.',
			})
			const payloads = convertCcExtractorLineToPayloads(newLine, previousLine)
			expect(payloads[1].position).toBe(58892)
		})
	})
})
