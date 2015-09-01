function Console() {}

Console.Type = {
    LOG: "log",
    DEBUG: "debug",
    INFO: "info",
    WARN: "warn",
    ERROR: "error",
    GROUP: "group",
    GROUP_COLLAPSED: "groupCollapsed",
    GROUP_END: "groupEnd"
};

Console.addMessage = function(type, format, args) {
    chrome.extension.sendRequest({
        command: "sendToConsole",
        tabId: chrome.devtools.tabId,
        args: escape(JSON.stringify(Array.prototype.slice.call(arguments, 0)))
    });
};

// Generate Console output methods, i.e. Console.log(), Console.debug() etc.
(function() {
    var console_types = Object.getOwnPropertyNames(Console.Type);
    for (var type = 0; type < console_types.length; ++type) {
        var method_name = Console.Type[console_types[type]];
        Console[method_name] = Console.addMessage.bind(Console, method_name);
    }
})();


SAMLChrome.controller('PanelController', function PanelController($scope, $http, toolbar) {
    $scope.uniqueid = 1000000;
    $scope.activeId = null;
    $scope.requests = {};

    $scope.activeCookies = [];
    $scope.activeHeaders = [];
    $scope.activePostData = [];
    $scope.activeRequest = [];
    $scope.activeSaml = null;
    $scope.activeRequestURL = "There are no SAML messages to display";

    $scope.showIncomingRequests = true;

    $scope.init = function(type) {
        $('#tabs').tabs();

        $scope.initChrome();

        this.createToolbar();
    };

    $scope.initChrome = function() {
        key('⌘+k, ctrl+l', function() {
            $scope.$apply(function() {
                $scope.clear();
            });
        });

        chrome.devtools.network.onRequestFinished.addListener(function(request) {
            $scope.handleSAMLHeaders(request);
        });
    };


    $scope.handleSAMLHeaders = function(har_entry) {
        var response_headers = har_entry.response.headers;
        var request_headers = har_entry.request.headers;
        var request_method = har_entry.request.method;
        var request_url = har_entry.request.url;
        var response_status = har_entry.response.status;
        var saml_request_string = "SAMLRequest=";
        var saml_response_string = "SAMLResponse=";

        var index_of_saml_request_string = request_url.indexOf(saml_request_string);
        if (index_of_saml_request_string > -1) {
            Console.log("SAML Request Method: " + request_method);
            Console.log("SAML Request URL: " + request_url);
            var index_of_next_param = request_url.indexOf("&", index_of_saml_request_string);

            //assumes that the GET request is http(s)://host/sso/idp?SAMLRequest=xxxxx&RelayState=yyyy
            var saml_message = request_url.substr(index_of_saml_request_string + saml_request_string.length, index_of_next_param - (index_of_saml_request_string + saml_request_string.length));
            //requires inflating
            var decoded_saml_message = RawDeflate.inflate(window.atob(unescape(saml_message)));
            $scope.addRequest(har_entry, request_method, request_url, response_status, decoded_saml_message);
            Console.log("SAML Request Data: " + decoded_saml_message);

        }

        var har_post_data = null;
        if (har_entry.request != null && har_entry.request.postData != null) {
            har_post_data = har_entry.request.postData.text;
        };

        if (har_post_data != null) {
            if (har_post_data.slice(0, saml_request_string.length) == saml_request_string) {
                var decoded_saml_message = $scope.getDecodedSamlMessageFromPostData("Request", request_method, request_url, har_post_data, saml_request_string, response_status, har_entry);
                Console.log("SAML Request Data: " + decoded_saml_message);

            } else if (har_post_data.slice(0, saml_response_string.length) == saml_response_string) {
                var decoded_saml_message = $scope.getDecodedSamlMessageFromPostData("Response", request_method, request_url, har_post_data, saml_response_string, response_status, har_entry);
                Console.log("SAML Response Data: " + decoded_saml_message);
            }
        }
    };

    $scope.getDecodedSamlMessageFromPostData = function(request_response_string, request_method, request_url, har_post_data, saml_string, response_status, har_entry) {
        var saml_message = har_post_data.substr(saml_string.length, har_post_data.length - saml_string.length);
        var index_of_next_param = saml_message.indexOf("&", 0);
        if (index_of_next_param > -1) {
            saml_message = saml_message.substr(0, index_of_next_param);
        }

        //using the window.atob base64 decoding method as it seems to work pretty well
                Console.log("SAML har_post_data Data: " + har_post_data);
                Console.log("SAML Response Data: " + saml_message);
        var decoded_saml_message = window.atob(unescape(saml_message));
        $scope.addRequest(har_entry, request_method, request_url, response_status, decoded_saml_message);

        return decoded_saml_message;
    };

    $scope.createToolbar = function() {
        toolbar.createButton('ban', 'Clear', function() {
            $scope.$apply(function() {
                $scope.clear();
            });
        });

        $('.toolbar').replaceWith(toolbar.render());
    };

    $scope.addRequest = function(data, request_method, request_url, response_status, decoded_saml_message) {
        $scope.$apply(function() {
            var requestId = $scope.uniqueid;
            $scope.uniqueid = $scope.uniqueid + 1;

            if (data.request != null) {
                if (data.request.cookies != null) {
                    data.cookies = $scope.createKeypairs(data.request.cookies);
                }
                if (data.request.headers != null) {
                    data.headers = $scope.createKeypairs(data.request.headers);
                }
                if (data.request.postData != null) {
                    data.postData = $scope.createKeypairs(data.request.postData.params);
                }
            }
            data["request_method"] = request_method;
            data["request_url"] = request_url;
            data["response_status"] = response_status;
            data["id"] = requestId;
            data["saml"] = decoded_saml_message;

            $scope.requests[requestId] = data;

            if ($scope.showIncomingRequests) {
                $scope.setActive(requestId);
            }
        });
    };

    $scope.clear = function() {
        $scope.requests = {};
        $scope.activeId = null;

        $scope.activeCookies = [];
        $scope.activeHeaders = [];
        $scope.activePostData = [];
        $scope.activeRequest = [];
        $scope.activeSaml = null;
        $scope.activeRequestURL = "There are no SAML messages to display";

        $scope.showIncomingRequests = true;
    };

    $scope.setActive = function(requestId) {
        $scope.activeId = requestId;

        $scope.activeCookies = $scope.requests[requestId].cookies;
        $scope.activeHeaders = $scope.requests[requestId].headers;
        $scope.activePostData = $scope.requests[requestId].postData;
        $scope.activeRequest = $scope.requests[requestId];
        $scope.activeSaml = $scope.requests[requestId].saml;
        $scope.activeRequestURL = $scope.requests[requestId].request_url;

        var lastRequestId = Object.keys($scope.requests)[Object.keys($scope.requests).length - 1];

        $scope.showIncomingRequests = requestId == lastRequestId;
    };

    $scope.getClass = function(requestId) {
        if (requestId == $scope.activeId) {
            return 'selected';
        } else {
            return '';
        }
    };

    $scope.createKeypairs = function(data) {
        var keypairs = [];

        if (!(data instanceof Object)) {
            return keypairs;
        }

        $.each(data, function(key, value) {
            keypairs.push({
                name: value.name,
                value: value.value
            });
        });

        return keypairs;
    };

    $scope.$watch('activeSaml', function() {
        var options = {
            source: $scope.activeSaml,
            mode: "beautify", //  beautify, diff, minify, parse
            lang: "xml",
            wrap: 100,
            inchar: " ", // indent character
            insize: 3 // number of indent characters per indent
        }
        if ($scope.activeSaml != null) {
           var pd = prettydiff(options); // returns and array: [beautified, report]

            var pretty = pd[0];
            document.getElementById("tab-saml-codemirror").innerHTML = "";
            var myCodeMirror = CodeMirror(document.getElementById("tab-saml-codemirror"), {
              value: pretty,
              mode:  "xml",
              lineNumbers: true
            });

            document.getElementById("tab-saml-text-heading").style.visibility = "visible";
            document.getElementById("tab-saml-text").innerText = $scope.activeSaml;
        } else {
            document.getElementById("tab-saml-codemirror").innerHTML = "";
            document.getElementById("tab-saml-text-heading").style.visibility = "hidden";
            document.getElementById("tab-saml-text").innerText = "";
        }
    });

});