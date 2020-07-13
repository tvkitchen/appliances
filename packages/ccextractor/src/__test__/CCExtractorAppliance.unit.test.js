import { dataTypes } from '@tvkitchen/base-constants'
import commandExists from 'command-exists'
import CCExtractorAppliance from '..'

jest.mock('command-exists')

describe('CCExtractorAppliance', () => {
	describe('getInputTypes', () => {
		expect(CCExtractorAppliance.getInputTypes()).toContain(dataTypes.STREAM.CONTAINER)
	})

	describe('audit', () => {
		it('should log an error and return false if CCExtractor is not installed', async () => {
			commandExists.sync.mockReturnValue(false)
			const appliance = new CCExtractorAppliance()
			const loggerSpy = jest.spyOn(appliance.logger, 'error')
			expect(await appliance.audit()).toBe(false)
			expect(loggerSpy).toHaveBeenCalledTimes(1)
		})
		it('should return true if CCExtractor is installed', async () => {
			commandExists.sync.mockReturnValue(true)
			const appliance = new CCExtractorAppliance()
			expect(await appliance.audit()).toBe(true)
		})
	})
})
