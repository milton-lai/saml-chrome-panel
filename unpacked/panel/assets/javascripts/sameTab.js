function scrubLinkRequest(message, sender, sendResponse) {
	console.debug("sameTab.js received request");
	if (message.command === 'scrub') {
		const links = document.querySelectorAll('a');
		for (let i = 0; i < links.length; ++i) {
			links[i].target = '_self';
		}
		const forms = document.querySelectorAll('form');
		for (let i = 0; i < forms.length; ++i) {
			forms[i].target = '_self';
		}
		console.log("All 'a/form' tags have been scrubbed and now have a target set to '_self'");
		sendResponse("success");
	}
	return true;
}

chrome.runtime.onMessage.addListener(scrubLinkRequest);
