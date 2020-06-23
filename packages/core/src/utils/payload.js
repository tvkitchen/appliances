// Disabling because we intend to have more exports in the future.
/* eslint-disable import/prefer-default-export */
import {
	Payload,
	PayloadArray,
} from '@tvkitchen/base-classes'

export const isPayloadInstance = (data) => data instanceof Payload

export const isPayloadArrayInstance = (data) => data instanceof PayloadArray
