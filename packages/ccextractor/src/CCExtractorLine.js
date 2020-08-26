
class CCExtractorLine {
	constructor({
		start = 0,
		end = 0,
		text = '',
	} = {}) {
		Object.assign(this, {
			start,
			end,
			text,
		})
	}
}

export default CCExtractorLine
