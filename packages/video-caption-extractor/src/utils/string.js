/**
 * Returns the difference between two strings.
 *
 * @param  {String} strA The string whose differences are being identified.
 * @param  {String} strB The base string being detected
 * @return {String}      The difference
 */
export const getDiff = (strA, strB) => strA.split(strB).join('')
