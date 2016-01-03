chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
      if (request.command == 'scrub') {
			var links = document.querySelectorAll('a');
			for (i = 0; i < links.length; ++i) {
				links[i].target = '_self';
			}
			var forms = document.querySelectorAll('form');
			for (i = 0; i < forms.length; ++i) {
				forms[i].target = '_self';
			}
			console.log("All 'a/form' tags have been scrubbed and now have a target set to '_self'");
	  }
});