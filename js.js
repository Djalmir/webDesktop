function removeErrMsg(field) {
	let msgs = errorMsg.getMessages()
	msgs = msgs.filter(msg => msg.field == field)
	msgs.map((msg) => {
		errorMsg.closeMsg(msg)
	})
}

function isValidHttpUrl(string) {
	let url

	try {
		url = new URL(string)
	} catch (_) {
		return false
	}

	return url.protocol === "http:" || url.protocol === "https:"
}

let loadingLock = false

//Intercepting zion http requests
document.addEventListener('zBeforeRequest', (e) => {
	// console.log('before request', e)
	if (!loadingLock)
		appLoading.loading = true
})

//Intercepting zion http responses
document.addEventListener('zAfterRequest', (e) => {
	// console.log('after request', e)
	if (!loadingLock)
		appLoading.loading = false
})