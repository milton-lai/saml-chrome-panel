# saml-chrome-panel
Chrome DevTools Extension Panel for viewing decrypted SAML messages in its own custom tab.

This is for Chrome only (tested on OSX 10.10.5 and Chrome 44.0.2403.157)

## Install
To install, go to chrome://extensions in your browser, Enable Developer Mode and the click on "Load unpacked Extension..." or drag in the .crx

## Use
To view the messages, you'll need to load developer tools and head to the SAML Chrome tab. Then go to a page which initiates a SAML transaction and load it. You'll then notice only SAML requests will appear in the left hand column and when selected, the SAML message will be decrypted and shown on the right hand side. Some additional information is available (such as Request information and Cookie information).

This should work for both the requests and responses.

## Notes
I will look to make the SAML message formatted a bit nicer (with colours would be terrific).

The biggest note is that since the Developer Tools only loads per tab, if you have a link that opens up a SP-init transaction in a new tab, then it won't trap any of that data. This is a Chrome issue. 

An excellent way to resolve this is with this extension for chrome: https://chrome.google.com/webstore/detail/open-link-in-same-tab/kgpefningcojblgciiljmabggbbjiojb
It has a right-click contextual option which will open the link in the SAME tab. This helps for the majority of normal links, but I'm not sure how it handles javascript-loaded new windows/tabs.
