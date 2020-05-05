# TV Kitchen Appliance Core

This repository contains core classes and constants for use by TV Kitchen Appliances and code that interacts with TV Kitchen Appliances.

## Key Repository Contents

This repository has some supporting classes, but the content that will be relevant to others are:

* `AbstractAppliance` is a class which all TV Kitchen Appliances should extend and implement.
* `Payload` is a class that represents a complete data + metadata packet that an appliance will expect.
* `errors` is the collection of specific exceptions / errors that a TV Kitchen Appliance might throw.

## Implementing an Abstract Appliance

An implemented TV Kitchen Appliance must override the following methods:

1. `getInputTypes`: returns an array of strings that represent the data types that the appliance accepts.
2. `getOutputTypes`: returns an array of strings that represent the data types that the appliance produces.
3. `isValidPayload`: returns a boolean indicating if a given `Payload` (instance of data) meets the conditions of the appliance.
4. `invoke`: will actually process the data that has been collected by the appliance so far.

## About the TV Kitchen

TV Kitchen is a project of [Bad Idea Factory](https://biffud.com).  Learn more at [the TV Kitchen project site](https://tv.kitchen).
