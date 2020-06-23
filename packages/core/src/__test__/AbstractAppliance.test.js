import { AssertionError } from 'assert'
import { AbstractInstantiationError } from '@tvkitchen/base-errors'
import {
	Payload,
	PayloadArray,
} from '@tvkitchen/base-classes'
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

		it('should pass invoke the list of ingested payloads', async () => {
			const implementedAppliance = new FullyImplementedAppliance()
			const invokeSpy = jest.spyOn(implementedAppliance, 'invoke')
			const payload = new Payload()
			await implementedAppliance.ingestPayload(payload)
			expect(invokeSpy.mock.calls[0][0] instanceof PayloadArray).toBe(true)
			expect(invokeSpy.mock.calls[0][0].length).toBe(1)
		})

		it('should update payloads to be the return value of invoke()', async () => {
			const implementedAppliance = new FullyImplementedAppliance()
			const payload = new Payload()
			const remainingPayloads = new PayloadArray()
			implementedAppliance.invoke = jest.fn().mockReturnValueOnce(remainingPayloads)
			await implementedAppliance.ingestPayload(payload)
			expect(implementedAppliance.payloads).toBe(remainingPayloads)
		})

		it('should return true if invoke returns an empty payload array', async () => {
			const implementedAppliance = new FullyImplementedAppliance()
			const payload = new Payload()
			const remainingPayloads = new PayloadArray()
			implementedAppliance.invoke = jest.fn().mockReturnValueOnce(remainingPayloads)
			expect(await implementedAppliance.ingestPayload(payload)).toBe(true)
		})

		it('should return false if invoke returns a payload array of the same size', async () => {
			const implementedAppliance = new FullyImplementedAppliance()
			const payload = new Payload()
			const remainingPayloads = new PayloadArray(
				new Payload(),
			)
			implementedAppliance.invoke = jest.fn().mockReturnValueOnce(remainingPayloads)
			expect(await implementedAppliance.ingestPayload(payload)).toBe(false)
		})
	})
})
