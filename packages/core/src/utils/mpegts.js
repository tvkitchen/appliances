// MPEG-TS positions are stored as 1/90000'th of a second
const DEFAULT_BASETIME = 1 / 90000

/**
 * Converts a pts or dts extracted from an MPEG-TS packet to seconds.
 *
 * @param  {Number} ts       The pts or dts value to be converted.
 * @param  {Number} baseTime The MPEG-TS basetime associated with the ts.
 * @return {Number}          The number of seconds represented by the pts or dts.
 */
export function tsToMilliseconds(ts, baseTime = DEFAULT_BASETIME) {
	const baseTimeMs = baseTime * 1000
	return +(ts * baseTimeMs).toFixed(0)
}

/**
 * Exports a TSDemuxer MPEG-TS Packet as defined in the TSDemuxer project.
 *
 * @return {Object} A TSDemuxer Packet with no data
 */
export const generateEmptyPacket = () => ({
	data: [],
	pts: 0,
	dts: 0,
	frame_ticks: 0,
	program: 0,
	stream_number: 0,
	type: 0,
	stream_id: 0,
	content_type: 0,
	frame_num: 0,
})
