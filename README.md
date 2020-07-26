# MagicMirror Module: MMM-YouTubeChannelStats

A MagicMirror Module for displaying stats for a YouTube channel.

[![Platform](https://img.shields.io/badge/platform-MagicMirror-informational)](https://MagicMirror.builders)
[![License](https://img.shields.io/badge/license-MIT-informational)](https://raw.githubusercontent.com/ianperrin/MMM-YouTubeChannelStats/master/LICENSE)
[![Code Climate](https://codeclimate.com/github/ianperrin/MMM-YouTubeChannelStats/badges/gpa.svg)](https://codeclimate.com/github/ianperrin/MMM-YouTubeChannelStats)
[![Known Vulnerabilities](https://snyk.io/test/github/ianperrin/MMM-YouTubeChannelStats/badge.svg)](https://snyk.io/test/github/ianperrin/MMM-YouTubeChannelStats)

## Installation

1. Stop your MagicMirror and clone the repository into the modules folder

   ````bash
   cd ~/MagicMirror/modules
   git clone https://github.com/ianperrin/MMM-YouTubeChannelStats.git
   cd ~/MagicMirror/modules/MMM-YouTubeChannelStats
   ````

2. Create a Google API key

    * For more information see the Google documentation for [obtaining a developer key](https://developers.google.com/youtube/v3/getting-started)
    * Make a note of the `API key`

3. Add the module to the config file (`~/MagicMirror/config/config.js`) for your mirror.

   ````javascript
   modules: [
       {
           module: "MMM-YouTubeChannelStats",
           position: "top_right",
           config: {
               channelId: "your_youtube_channel_id",
               apiKey: "your_google_api_key"
           }
       }
   ]
   ````

   The full list of config options can be found in the [configuration options](#configuration-options) table.

4. Restart the MagicMirror

    ````bash
    pm2 restart mm
    ````

## Updating the module

To update the module to the latest version,

1. Pull the changes from this repository into the module folder:

   ````bash
   cd ~/MagicMirror/modules/MMM-YouTubeChannelStats
   git pull
   ````

2. Restart the mirror

    ````bash
    pm2 restart mm
    ````
    
## Configuration options

The following properties can be added to the configuration:

| **Option** | **Default** | **Description** | **Possible Values** |
| --- | --- | --- | --- |
| `channelId` |  | The YouTube channel id |  |
| `apiKey` |  | The YouTube API key |  |
| `stats` | `["views", "comments", "subscribers", "videos"]` | *Optional* - Which statistics to display. *Note:* - The stats can be listed in any order, and only one is required. However, they must be entered as an array of strings i.e. comma separated values within square brackets. | `views`, `comments`, `subscribers`, `videos` |
| `setHeader` | `true` | *Optional* - Set the module header using the channel name  | `true` or `false` |
| `showLabels` | `true` | *Optional* - Display labels next to the statistics | `true` or `false` |
| `fetchInterval` | `3600 * 1000` (1 hour) | *Optional* - How often the statistics should be fetched (in milliseconds)  | `1000` - `86400000` |
| `animationSpeed` | `2.5 * 1000` (2.5 seconds) | *Optional* - The speed of the update animation (in milliseconds) | `0` - `5000` |  