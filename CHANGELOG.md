# MMM-YouTubeChannelStats Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](https://semver.org/).

## [1.4.0] - Unreleased (Develop Branch)

### Added

### Updated

### Removed

### Fixed

## [1.3.0] - 2021-04-05

### Added

- The number of channels displayed can be limited using the `maxChannels` configuration option.
- The channels displayed will automatically rotated if the number of `channelIds` exceeds `maxChannels`.
- The `grayscale` configuration option can be used to control the appearance of the channels thumbnail image. By default, thumbnails will be shown in grayscale. When set to `false`, thumbnails will appear as on YouTube.
- Added an animated example screenshot to illustrate multiple channel support, channel rotation and thumbnail position/display.
- Unit tests for custom functions in the core module file.

### Changed

- Channel `stats` are now formatted to reflect how they [appear on YouTube](https://developers.google.com/youtube/v3/revision_history#september-10,-2019).
- Multiple `channelIds` can now be supplied as a string (in CSV format) as well as a string array.
- Refactored the functions used to call the API.

## [1.2.0] - 2021-04-03

### Added

- Multiple YouTube channels can be displayed within one instance of the module using the new `channelIds` configuration option.

### Changed

- The channel thumbnail now appears to the right of the statistics when the module is positioned on the right of the MagicMirror.

### Removed

- The `comments` value is no longer supported in the `stats` configuration option as `subscriber.commentCount` has been [deprecated by the API](https://developers.google.com/youtube/v3/revision_history#september-9,-2020).
- Removed the `channelId` configuration option. Existing implementations should be updated to use the new `channelIds` configuration option instead.
- Removed the `setHeader` configuration option. The YouTube channel title is now added as a header within the module above each channel.

## [1.1.0] - 2021-04-02

### Added

- Added Github action for automated linting using prettier, eslint and stylelint.
- Added French, German, Italian and Spanish translations.

## [1.0.0] - 2020-07-26

### Initial release of the MMM-YouTubeChannelStats for MagicMirror
