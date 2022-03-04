# TV Kitchen Video HLS Receiver Appliance

```
inputTypes: none
outputTypes: STREAM.CONTAINER
```

The Video HLS Receiver Appliance extracts video and audio data from a [HTTP Live Streaming (HLS)](https://en.wikipedia.org/wiki/HTTP_Live_Streaming) URL.

The video and audio streams are exposed via `STREAM.CONTAINER` payloads containing mpegts data.

If the HLS stream has a `SUBTITLE` track, that track is not included in the mpegts stream, and must be received separately.

## Dependencies

In order to use this appliance, you must have [ffmpeg](https://www.ffmpeg.org/) installed on your system, and the `ffmpeg` command must work.

## About the TV Kitchen

TV Kitchen is a project of [Bad Idea Factory](https://biffud.com).  Learn more at [the TV Kitchen project site](https://tv.kitchen).

