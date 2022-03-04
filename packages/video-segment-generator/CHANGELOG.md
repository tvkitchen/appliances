# Changelog for @tvkitchen/appliance-video-segment-generator

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Changed
- Update `@tvkitchen/appliance-core` to version `0.9.0`.

## [0.2.0] - 2021-05-13
### Changed
- Update `@tvkitchen/base-classes` to version `2.0.0-alpha.1`.
- Update to support `origin` payloads instead of `timestamp`.
- Change `origin` appliance parameter to `startingAt`.
- Update `@tvkitchen/appliance-core` to version `0.7.0`.

### Fixed
- Fixed a bug where non-zero originPositions would result in incorrect periodPositions.

## [0.1.1] - 2021-04-07
### Changed
- Update the required version of appliance-core to 0.6.1

## [0.1.0] - 2021-04-07 (DEPRECATED)
### Added
- Initial implementation of the `VideoSegmentGenerator` appliance.

[Unreleased]: https://github.com/tvkitchen/appliances/compare/@tvkitchen/appliance-video-segment-generator@0.2.0...HEAD
[0.2.0]: https://github.com/tvkitchen/appliances/releases/tag/@tvkitchen/appliance-video-segment-generator@0.2.0
[0.1.1]: https://github.com/tvkitchen/appliances/releases/tag/@tvkitchen/appliance-video-segment-generator@0.1.1
[0.1.0]: https://github.com/tvkitchen/appliances/releases/tag/@tvkitchen/appliance-video-segment-generator@0.1.0
