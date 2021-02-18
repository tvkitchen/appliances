import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'

dayjs.extend(duration)

/**
 * Returns the difference between two strings.
 *
 * @param  {Number} milliseconds The ms timestamp being formatted.
 * @return {String}      				 The SRT-formatted timestamp.
 */
export const msToSrtTimestamp = (milliseconds) => dayjs.duration(milliseconds).format('HH:mm:ss,SSS')
