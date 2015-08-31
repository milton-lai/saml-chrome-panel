# saml-chrome
Chrome DevTools Extension for sending decrypted SAML messages to the console

This is for Chrome only (tested on OSX 10.10.5 and Chrome 44.0.2403.157)

To install, go to chrome://extensions in your browser, Enable Developer Mode and the click on "Load unpacked Extension..."

To view the messages, you'll need to refresh your page, and load developer tools. From here, head to the console tab, and then go to a page which initiates a SAML transaction. You'll then notice the following lines:
```
SAML Request Method: GET
SAML Request URL: https://host/sso/SSORedirect/metaAlias/idp?SAMLRequest=jZJba…B0AHUAcgBuAFUAUgBMACIAOgAiAC8AIgAsACIAcgBvAGwAZQBJAGQAIgA6AG4AdQBsAGwAfQA=
SAML Request Data: <samlp:AuthnRequest Version="2.0" ID="t78a03d1e-35db-47a9-b3b3-3dafa4e3e93a" IssueInstant="2015-08-31T01:12:55.803Z" Destination="https://host/sso/SSORedirect/metaAlias/idp" AssertionConsumerServiceURL="http://host/identity/saml/sso.aspx" ProviderName="NSI CareerHub" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol">
  <saml:Issuer>http://host/</saml:Issuer>
  <samlp:NameIDPolicy Format="urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified" AllowCreate="true" />
</samlp:AuthnRequest>
```
This should work for both the requests and responses.

The biggest note is that since the Developer Tools only loads per tab, if you have a link that opens up a SP-init transaction in a new tab, then it won't trap any of that data. This is a Chrome issue. 
