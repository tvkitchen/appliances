import nock from 'nock'
import { VideoHttpReceiverAppliance } from '../VideoHttpReceiverAppliance'

describe('VideoHttpReceiverAppliance #unit', () => {
	describe('constructor', () => {
		it('should throw an error when called without a URL', () => {
			expect(() => new VideoHttpReceiverAppliance())
				.toThrow(Error)
		})
	})

	describe('getInputStream', () => {
		it('it should stream the client request body', () => {
			const base = 'http://example.com'
			const file = '/test.ts'
			const body = 'it worked!'

			nock(base).get(file).reply(200, body)

			const receiverAppliance = new VideoHttpReceiverAppliance({
				url: `${base}${file}`,
			})

			const inputStream = receiverAppliance.getInputStream()

			return expect(
				new Promise((resolve) => inputStream.on('data', resolve)),
			).resolves.toEqual(Buffer.from(body))
		})

		it('it should pass on errors correctly', () => {
			const base = 'http://example.com'
			const file = '/error-test.ts'
			const message = 'it didn\'t work!'

			nock(base).get(file).replyWithError({
				message,
			})

			const receiverAppliance = new VideoHttpReceiverAppliance({
				url: `${base}${file}`,
			})

			const inputStream = receiverAppliance.getInputStream()

			return expect(
				new Promise((resolve, reject) => inputStream.on('error', reject)),
			).rejects.toHaveProperty('name', 'FetchError')
		})
	})
})
