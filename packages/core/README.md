# TV Kitchen Appliance Core

This package contains core classes for use by TV Kitchen Appliances and code that interacts with TV Kitchen Appliances.

## Key Contents

This package has some supporting classes, but the content that will be relevant to others are:

* `AbstractAppliance` is a class which all TV Kitchen Appliances should extend and implement.

* `AbstractVideoIngestionAppliance` is a class that converts an arbitrary video input stream into properly decorated STREAM.CONTAINER Payloads.

## Implementing an Abstract Appliance

An implemented TV Kitchen Appliance must override the following methods which are outlined in the [IAppliance interface](https://github.com/tvkitchen/base/blob/master/packages/interfaces/src/IAppliance.js):

1. `getInputTypes`: returns an array of strings that represent the data types that the appliance accepts.
2. `getOutputTypes`: returns an array of strings that represent the data types that the appliance produces.
3. `isValidPayload`: returns a boolean indicating if a given `Payload` (instance of data) meets the conditions of the appliance.
4. `invoke`: will actually process the data that has been collected by the appliance so far.

## Implementing an Abstract Video Ingestion Appliance

An implemented TV Kitchen Video Ingestion Appliance must override the following methods:

1. `getInputStream`: returns an ReadbleStream to a video.

If you override `audit` please be sure to call super.audit() as well.

## About the TV Kitchen

TV Kitchen is a project of [Bad Idea Factory](https://biffud.com).  Learn more at [the TV Kitchen project site](https://tv.kitchen).
