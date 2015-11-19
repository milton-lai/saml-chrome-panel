chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
	  var links = document.querySelectorAll('a');
	  for (i = 0; i < links.length; ++i) {
		links[i].target = '_self';
	  }
	  console.log("All 'a href' links have been scrubbed and now have a target set to '_self'")
});