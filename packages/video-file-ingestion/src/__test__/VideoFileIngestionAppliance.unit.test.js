import path from 'path'
import { ReadStream } from 'fs'
import VideoFileIngestionAppliance from '../VideoFileIngestionAppliance'

describe('VideoFileIngestionAppliance #unit', () => {
	describe('constructor', () => {
		it('should throw an error when called without a path', () => {
			expect(() => new VideoFileIngestionAppliance())
				.toThrow(Error)
		})
	})

	describe('getInputStream', () => {
		it('it should return a file read stream', () => {
			const ingestionAppliance = new VideoFileIngestionAppliance({
				filePath: path.join(__dirname, '/data/empty.txt'),
			})
			const inputStream = ingestionAppliance.getInputStream()
			expect(inputStream).toBeInstanceOf(ReadStream)
		})
	})
})
