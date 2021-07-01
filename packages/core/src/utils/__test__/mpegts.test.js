import {
	tsToMilliseconds,
	generateEmptyPacket,
	areDiscontinuousPositions,
	getRolloverTimestamp,
} from '../mpegts'

describe('mpegts utilities', () => {
	describe('tsToMilliseconds()', () => {
		it('should convert successfuly with the default basetime', () => {
			expect(tsToMilliseconds(90000)).toBe(1000)
		})
		it('should convert successfuly with an override basetime', () => {
			expect(tsToMilliseconds(500, 1 / 200)).toBe(2500)
		})
	})

	describe('generateEmptyPacket', () => {
		it('should have zeroed-out attributes of a TSDemuxer Packet', () => {
			const emptyPacket = generateEmptyPacket()
			expect(emptyPacket).toMatchObject({
				data: [],
				pts: 0,
				dts: 0,
				frame_ticks: 0,
				program: 0,
				stream_number: 0,
				type: 0,
				stream_id: 0,
				content_type: 0,
				frame_num: 0,
			})
		})
	})

	describe('areDiscontinuousPositions', () => {
		it('should return false if positions are monotonically increasing', () => {
			expect(areDiscontinuousPositions(0, 1)).toBe(false)
			expect(areDiscontinuousPositions(0, 0)).toBe(false)
			expect(areDiscontinuousPositions(1000, 15000)).toBe(false)
		})

		it('should return true if positions are decreasing', () => {
			expect(areDiscontinuousPositions(10, 0)).toBe(true)
			expect(areDiscontinuousPositions(0, -1)).toBe(true)
			expect(areDiscontinuousPositions(10000, 5000)).toBe(true)
		})
	})

	describe('getRolloverTimestamp', () => {
		it('should not modify the timestamp if there are no rollovers', () => {
			const baseTimestamp = '2021-06-30T18:30:25.205Z'
			expect(getRolloverTimestamp(baseTimestamp, 0))
				.toEqual(baseTimestamp)
		})
		it('should increase the timestamp by the default PTS rollover if there is a rollover', () => {
			const baseTimestamp = '2021-06-30T18:30:25.205Z'
			const singleRolloverTimestamp = '2021-07-01T21:01:08.922Z' // add 2^33 / 90000 seconds to the timestamp
			expect(getRolloverTimestamp(baseTimestamp, 1))
				.toEqual(singleRolloverTimestamp)
		})
		it('should default the rolloverCount to 1', () => {
			const baseTimestamp = '2021-06-30T18:30:25.205Z'
			const singleRolloverTimestamp = '2021-07-01T21:01:08.922Z' // add 2^33 / 90000 seconds to the timestamp
			expect(getRolloverTimestamp(baseTimestamp))
				.toEqual(singleRolloverTimestamp)
		})
		it('should increase the timestamp by the default PTS rollover multiple times if there is more than one rollover', () => {
			const baseTimestamp = '2021-06-30T18:30:25.205Z'
			const doubleRolloverTimestamp = '2021-07-02T23:31:52.640Z' // add 2 * 2^33 / 90000 seconds to the timestamp
			expect(getRolloverTimestamp(baseTimestamp, 2))
				.toEqual(doubleRolloverTimestamp)
		})
		it('should increase the timestamp based on the baseTime', () => {
			const baseTimestamp = '2021-06-30T18:30:25.205Z'
			const baseTime = 1 / 50000
			const singleRolloverTimestamp = '2021-07-02T18:13:43.896Z' // add 2^33 / 50000 seconds to the timestamp
			expect(getRolloverTimestamp(baseTimestamp, 1, baseTime))
				.toEqual(singleRolloverTimestamp)
		})
	})
})
