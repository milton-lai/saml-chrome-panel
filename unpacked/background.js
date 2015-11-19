// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const tab_log = function(json_args) {
  var args = JSON.parse(unescape(json_args));
  console[args[0]].apply(console, Array.prototype.slice.call(args, 1));
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponseParam) {
    if (request.command == 'scrub') {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
          console.log(response);
        });
      });
    } else if (request.command == 'sendToConsole') {
    chrome.tabs.executeScript(request.tabId, {
        code: "("+ tab_log + ")('" + request.args + "');",
    });
  }
});