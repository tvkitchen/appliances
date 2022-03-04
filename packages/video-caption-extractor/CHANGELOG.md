# Changelog for @tvkitchen/appliance-video-caption-extractor

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.6.0] - 2022-03-04
### Changed
- Update `@tvkitchen/appliance-core` to version `0.9.0`.

## [0.5.1] - 2021-08-18
### Fixed
- The caption extraction algorithm now only processes finalized lines from CCExtractor.  This prevents issues where edited lines would be emitted redundantly.
- TEXT.ATOM payloads emitted by this appliance no longer contain multiple characters.

## [0.5.0] - 2021-05-13
### Changed
- Update `@tvkitchen/base-classes` to version `2.0.0-alpha.1`.
- Update `@tvkitchen/appliance-core` to version `0.7.0`.

### Fixed
- No longer emits strange payloads when CCExtractor provides `00:00:00` timestamps.

## [0.4.0] - 2021-04-21
- Update the required version of appliance-core to 0.6.1.
- Renamed the package from `@tvkitchen/appliance-ccextractor` to `@tvkitchen/appliance-video-caption-extractor`.

## [0.3.1] - 2021-02-19
### Changed
- Emit newline atoms (`\n`) when a new caption line has started.

## [0.3.0] - 2020-10-18
### Changed
- Update `@tvkitchen/appliance-core` to `0.5.0`.

## [0.2.0] - 2020-09-22
### Changed
- Changed from default exports to named exports.
- Update `@tvkitchen/appliance-core` to `0.4.0`.

### Added
- Now exports the `CCExtractorLine` object because why not.

## [0.1.0] - 2020-09-09
### Added
- Initial implementation of the `CCExtractorAppliance`

[Unreleased]: https://github.com/tvkitchen/appliances/releases/tag/@tvkitchen/appliance-ccextractor@0.6.0...HEAD
[0.6.0]: https://github.com/tvkitchen/appliances/releases/tag/@tvkitchen/appliance-ccextractor@0.6.0
[0.5.1]: https://github.com/tvkitchen/appliances/releases/tag/@tvkitchen/appliance-ccextractor@0.5.1
[0.5.0]: https://github.com/tvkitchen/appliances/releases/tag/@tvkitchen/appliance-ccextractor@0.5.0
[0.4.0]: https://github.com/tvkitchen/appliances/releases/tag/@tvkitchen/appliance-ccextractor@0.4.0
[0.3.1]: https://github.com/tvkitchen/appliances/releases/tag/@tvkitchen/appliance-ccextractor@0.3.1
[0.3.0]: https://github.com/tvkitchen/appliances/releases/tag/@tvkitchen/appliance-ccextractor@0.3.0
[0.2.0]: https://github.com/tvkitchen/appliances/releases/tag/@tvkitchen/appliance-ccextractor@0.2.0
[0.1.0]: https://github.com/tvkitchen/appliances/releases/tag/@tvkitchen/appliance-ccextractor@0.1.0


