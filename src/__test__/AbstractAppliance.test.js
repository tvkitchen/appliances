import { AssertionError } from 'assert'
import { AbstractInstantiationError } from '@tvkitchen/base-errors'
import { Payload } from '@tvkitchen/base-classes'
import AbstractAppliance from '../AbstractAppliance'
import {
	FullyImplementedAppliance,
	PartiallyImplementedAppliance,
} from './classes'

describe('AbstractAppliance #unit', () => {
	describe('construction', () => {
		it('should throw an error when constructed directly', () => {
			expect(() => {
				new AbstractAppliance() // eslint-disable-line no-new
			}).toThrow(AbstractInstantiationError)
		})

		it('should allow construction when extended', () => {
			expect(() => {
				new PartiallyImplementedAppliance() // eslint-disable-line no-new
			}).not.toThrow(Error)
		})
	})

	describe('ingestPayload', () => {
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
