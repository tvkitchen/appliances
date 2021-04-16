import {
	calculateOriginPosition,
	generatePeriodSegmentPayloads,
	generatePositionRangeSegmentPayloads,
	getPeriodPosition,
} from '../segment'

import { INTERVALS } from '../../constants'

describe('segment utils #unit', () => {
	describe('calculateOriginPosition', () => {
		it('should return the reference position when passed matching timestamps', () => {
			expect(calculateOriginPosition(
				'2021-03-12T20:04:25.258Z',
				'2021-03-12T20:04:25.258Z',
				42,
			)).toBe(42)
		})
		it('should generate negative origin positions if origin is before position 0', () => {
			expect(calculateOriginPosition(
				'2021-03-12T20:04:24.258Z',
				'2021-03-12T20:04:25.258Z',
				0,
			)).toBe(-1000)
		})
		it('should generate positive origin positions if origin is after position 0', () => {
			expect(calculateOriginPosition(
				'2021-03-12T20:04:26.258Z',
				'2021-03-12T20:04:25.258Z',
				0,
			)).toBe(1000)
		})
	})

	describe('generatePeriodSegmentPayloads', () => {
		it('should generate payloads for simple segments', () => {
			const segments = [0, 1, 2, 3]
			const segmentPayloads = generatePeriodSegmentPayloads(0, segments)
			segmentPayloads.forEach((segmentPayload) => expect(segmentPayload).toMatchSnapshot({
				createdAt: expect.any(String),
			}))
		})
		it('should generate payloads for object segments', () => {
			const segments = [{
				offset: 0,
				data: {
					programName: 'The First Segment',
				},
			}, {
				offset: 300000,
				data: {
					programName: 'The Second Segment',
				},
			}]
			const segmentPayloads = generatePeriodSegmentPayloads(0, segments)
			expect(segmentPayloads.length).toBe(2)
			segmentPayloads.forEach((segmentPayload) => expect(segmentPayload).toMatchSnapshot({
				createdAt: expect.any(String),
			}))
		})
		it('should generate payloads for mixed segments', () => {
			const segments = [{
				offset: 0,
				data: {
					programName: 'The First Segment',
				},
			}, 500]
			const segmentPayloads = generatePeriodSegmentPayloads(0, segments)
			expect(segmentPayloads.length).toBe(2)
			segmentPayloads.forEach((segmentPayload) => expect(segmentPayload).toMatchSnapshot({
				createdAt: expect.any(String),
			}))
		})
	})

	describe('getPeriodPosition', () => {
		it('should return the starting position of a given period', () => {
			expect(getPeriodPosition(1000, 0, 3000)).toBe(0)
			expect(getPeriodPosition(4000, 0, 3000)).toBe(3000)
		})
		it('should return the origin position if the interval is infinite', () => {
			expect(getPeriodPosition(1000, 0, INTERVALS.INFINITE)).toBe(0)
			expect(getPeriodPosition(1000, 500, INTERVALS.INFINITE)).toBe(500)
		})
		it('should return the starting position of a given period with a non-zero origin', () => {
			expect(getPeriodPosition(1000, 60, 3000)).toBe(60)
			expect(getPeriodPosition(4000, 60, 3000)).toBe(3060)
			expect(getPeriodPosition(1000, -1000, 3000)).toBe(-1000)
			expect(getPeriodPosition(4000, -1000, 3000)).toBe(2000)
		})
	})

	describe('generatePositionRangeSegmentPayloads', () => {
		it('should generate multiple sets of segments for positions that span multiple intervals', () => {
			const startPosition = 0
			const endPosition = 6000
			const originPosition = 0
			const interval = 3000
			const segments = [0, 1000, 2000]
			const segmentPayloads = generatePositionRangeSegmentPayloads(
				startPosition,
				endPosition,
				originPosition,
				interval,
				segments,
			)
			expect(segmentPayloads.length).toBe(7)
			segmentPayloads.forEach((segmentPayload) => expect(segmentPayload).toMatchSnapshot({
				createdAt: expect.any(String),
			}))
		})

		it('should generate a subset of segments for positions overlap multiple intervals', () => {
			const startPosition = 2000
			const endPosition = 4000
			const originPosition = 0
			const interval = 3000
			const segments = [0, 1000, 2000]
			const segmentPayloads = generatePositionRangeSegmentPayloads(
				startPosition,
				endPosition,
				originPosition,
				interval,
				segments,
			)
			expect(segmentPayloads.length).toBe(3)
			segmentPayloads.forEach((segmentPayload) => expect(segmentPayload).toMatchSnapshot({
				createdAt: expect.any(String),
			}))
		})

		it('should generate a segments if there is an infinite interval', () => {
			const startPosition = 2000
			const endPosition = 4000
			const originPosition = 0
			const interval = INTERVALS.INFINITE
			const segments = [0, 1000, 2000]
			const segmentPayloads = generatePositionRangeSegmentPayloads(
				startPosition,
				endPosition,
				originPosition,
				interval,
				segments,
			)
			expect(segmentPayloads.length).toBe(1)
			segmentPayloads.forEach((segmentPayload) => expect(segmentPayload).toMatchSnapshot({
				createdAt: expect.any(String),
			}))
		})
	})
})
