import path from 'path'
import { ReadStream } from 'fs'
import { VideoFileReceiverAppliance } from '../VideoFileReceiverAppliance'

describe('VideoFileReceiverAppliance #unit', () => {
	describe('constructor', () => {
		it('should throw an error when called without a path', () => {
			expect(() => new VideoFileReceiverAppliance())
				.toThrow(Error)
		})
	})

	describe('getInputStream', () => {
		it('it should return a file read stream', () => {
			const receiverAppliance = new VideoFileReceiverAppliance({
				filePath: path.join(__dirname, '/data/empty.txt'),
			})
			const inputStream = receiverAppliance.getInputStream()
			expect(inputStream).toBeInstanceOf(ReadStream)
		})
	})
})
