import { AssertionError } from 'assert'
import {
	AbstractInstantiationError,
	NotImplementedError,
} from '@tvkitchen/base-errors'
import AbstractAppliance from '../AbstractAppliance'
import Payload from '../Payload'
import {
	FullyImplementedAppliance,
	PartiallyImplementedAppliance,
} from './classes'

describe('AbstractAppliance #unit', () => {
	describe('construction', () => {
		it('should throw an error when called directly', () => {
			expect(() => {
				new AbstractAppliance() // eslint-disable-line no-new
			}).toThrow(AbstractInstantiationError)
		})

		it('should throw an error when getInputTypes() is called without implementation', () => {
			const implementedAppliance = new PartiallyImplementedAppliance()
			expect(() => implementedAppliance.getInputTypes()).toThrow(NotImplementedError)
		})

		it('should throw an error when getOutputTypes() is called without implementation', () => {
			const implementedAppliance = new PartiallyImplementedAppliance()
			expect(() => implementedAppliance.getOutputTypes()).toThrow(NotImplementedError)
		})

		it('should throw an error when isValidPayload() is called without implementation', async () => {
			const implementedAppliance = new PartiallyImplementedAppliance()
			await expect(async () => implementedAppliance.isValidPayload())
				.rejects.toBeInstanceOf(NotImplementedError)
		})

		it('should throw an error when invoke() is called without implementation', async () => {
			const implementedAppliance = new PartiallyImplementedAppliance()
			await expect(async () => implementedAppliance.invoke())
				.rejects.toBeInstanceOf(NotImplementedError)
		})

		it('should allow construction when extended', () => {
			expect(() => {
				new PartiallyImplementedAppliance() // eslint-disable-line no-new
			}).not.toThrow(Error)
		})

		it('should not throw an error when getInputTypes() is called with implementation', () => {
			const implementedAppliance = new FullyImplementedAppliance()
			expect(() => implementedAppliance.getInputTypes()).not.toThrow(NotImplementedError)
		})

		it('should not throw an error when getOutputTypes() is called with implementation', () => {
			const implementedAppliance = new FullyImplementedAppliance()
			expect(() => implementedAppliance.getOutputTypes()).not.toThrow(NotImplementedError)
		})

		it('should not throw an error when isValidPayload() is called with implementation', async () => {
			const implementedAppliance = new FullyImplementedAppliance()
			expect(await implementedAppliance.isValidPayload()).toBeDefined()
		})

		it('should not throw an error when invoke() is called with implementation', async () => {
			const implementedAppliance = new FullyImplementedAppliance()
			expect(await implementedAppliance.invoke()).toBeDefined()
		})

		it('should throw an error when a non-payload is ingested', async () => {
			const implementedAppliance = new FullyImplementedAppliance()
			const invokeSpy = jest.spyOn(implementedAppliance, 'invoke')
			const payload = 'bad data'
			await expect(async () => implementedAppliance.ingestPayload(payload))
				.rejects.toBeInstanceOf(AssertionError)
			expect(invokeSpy).not.toHaveBeenCalled()
		})

		it('should throw an error when an invalid payload is ingested', async () => {
			const implementedAppliance = new FullyImplementedAppliance()
			implementedAppliance.isValidPayload = () => false
			const invokeSpy = jest.spyOn(implementedAppliance, 'invoke')
			const payload = new Payload()
			await expect(async () => implementedAppliance.ingestPayload(payload))
				.rejects.toBeInstanceOf(AssertionError)
			expect(invokeSpy).not.toHaveBeenCalled()
		})

		it('should call invoke() when a valid payload is ingested', async () => {
			const implementedAppliance = new FullyImplementedAppliance()
			const invokeSpy = jest.spyOn(implementedAppliance, 'invoke')
			const payload = new Payload()
			await implementedAppliance.ingestPayload(payload)
			expect(invokeSpy).toHaveBeenCalledTimes(1)
		})
	})
})
