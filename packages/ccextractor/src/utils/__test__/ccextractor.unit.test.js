import { Payload } from '@tvkitchen/base-classes'
import {
	parseCcExtractorLine,
	parseCcExtractorLines,
	ccExtractorTimestampToMs,
	convertCcExtractorLineToPayload,
} from '../ccextractor'
import CCExtractorLine from '../../CCExtractorLine'

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
	describe('convertCcExtractorLineToPayload', () => {
		it('should convert a single line', () => {
			const ccExtractorLine = new CCExtractorLine({
				start: 58892,
				end: 59726,
				text: 'CLEANUP GUY AND IF YOU L',
			})
			const payload = convertCcExtractorLineToPayload(ccExtractorLine)
			const targetPayload = new Payload({
				position: 58892,
				duration: 834,
				data: 'CLEANUP GUY AND IF YOU L',
			})
			expect(payload.position).toEqual(targetPayload.position)
			expect(payload.duration).toEqual(targetPayload.duration)
			expect(payload.data).toEqual(targetPayload.data)
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
			const payload = convertCcExtractorLineToPayload(newLine, previousLine)
			expect(payload.position).toEqual(59726)
			expect(payload.duration).toEqual(33)
			expect(payload.data).toEqual('OO')
		})
	})
})
