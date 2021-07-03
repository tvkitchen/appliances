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
import { AbstractVideoReceiverAppliance } from '../AbstractVideoReceiverAppliance'
import {
	FullyImplementedVideoReceiverAppliance,
	PartiallyImplementedVideoReceiverAppliance,
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

describe('AbstractVideoReceiverAppliance #unit', () => {
	describe('constructor', () => {
		it('should throw an error when called directly', () => {
			expect(() => new AbstractVideoReceiverAppliance())
				.toThrow(AbstractInstantiationError)
		})

		it('should allow construction when extended', () => {
			expect(() => new PartiallyImplementedVideoReceiverAppliance())
				.not.toThrow(Error)
		})
	})

	describe('processMpegtsStreamData', () => {
		it('should pass the data to the mpegts demuxer', () => {
			jest.clearAllMocks()
			const receiverAppliance = new FullyImplementedVideoReceiverAppliance()
			receiverAppliance.mpegTsDemuxer = {
				write: jest.fn(),
			}
			receiverAppliance.getMostRecentDemuxedPacket = jest.fn().mockReturnValueOnce({ pts: 0 })
			const streamData = Buffer.from('testDataXYZ', 'utf8')
			receiverAppliance.processMpegtsStreamData(streamData, null, () => {
				expect(receiverAppliance.mpegTsDemuxer.write).toHaveBeenCalledTimes(1)
			})
		})
		it('should emit a Payload of type STREAM.CONTAINER', () => {
			jest.clearAllMocks()
			const receiverAppliance = new FullyImplementedVideoReceiverAppliance()
			receiverAppliance.mpegtsDemuxer = { process: jest.fn }
			receiverAppliance.getMostRecentDemuxedPacket = jest.fn().mockReturnValueOnce({ pts: 0 })
			const streamData = Buffer.from('testDataXYZ', 'utf8')
			receiverAppliance.processMpegtsStreamData(streamData, null, (err, result) => {
				expect(result).toBeInstanceOf(Payload)
				expect(result.type).toEqual(dataTypes.STREAM.CONTAINER)
			})
		})
		it('should emit a Payload that contains the MPEG-TS data', () => {
			jest.clearAllMocks()
			const receiverAppliance = new FullyImplementedVideoReceiverAppliance()
			receiverAppliance.mpegtsDemuxer = { process: jest.fn }
			receiverAppliance.getMostRecentDemuxedPacket = jest.fn().mockReturnValueOnce({ pts: 0 })
			const streamData = Buffer.from('testDataXYZ', 'utf8')
			receiverAppliance.processMpegtsStreamData(streamData, null, (err, result) => {
				expect(result).toBeInstanceOf(Payload)
				expect(result.data).toEqual(streamData)
			})
		})
		it('should correctly decorate the Payload position', () => {
			jest.clearAllMocks()
			const receiverAppliance = new FullyImplementedVideoReceiverAppliance()
			receiverAppliance.mpegtsDemuxer = {
				process: jest.fn(),
			}
			const testData = loadTestData(__dirname, 'processMpegtsStreamData.json')
			const videoPacket = testData[0]
			receiverAppliance.onDemuxedPacket(videoPacket)
			const streamData = Buffer.from('testDataXYZ', 'utf8')
			receiverAppliance.processMpegtsStreamData(streamData, null, (err, result) => {
				expect(result.position).toEqual(13946)
			})
		})
		it('should correctly decorate the Payload createdAt', () => {
			jest.clearAllMocks()
			const receiverAppliance = new FullyImplementedVideoReceiverAppliance()
			receiverAppliance.mpegtsDemuxer = {
				process: jest.fn(),
			}
			const testData = loadTestData(__dirname, 'processMpegtsStreamData.json')
			const videoPacket = testData[0]
			receiverAppliance.onDemuxedPacket(videoPacket)
			const streamData = Buffer.from('testDataXYZ', 'utf8')
			receiverAppliance.processMpegtsStreamData(streamData, null, (err, result) => {
				expect(typeof result.createdAt).toBe('string')
			})
		})
		it('should correctly decorate the Payload origin', () => {
			jest.clearAllMocks()
			const originTime = new Date()
			const receiverAppliance = new FullyImplementedVideoReceiverAppliance({
				origin: originTime.toISOString(),
			})
			receiverAppliance.mpegtsDemuxer = {
				process: jest.fn(),
			}
			receiverAppliance.getMostRecentDemuxedPacket = jest.fn().mockReturnValue({
				pts: 90000,
			})
			const streamData = Buffer.from('testDataXYZ', 'utf8')
			receiverAppliance.processMpegtsStreamData(streamData, null, (err, result) => {
				expect(result.origin).toEqual(originTime.toISOString())
			})
		})
	})

	describe('onDemuxedPacket', () => {
		it('should register new packets as most recent', () => {
			const testData = loadTestData(__dirname, 'onDemuxedPacket.json')
			const videoPacket1 = testData[0]
			const videoPacket2 = testData[1]
			const audioPacket1 = testData[1]
			const receiverAppliance = new FullyImplementedVideoReceiverAppliance()
			receiverAppliance.onDemuxedPacket(videoPacket1)
			expect(receiverAppliance.mostRecentDemuxedVideoPacket).toEqual(videoPacket1)
			receiverAppliance.onDemuxedPacket(videoPacket2)
			expect(receiverAppliance.mostRecentDemuxedVideoPacket).toEqual(videoPacket2)
			receiverAppliance.onDemuxedPacket(audioPacket1)
			expect(receiverAppliance.mostRecentDemuxedVideoPacket).toEqual(videoPacket2)
		})
	})

	describe('getMostRecentDemuxedVideoPacket', () => {
		it('should return the value in most recent demuxed packet', () => {
			const testData = loadTestData(__dirname, 'getMostRecentDemuxedPacket.json')
			const videoPacket = testData[0]
			const receiverAppliance = new FullyImplementedVideoReceiverAppliance()
			receiverAppliance.onDemuxedPacket(videoPacket)
			expect(receiverAppliance.getMostRecentDemuxedVideoPacket()).toEqual(videoPacket)
		})
		it('should return null if nothing has been processed', () => {
			const receiverAppliance = new FullyImplementedVideoReceiverAppliance()
			expect(receiverAppliance.getMostRecentDemuxedVideoPacket()).toBe(null)
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
			const receiverAppliance = new FullyImplementedVideoReceiverAppliance({
				readableStream: inputStream,
			})
			receiverAppliance.producer = { connect: jest.fn().mockResolvedValue() }
			receiverAppliance.start()
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
			const receiverAppliance = new FullyImplementedVideoReceiverAppliance({
				readableStream: inputStream,
			})
			receiverAppliance.producer = { connect: jest.fn().mockResolvedValue() }
			await receiverAppliance.start()
			expect(stream.pipeline).toHaveBeenCalledTimes(1)
		})
	})

	describe('stop', () => {
		it('should kill the ffmpeg process and stop the stream', () => {
			jest.clearAllMocks()
			const receiverAppliance = new FullyImplementedVideoReceiverAppliance()
			receiverAppliance.activeInputStream = {
				destroy: jest.fn(),
			}
			receiverAppliance.ffmpegProcess = {
				kill: jest.fn(),
			}
			receiverAppliance.producer = {
				disconnect: jest.fn(),
			}
			receiverAppliance.stop()
			expect(receiverAppliance.activeInputStream.destroy).toHaveBeenCalledTimes(1)
			expect(receiverAppliance.ffmpegProcess.kill).toHaveBeenCalledTimes(1)
		})
		it('should not error if called before starting', () => {
			jest.clearAllMocks()
			const receiverAppliance = new FullyImplementedVideoReceiverAppliance()
			receiverAppliance.producer = {
				disconnect: jest.fn(),
			}
			expect(() => receiverAppliance.stop()).not.toThrow()
		})
	})

	describe('getInputStream', () => {
		it('should throw an error when called without an implementation', () => {
			const receiverAppliance = new PartiallyImplementedVideoReceiverAppliance()
			expect(receiverAppliance.getInputStream).toThrow(NotImplementedError)
		})
	})

	describe('getFfmpegSettings', () => {
		it('should return an array', () => {
			expect(AbstractVideoReceiverAppliance.getFfmpegSettings()).toBeInstanceOf(Array)
		})
	})

	describe('getInputTypes', () => {
		it('should return an empty array', () => {
			expect(AbstractVideoReceiverAppliance.getInputTypes()).toEqual([])
		})
	})

	describe('getOutputTypes', () => {
		it('should return a the STREAM.CONTAINER', () => {
			expect(AbstractVideoReceiverAppliance.getOutputTypes()).toEqual([dataTypes.STREAM.CONTAINER])
		})
	})
})
