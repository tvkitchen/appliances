import {
	getNewItemsBy,
	loadHlsData,
} from './utils'

function segmentsAreEqual(firstSegment, secondSegment) {
	return firstSegment.uri === secondSegment.uri
}

class HlsPlaylistProcessor {
	playlistUrl = null
	previousSegments = []
	refreshIntervalId = null

	constructor({
		playlistUrl,
		onSegment,
		refreshInterval = 1000,
	}) {
		this.playlistUrl = playlistUrl
		this.onSegment = onSegment
		this.refreshInterval = refreshInterval
	}

	refresh = async () => {
		const newPlaylistData = await loadHlsData(this.playlistUrl)
		const newSegments = getNewItemsBy(
			this.previousSegments,
			newPlaylistData.segments,
			segmentsAreEqual,
		)
		this.previousSegments = newPlaylistData.segments
		newSegments.forEach((newSegment) => {
			this.onSegment(newSegment)
		})
	}

	start = () => {
		this.stop()
		this.refreshIntervalId = setInterval(
			this.refresh,
			this.refreshInterval,
		)
	}

	stop = () => {
		clearInterval(this.refreshIntervalId)
		this.refreshIntervalId = null
	}
}


export { HlsPlaylistProcessor }
