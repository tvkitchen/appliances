import path from 'path'

export const isHlsUrl = (url) => path.extname(url) === 'm3u8'

export const getRootUrl = (url) => path.parse(url).dir
