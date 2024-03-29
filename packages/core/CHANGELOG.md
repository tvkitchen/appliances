# Changelog for @tvkitchen/appliance-core

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.9.0] - 2022-03-04
### Added
- `AbstractAppliance` now passes the instance's settings to the `getInputTypes` method when determining a payload's validity.  This allows appliances to define configurable input and output types.

### Changed
- Update `@tvkitchen/base-interfaces` to version `4.0.0-alpha.5`.

## [0.8.0] - 2020-07-02
- The `AbstractVideoIngestionAppliance` is now renamed to `AbstractVideoReceiverAppliance`.

## [0.7.1] - 2020-07-02
### Changed
- The `AbstractVideoIngestionAppliance` now only internally tracks the position of the video stream in a given MPEG-TS stream, as opposed to tracking all streams.

### Fixed
- The optional `baseTime` parameter is now in terms of the fraction instead of the denominator of the fraction (e.g. `1/90000` instead of `90000`).
- `AbstractVideoIngestionAppliance` now supports streams that have been running long enough for a PTS rollover to occur.

## [0.7.0] - 2020-05-13
### Added
- `AbstractAppliance` will now populate the `origin` of outbound payloads.
- Update `AbstractVideoIngestionAppliance` to filter corrupt payloads.

### Changed
- Update `@tvkitchen/base-classes` to version `2.0.0-alpha.1`.
- Update `@tvkitchen/base-interfaces` to version `4.0.0-alpha.4`.
- Update `AbstractVideoIngestionAppliance` to populate Payload `origin` instead of `timestamp`.
- Remove arrow function method definitions from `AbstractVideoIngestionAppliance` and `AbstractAppliance`.
- Use `mpegts-demuxer` instead of `ts-demuxer` for processing video.

## [0.6.1] - 2020-04-07
### Added
- `AbstractVideoIngestionAppliance` now generates payloads with timestamps, and accepts an `origin` setting on appliance construction.

## 0.6.0 - 2020-04-07
This package is identical to [0.6.1] but was deprecated due to a publication error.

### Changed
- `AbstractAppliance` no longer errors if `invoke` returns a null value.
- Update `@tvkitchen/base-classes` to version `1.4.0-alpha.2`.

## [0.5.0] - 2020-10-18
### Changed
- Increase the `base-interfaces` version dependency to `4.0.0-alpha.3`.
- Remove built in support for event emission from `AbstractAppliance`.
- Update `AbstractVideoIngestionAppliance` to use the `Transform` API, and no longer emit custom events.

### Added
- `AbstractAppliance` now accepts a `logger` parameter.

## [0.4.0]
### Changed
- Changed from default exports to named exports (internally).

### Fixed
- `AbstractVideoIngestionAppliance` ffmpeg spawn updated to ignore `stderr`.

## [0.3.1]
### Fixed
- `start` and `stop` no longer attempts to access `producer` in `AbstractVideoIngestionAppliance`.
- `AbstractVideoIngestionAppliance` properly returns booleans for `start` and `stop`.

## [0.3.0]
### Changed
- Rename `overrideSettings` to `settings` in abstract appliance classes.

### Added
- `isValidPayload` implementation to `AbstractAppliance`.

## [0.2.0] - 2020-08-25
### Added
- Initial implementation of the `AbstractVideoIngestionAppliance`.

### Changed
- Increase the `base-interfaces` version dependency to `4.0.0-alpha.2`.
 
## [0.1.0] - 2020-08-23
### Added
- Initial implementation of the `AbstractAppliance`.
- Add the `base-constants` dependency for applianceEvents.
- Add `emit` method to AbstractAppliance.

### Changed
- Increase the `base-classes` version dependency to `1.3.0`.
- Increase the `base-interfaces` version dependency to `3.0.0`.

[Unreleased]: https://github.com/tvkitchen/appliances/compare/@tvkitchen/appliance-video-file-ingestion@0.9.0...HEAD
[0.9.0]: https://github.com/tvkitchen/appliances/releases/tag/@tvkitchen/appliance-core@0.9.0
[0.8.0]: https://github.com/tvkitchen/appliances/releases/tag/@tvkitchen/appliance-core@0.8.0
[0.7.1]: https://github.com/tvkitchen/appliances/releases/tag/@tvkitchen/appliance-core@0.7.1
[0.7.0]: https://github.com/tvkitchen/appliances/releases/tag/@tvkitchen/appliance-core@0.7.0
[0.6.1]: https://github.com/tvkitchen/appliances/releases/tag/@tvkitchen/appliance-core@0.6.1
[0.5.0]: https://github.com/tvkitchen/appliances/releases/tag/@tvkitchen/appliance-core@0.5.0
[0.4.0]: https://github.com/tvkitchen/appliances/releases/tag/@tvkitchen/appliance-core@0.4.0
[0.3.1]: https://github.com/tvkitchen/appliances/releases/tag/@tvkitchen/appliance-core@0.3.1
[0.3.0]: https://github.com/tvkitchen/appliances/releases/tag/@tvkitchen/appliance-core@0.3.0
[0.2.0]: https://github.com/tvkitchen/appliances/releases/tag/@tvkitchen/appliance-core@0.2.0
[0.1.0]: https://github.com/tvkitchen/appliances/releases/tag/@tvkitchen/appliance-core@0.1.0
