# TV Kitchen Video Segment Generator Appliance

---
inputTypes: STREAM.CONTAINER
outputTypes: SEGMENT.START
---

The Video Segment Generator Appliance will take a stream of payloads and identify new segment starts according to the timestamp of those payloads.

## Configuration Options
The appliance takes in the following configuration values:

- `interval` (milliseconds): the number of milliseconds that the clock will track (e.g. 60000 would be a clock that can track up to one minute).  Default is `INTERVALS.INFINITE`.

- `origin` (ISO String): what time does the clock start (what is the first instance of "0" when identifying segments).  Default is the ISO string value for the time of instantiation.

- `segments`: array of objects and / or numbers specifying segment start times.  If the value is an object the `offset` attribute is used to convey the segment start offset.  Default is `[0]`.
	- `offset` (milliseconds): the period offset that demarks the start of the segment.
	- `data` (json): the data to associate with the new segment.

## Exposed Constants
- PERIOD.INFINITE (0)
- PERIOD.MINUTE (60000)
- PERIOD.HOUR (3600000)
- PERIOD.DAY (86400000)
- PERIOD.WEEK (604800000)

## Dependencies
None.

## About the TV Kitchen

TV Kitchen is a project of [Bad Idea Factory](https://biffud.com).  Learn more at [the TV Kitchen project site](https://tv.kitchen).
