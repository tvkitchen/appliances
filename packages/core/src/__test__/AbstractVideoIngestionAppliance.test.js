// Mocked imports
import childProcess from 'child_process'
import stream from 'stream'

// Test imports
import fs from 'fs'
import path from 'path'
import {
	AbstractInstantiationError,
	NotImplementedError,
} from '@tvkitchen/base-errors'
import { dataTypes } from '@tvkitchen/base-constants'
import { Payload } from '@tvkitchen/base-classes'
import { AbstractVideoIngestionAppliance } from '../AbstractVideoIngestionAppliance'
import {
	FullyImplementedVideoIngestionAppliance,
	PartiallyImplementedVideoIngestionAppliance,
} from './classes'

// Set up mocks
jest.mock('child_process')
jest.mock('stream')

// A helper for loading data
const loadTestData = (testDirectory, fileName) => JSON.parse(fs.readFileSync(
	path.join(testDirectory, 'data', fileName),
))

// This pulls actual versions of mocked components, since we use them
const {
	Readable,
	Writable,
} = jest.requireActual('stream')

describe('AbstractVideoIngestionAppliance #unit', () => {
	describe('constructor', () => {
		it('should throw an error when called directly', () => {
			expect(() => new AbstractVideoIngestionAppliance())
				.toThrow(AbstractInstantiationError)
		})

		it('should allow construction when extended', () => {
			expect(() => new PartiallyImplementedVideoIngestionAppliance())
				.not.toThrow(Error)
		})
	})

	describe('processMpegtsStreamData', () => {
		it('should pass the data to the mpegts demuxer', () => {
			jest.clearAllMocks()
			const ingestionAppliance = new FullyImplementedVideoIngestionAppliance()
			ingestionAppliance.mpegTsDemuxer = {
				write: jest.fn(),
			}
			ingestionAppliance.getMostRecentDemuxedPacket = jest.fn().mockReturnValueOnce({ pts: 0 })
			const streamData = Buffer.from('testDataXYZ', 'utf8')
			ingestionAppliance.processMpegtsStreamData(streamData, null, () => {
				expect(ingestionAppliance.mpegTsDemuxer.write).toHaveBeenCalledTimes(1)
			})
		})
		it('should emit a Payload of type STREAM.CONTAINER', () => {
			jest.clearAllMocks()
			const ingestionAppliance = new FullyImplementedVideoIngestionAppliance()
			ingestionAppliance.mpegtsDemuxer = { process: jest.fn }
			ingestionAppliance.getMostRecentDemuxedPacket = jest.fn().mockReturnValueOnce({ pts: 0 })
			const streamData = Buffer.from('testDataXYZ', 'utf8')
			ingestionAppliance.processMpegtsStreamData(streamData, null, (err, result) => {
				expect(result).toBeInstanceOf(Payload)
				expect(result.type).toEqual(dataTypes.STREAM.CONTAINER)
			})
		})
		it('should emit a Payload that contains the MPEG-TS data', () => {
			jest.clearAllMocks()
			const ingestionAppliance = new FullyImplementedVideoIngestionAppliance()
			ingestionAppliance.mpegtsDemuxer = { process: jest.fn }
			ingestionAppliance.getMostRecentDemuxedPacket = jest.fn().mockReturnValueOnce({ pts: 0 })
			const streamData = Buffer.from('testDataXYZ', 'utf8')
			ingestionAppliance.processMpegtsStreamData(streamData, null, (err, result) => {
				expect(result).toBeInstanceOf(Payload)
				expect(result.data).toEqual(streamData)
			})
		})
		it('should correctly decorate the Payload position', () => {
			jest.clearAllMocks()
			const ingestionAppliance = new FullyImplementedVideoIngestionAppliance()
			ingestionAppliance.mpegtsDemuxer = {
				process: jest.fn(),
			}
			ingestionAppliance.getMostRecentDemuxedPacket = jest.fn().mockReturnValueOnce({
				pts: 90000,
			})
			const streamData = Buffer.from('testDataXYZ', 'utf8')
			ingestionAppliance.processMpegtsStreamData(streamData, null, (err, result) => {
				expect(result.position).toEqual(1000)
			})
		})
		it('should correctly decorate the Payload createdAt', () => {
			jest.clearAllMocks()
			const ingestionAppliance = new FullyImplementedVideoIngestionAppliance()
			ingestionAppliance.mpegtsDemuxer = {
				process: jest.fn(),
			}
			ingestionAppliance.getMostRecentDemuxedPacket = jest.fn().mockReturnValueOnce({
				pts: 90000,
			})
			const streamData = Buffer.from('testDataXYZ', 'utf8')
			ingestionAppliance.processMpegtsStreamData(streamData, null, (err, result) => {
				expect(typeof result.createdAt).toBe('string')
			})
		})
		it('should correctly decorate the Payload origin', () => {
			jest.clearAllMocks()
			const originTime = new Date()
			const ingestionAppliance = new FullyImplementedVideoIngestionAppliance({
				origin: originTime.toISOString(),
			})
			ingestionAppliance.mpegtsDemuxer = {
				process: jest.fn(),
			}
			ingestionAppliance.getMostRecentDemuxedPacket = jest.fn().mockReturnValue({
				pts: 90000,
			})
			const streamData = Buffer.from('testDataXYZ', 'utf8')
			ingestionAppliance.processMpegtsStreamData(streamData, null, (err, result) => {
				expect(result.origin).toEqual(originTime.toISOString())
			})
		})
	})

	describe('onDemuxedPacket', () => {
		it('should register new packets as most recent', () => {
			const testData = loadTestData(__dirname, 'onDemuxedPacket.json')
			const demuxedPacket = testData[0]
			const demuxedPacket2 = testData[1]
			const ingestionAppliance = new FullyImplementedVideoIngestionAppliance()
			ingestionAppliance.onDemuxedPacket(demuxedPacket)
			ingestionAppliance.onDemuxedPacket(demuxedPacket2)
			expect(ingestionAppliance.mostRecentDemuxedPacket).toEqual(demuxedPacket2)
		})
	})

	describe('getMostRecentDemuxedPacket', () => {
		it('should return the value in most recent demuxed packet', () => {
			const testData = loadTestData(__dirname, 'getMostRecentDemuxedPacket.json')
			const demuxedPacket = testData[0]
			const ingestionAppliance = new FullyImplementedVideoIngestionAppliance()
			ingestionAppliance.mostRecentDemuxedPacket = demuxedPacket
			expect(ingestionAppliance.getMostRecentDemuxedPacket()).toEqual(demuxedPacket)
		})
		it('should return null if nothing has been processed', () => {
			const ingestionAppliance = new FullyImplementedVideoIngestionAppliance()
			expect(ingestionAppliance.getMostRecentDemuxedPacket()).toBe(null)
		})
	})

	describe('start', () => {
		it('should spawn an ffmpeg process', () => {
			jest.clearAllMocks()
			childProcess.spawn.mockReturnValueOnce({
				stdout: new Readable(),
				stdin: new Writable(),
			})
			const inputStream = new Readable({ read: () => {} })
			const ingestionAppliance = new FullyImplementedVideoIngestionAppliance({
				readableStream: inputStream,
			})
			ingestionAppliance.producer = { connect: jest.fn().mockResolvedValue() }
			ingestionAppliance.start()
			expect(childProcess.spawn).toHaveBeenCalledTimes(1)
		})
		it('should create a processing pipeline', async () => {
			jest.clearAllMocks()
			childProcess.spawn.mockReturnValueOnce({
				stdout: new Readable(),
				stdin: new Writable(),
			})
			childProcess.spawn.mockReturnValueOnce({})
			const inputStream = new Readable({ read: jest.fn() })
			const ingestionAppliance = new FullyImplementedVideoIngestionAppliance({
				readableStream: inputStream,
			})
			ingestionAppliance.producer = { connect: jest.fn().mockResolvedValue() }
			await ingestionAppliance.start()
			expect(stream.pipeline).toHaveBeenCalledTimes(1)
		})
	})

	describe('stop', () => {
		it('should kill the ffmpeg process and stop the stream', () => {
			jest.clearAllMocks()
			const ingestionAppliance = new FullyImplementedVideoIngestionAppliance()
			ingestionAppliance.activeInputStream = {
				destroy: jest.fn(),
			}
			ingestionAppliance.ffmpegProcess = {
				kill: jest.fn(),
			}
			ingestionAppliance.producer = {
				disconnect: jest.fn(),
			}
			ingestionAppliance.stop()
			expect(ingestionAppliance.activeInputStream.destroy).toHaveBeenCalledTimes(1)
			expect(ingestionAppliance.ffmpegProcess.kill).toHaveBeenCalledTimes(1)
		})
		it('should not error if called before starting', () => {
			jest.clearAllMocks()
			const ingestionAppliance = new FullyImplementedVideoIngestionAppliance()
			ingestionAppliance.producer = {
				disconnect: jest.fn(),
			}
			expect(() => ingestionAppliance.stop()).not.toThrow()
		})
	})

	describe('getInputStream', () => {
		it('should throw an error when called without an implementation', () => {
			const ingestionAppliance = new PartiallyImplementedVideoIngestionAppliance()
			expect(ingestionAppliance.getInputStream).toThrow(NotImplementedError)
		})
	})

	describe('getFfmpegSettings', () => {
		it('should return an array', () => {
			expect(AbstractVideoIngestionAppliance.getFfmpegSettings()).toBeInstanceOf(Array)
		})
	})

	describe('getInputTypes', () => {
		it('should return an empty array', () => {
			expect(AbstractVideoIngestionAppliance.getInputTypes()).toEqual([])
		})
	})

	describe('getOutputTypes', () => {
		it('should return a the STREAM.CONTAINER', () => {
			expect(AbstractVideoIngestionAppliance.getOutputTypes()).toEqual([dataTypes.STREAM.CONTAINER])
		})
	})
})
