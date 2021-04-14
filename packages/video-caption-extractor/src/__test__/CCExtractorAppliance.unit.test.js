import { dataTypes } from '@tvkitchen/base-constants'
import commandExists from 'command-exists'
import { VideoCaptionExtractorAppliance } from '..'

jest.mock('command-exists')

describe('VideoCaptionExtractorAppliance', () => {
	describe('getInputTypes', () => {
		expect(VideoCaptionExtractorAppliance.getInputTypes()).toContain(dataTypes.STREAM.CONTAINER)
	})

	describe('audit', () => {
		it('should log an error and return false if CCExtractor is not installed', async () => {
			commandExists.sync.mockReturnValue(false)
			const appliance = new VideoCaptionExtractorAppliance()
			const loggerSpy = jest.spyOn(appliance.logger, 'error')
			expect(await appliance.audit()).toBe(false)
			expect(loggerSpy).toHaveBeenCalledTimes(1)
		})
		it('should return true if CCExtractor is installed', async () => {
			commandExists.sync.mockReturnValue(true)
			const appliance = new VideoCaptionExtractorAppliance()
			expect(await appliance.audit()).toBe(true)
		})
	})
})
