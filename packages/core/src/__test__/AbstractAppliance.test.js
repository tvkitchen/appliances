// Mocked imports
import { Transform } from 'stream'

// Test imports
import { AssertionError } from 'assert'
import { AbstractInstantiationError } from '@tvkitchen/base-errors'
import {
	Payload,
	PayloadArray,
} from '@tvkitchen/base-classes'
import { AbstractAppliance } from '../AbstractAppliance'
import {
	DynamicTypeAppliance,
	FullyImplementedAppliance,
	PartiallyImplementedAppliance,
} from './classes'

const getValidPayload = () => new Payload({ type: 'FOO' })

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

	describe('isValidPayload', () => {
		it('should error when passed a payload with an invalid type', async () => {
			expect.assertions(1)
			const payload = new Payload({ type: 'not a real payload type' })
			const appliance = new FullyImplementedAppliance()
			appliance.isValidPayload(payload)
				.catch((err) => expect(err).toBeDefined())
		})

		it('should return true when passed a payload with a matching inputType', async () => {
			const payload = new Payload({ type: 'FOO' })
			const appliance = new FullyImplementedAppliance()
			expect(await appliance.isValidPayload(payload)).toBe(true)
		})

		it('should handle dynamic payload types', async () => {
			const payloadType = 'myType'
			const payload = new Payload({ type: payloadType })
			const wrongPayload = new Payload({ type: 'anotherType' })
			const appliance = new DynamicTypeAppliance(
				{ inputTypes: [payloadType] },
			)
			expect(await appliance.isValidPayload(payload)).toBe(true)
			appliance.isValidPayload(wrongPayload)
				.catch((err) => expect(err).toBeDefined())
		})
	})

	describe('push', () => {
		it('should decorate payloads that do not have an origin', async () => {
			jest.clearAllMocks()
			const pushSpy = jest.spyOn(Transform.prototype, 'push').mockImplementation()
			const payload = new Payload({
				origin: '2021-04-23T15:38:33.084Z',
				type: 'FOO',
			})
			const appliance = new FullyImplementedAppliance()
			appliance.invoke = () => {
				appliance.push(new Payload())
				return null
			}
			await appliance.ingestPayload(payload)
			expect(pushSpy).toHaveBeenCalledTimes(1)
			expect(pushSpy.mock.calls[0][0].origin).toEqual('2021-04-23T15:38:33.084Z')
		})
		it('should not decorate payloads that have an origin', async () => {
			jest.clearAllMocks()
			const pushSpy = jest.spyOn(Transform.prototype, 'push').mockImplementation()
			const payload = new Payload({
				origin: '2021-04-23T15:38:33.084Z',
				type: 'FOO',
			})
			const appliance = new FullyImplementedAppliance()
			appliance.invoke = () => {
				appliance.push(new Payload({
					origin: '2021-04-23T16:38:33.084Z',
				}))
				return null
			}
			await appliance.ingestPayload(payload)
			expect(pushSpy).toHaveBeenCalledTimes(1)
			expect(pushSpy.mock.calls[0][0].origin).toEqual('2021-04-23T16:38:33.084Z')
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
			implementedAppliance.isValidPayload = async () => false
			const invokeSpy = jest.spyOn(implementedAppliance, 'invoke')
			const payload = getValidPayload()
			await expect(async () => implementedAppliance.ingestPayload(payload))
				.rejects.toBeInstanceOf(AssertionError)
			expect(invokeSpy).not.toHaveBeenCalled()
		})

		it('should call invoke() when a valid payload is ingested', async () => {
			const implementedAppliance = new FullyImplementedAppliance()
			const invokeSpy = jest.spyOn(implementedAppliance, 'invoke')
			const payload = getValidPayload()
			await implementedAppliance.ingestPayload(payload)
			expect(invokeSpy).toHaveBeenCalledTimes(1)
		})

		it('should pass invoke the list of ingested payloads', async () => {
			const implementedAppliance = new FullyImplementedAppliance()
			const invokeSpy = jest.spyOn(implementedAppliance, 'invoke')
			const payload = getValidPayload()
			await implementedAppliance.ingestPayload(payload)
			expect(invokeSpy.mock.calls[0][0] instanceof PayloadArray).toBe(true)
			expect(invokeSpy.mock.calls[0][0].length).toBe(1)
		})

		it('should update payloads to be the return value of invoke()', async () => {
			const implementedAppliance = new FullyImplementedAppliance()
			const payload = getValidPayload()
			const remainingPayloads = new PayloadArray()
			implementedAppliance.invoke = jest.fn().mockReturnValueOnce(remainingPayloads)
			await implementedAppliance.ingestPayload(payload)
			expect(implementedAppliance.payloads).toBe(remainingPayloads)
		})

		it('should return true if invoke returns null', async () => {
			const implementedAppliance = new FullyImplementedAppliance()
			const payload = getValidPayload()
			implementedAppliance.invoke = jest.fn().mockReturnValueOnce(null)
			expect(await implementedAppliance.ingestPayload(payload)).toBe(true)
		})

		it('should return true if invoke returns an empty payload array', async () => {
			const implementedAppliance = new FullyImplementedAppliance()
			const payload = getValidPayload()
			const remainingPayloads = new PayloadArray()
			implementedAppliance.invoke = jest.fn().mockReturnValueOnce(remainingPayloads)
			expect(await implementedAppliance.ingestPayload(payload)).toBe(true)
		})

		it('should return false if invoke returns a payload array of the same size', async () => {
			const implementedAppliance = new FullyImplementedAppliance()
			const payload = getValidPayload()
			const remainingPayloads = new PayloadArray(
				getValidPayload(),
			)
			implementedAppliance.invoke = jest.fn().mockReturnValueOnce(remainingPayloads)
			expect(await implementedAppliance.ingestPayload(payload)).toBe(false)
		})
	})
})
