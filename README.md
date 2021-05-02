# saml-chrome-panel
Chrome DevTools Extension Panel for viewing decrypted SAML messages in its own custom tab.

![alt tag](https://raw.githubusercontent.com/milton-lai/saml-chrome-panel/master/SAMLforChromeLogo.png)

This is for Chrome only (tested on OSX 10.15.7 and Chrome 88.0.4324.150)

## Install
To install, go to chrome://extensions in your browser, Enable Developer Mode and the click on "Load unpacked Extension..." 

OR

https://chrome.google.com/webstore/detail/saml-chrome-panel/paijfdbeoenhembfhkhllainmocckace

## Use
To view the messages, you'll need to load developer tools and head to the SAML Chrome tab. Then go to a page which initiates a SAML transaction and load it. You'll then notice only SAML requests will appear in the left hand column and when selected, the SAML message will be decrypted and shown on the right hand side. Some additional information is available (such as Request information and Cookie information).

This should work for both the requests and responses.

## Notes
I will look to make the SAML message formatted a bit nicer (with colours would be terrific).

The biggest note is that since the Developer Tools only loads per tab, if you have a link that opens up a SP-init transaction in a new tab, then it won't trap any of that data. This is a Chrome issue. 

An excellent way to resolve this is with this extension for chrome: https://chrome.google.com/webstore/detail/open-link-in-same-tab/kgpefningcojblgciiljmabggbbjiojb
It has a right-click contextual option which will open the link in the SAME tab. This helps for the majority of normal links, but I'm not sure how it handles javascript-loaded new windows/tabs.

## Thanks
Thanks to https://github.com/jasonwzs and https://github.com/AlmogBaku for contributing to this project.
