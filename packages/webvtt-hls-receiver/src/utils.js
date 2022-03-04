import fetch from 'node-fetch'
import path from 'path'
import HLS from 'hls-parser'
import webvtt from 'node-webvtt'

export const isHlsUrl = (url) => path.extname(url) === '.m3u8'

export const getRootUrl = (url) => path.parse(url).dir

export const arrayHasItem = (items, soughtItem, isEqual) => items.find(
	(item) => isEqual(item, soughtItem)
)

export const getNewItemsBy = (currentItems, nextItems, isEqual) => nextItems.filter(
	(nextItem) => !arrayHasItem(currentItems, nextItem, isEqual)
)

export const loadHlsData = async (url) => {
	const result = await fetch(url)
	const m3u8Data = await result.text()
	const parsedData = HLS.parse(m3u8Data)
	return parsedData
}

export const loadWebVttData = async (url) => {
	const result = await fetch(url)
	const data = await result.text()
	const parsedData = webvtt.parse(
		data,
		{
			meta: true,
			strict: false,
		},
	)
	return parsedData
}

export const convertWebVttCueToPayload = (cue) => ({
	data: cue.text,
	type: 'TEXT.CUE',
	position: Math.round(cue.start * 1000),
	duration: Math.round((cue.end - cue.start) * 1000),
	origin: '',
})
