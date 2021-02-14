console.log("background.js loaded");
const tab_log = function(json_args) {
  var args = JSON.parse(unescape(json_args));
  console[args[0]].apply(console, Array.prototype.slice.call(args, 1));
}

function onMessageRequest(message, sender, sendResponse) {
    console.log("background.js received request");
    if (message.command === 'scrub') {
        console.log("background.js sending scrub message to chrome.tabs");
        console.log("background.js using tabId: " + message.tabId);
        chrome.tabs.sendMessage(message.tabId, {command: message.command}, function(response) {
            sendResponse("success");
        });
    } else if (message.command === 'sendToConsole') {
        chrome.tabs.executeScript(message.tabId, {
            code: "("+ tab_log + ")('" + message.args + "');",
        });
        sendResponse("success");
    }
    return true;
}

chrome.runtime.onMessage.addListener(onMessageRequest);
