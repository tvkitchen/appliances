import { msToSrtTimestamp } from '../srt'

describe('srt utils #unit', () => {
	describe('msToSrtTimestamp', () => {
		it('should properly convert ms to SRT times', () => {
			expect(msToSrtTimestamp(0))
				.toEqual('00:00:00,000')
			expect(msToSrtTimestamp(61001))
				.toEqual('00:01:01,001')
			expect(msToSrtTimestamp(3909005))
				.toEqual('01:05:09,005')
		})
	})
})
