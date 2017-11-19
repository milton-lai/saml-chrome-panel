
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
    chrome.runtime.sendMessage({
        command: "sendToConsole",
        tabId: chrome.devtools.inspectedWindow.tabId,
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
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://ssl.google-analytics.com/analytics.js','ga');

    ga('create', 'UA-67121118-1', 'auto');
    ga('set', 'checkProtocolTask', function(){}); // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200
    ga('require', 'displayfeatures');
    ga('send', 'pageview', '/panel.html');

    $scope.uniqueid = 1000000;
    $scope.activeId = null;
    $scope.requests = {};
    $scope.showSamlRequests = {};
    $scope.showAll = false;
    $scope.limitNetworkRequests = true;
    $scope.showOriginalSAML = false;
    $scope.currentDetailTab = "tab-saml";

    $scope.myCodeMirror = null;

    $scope.activeCookies = [];
    $scope.activeHeaders = [];
    $scope.activePostData = [];
    $scope.activeRequest = [];
    $scope.activeResponseData = [];
    $scope.activeResponseCookies = [];
    $scope.activeResponseHeaders = [];
    $scope.activeSaml = null;

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
            // do not show requests to chrome extension resources
            if (request.request.url.startsWith("chrome-extension://")) {
                return;
            }
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
        var found_saml = false;

        var index_of_saml_request_string = request_url.indexOf(saml_request_string);
        if (index_of_saml_request_string > -1) {
            Console.log("SAML Request Method: " + request_method);
            Console.log("SAML Request URL: " + request_url);
            var index_of_next_param = request_url.indexOf("&", index_of_saml_request_string);
            if (index_of_next_param < 0) {
                index_of_next_param = request_url.length;
            }

            //assumes that the GET request is http(s)://host/sso/idp?SAMLRequest=xxxxx&RelayState=yyyy
            var saml_message = request_url.substr(index_of_saml_request_string + saml_request_string.length, index_of_next_param - (index_of_saml_request_string + saml_request_string.length));
            //requires inflating
            var decoded_saml_message = RawDeflate.inflate(window.atob(unescape(saml_message)));
            $scope.addRequest(har_entry, request_method, request_url, response_status, decoded_saml_message);
            Console.log("SAML Request Data: " + decoded_saml_message);
            found_saml = true;
        }

        var har_post_data = null;
        if (har_entry.request != null && har_entry.request.postData != null) {
            har_post_data = har_entry.request.postData.text;
        };

        if (har_post_data != null) {
            if (har_post_data.indexOf(saml_request_string) > -1) {
                var decoded_saml_message = $scope.getDecodedSamlMessageFromPostData("Request", request_method, request_url, har_post_data, saml_request_string, response_status, har_entry);
                Console.log("SAML Request Data: " + decoded_saml_message);
                found_saml = true;
            } else if (har_post_data.indexOf(saml_response_string) > -1) {
                var decoded_saml_message = $scope.getDecodedSamlMessageFromPostData("Response", request_method, request_url, har_post_data, saml_response_string, response_status, har_entry);
                Console.log("SAML Response Data: " + decoded_saml_message);
                found_saml = true;
            }
        }

        if (found_saml === false) {
            $scope.addRequest(har_entry, request_method, request_url, response_status, null);
        }
    };

    $scope.getDecodedSamlMessageFromPostData = function(request_response_string, request_method, request_url, har_post_data, saml_string, response_status, har_entry) {
        var index_of_saml_string = har_post_data.indexOf(saml_string);
        var saml_message = har_post_data.substr(index_of_saml_string + saml_string.length, har_post_data.length - (index_of_saml_string + saml_string.length));
        var index_of_next_param = saml_message.indexOf("&", 0);
        if (index_of_next_param > -1) {
            saml_message = saml_message.substr(0, index_of_next_param);
        }

        //using the window.atob base64 decoding method as it seems to work pretty well
        var decoded_saml_message = window.atob(unescape(saml_message));
        $scope.addRequest(har_entry, request_method, request_url, response_status, decoded_saml_message);

        return decoded_saml_message;
    };

    $scope.createToolbar = function() {
        toolbar.createButton('search', 'Search SAML', false, function() {
            ga('send', 'event', 'button', 'click', 'Search SAML');
            $scope.$apply(function() {
                if ($scope.myCodeMirror) {
                    $scope.myCodeMirror.execCommand("find");
                }
            });
        });
        toolbar.createToggleButton('file-text-o', 'SAML Format', false, function() {
            ga('send', 'event', 'button', 'click', 'Toggle SAML Format');
            $scope.$apply(function() {
                $scope.showOriginalSAML = !$scope.showOriginalSAML;
                $scope.displaySaml();
            });
        }, false);
        toolbar.createButton('chain', 'Update All Link/Form Targets to _self', false, function() {
            ga('send', 'event', 'button', 'click', 'Update All Link Targets');
            $scope.$apply(function() {
               chrome.runtime.sendMessage({
                    command: "scrub",
                    tabId: chrome.devtools.inspectedWindow.tabId
                });
            });
        });
        toolbar.createButton('download', 'Export', false, function() {
            ga('send', 'event', 'button', 'click', 'Export');
            $scope.$apply(function() {
                var blob = new Blob([JSON.stringify($scope.requests)], {type: "application/json;charset=utf-8"});
                saveAs(blob, "SAMLChromeExport.json");
            });
        });
        toolbar.createButton('upload', 'Import', true, function() {
            ga('send', 'event', 'button', 'click', 'Import');
            $scope.$apply(function() {
                $('#ImportInput').click();
            });
        });
        toolbar.createToggleButton('tasks', 'SAML Filter', false, function() {
            ga('send', 'event', 'button', 'click', 'Toggle Traffic');
            $scope.$apply(function() {
                $scope.showAll = !$scope.showAll;
                $scope.showTraffic();
            });
        }, false);
        toolbar.createToggleButton('list', 'Limit network requests to 500', false, function() {
            ga('send', 'event', 'button', 'click', 'Toggle Limit Network Request');
            $scope.$apply(function() {
                $scope.limitNetworkRequests = !$scope.limitNetworkRequests;
            });
        }, true);
        toolbar.createButton('ban', 'Clear', false, function() {
            ga('send', 'event', 'button', 'click', 'Clear');
            $scope.$apply(function() {
                $scope.clear();
            });
        });

        $('.toolbar').replaceWith(toolbar.render());

        //clears the input value so you can reload the same file
        document.getElementById('ImportInput').addEventListener('click', function() {this.value=null;}, false);
        document.getElementById('ImportInput').addEventListener('change', readFile, false);
        function readFile (evt) {
            var files = evt.target.files;
            var file = files[0];
            var reader = new FileReader();
            reader.onload = function() {
                $scope.importFile(this.result);
            }
            reader.readAsText(file)
        }
    };

    $scope.importFile = function(data) {
        $scope.$apply(function() {
            var importHar = JSON.parse(data);
            for (i in importHar)
            {
                $scope.handleSAMLHeaders(importHar[i]);
            }
        });
    }

    $scope.addRequest = function(data, request_method, request_url, response_status, decoded_saml_message) {
        $scope.$apply(function() {
            var requestId = $scope.uniqueid;
            $scope.uniqueid = $scope.uniqueid + 1;

            if (data.request != null) {
                data["request_data"] = $scope.createKeypairs(data.request);
                if (data.request.cookies != null) {
                    data.cookies = $scope.createKeypairsDeep(data.request.cookies);
                }
                if (data.request.headers != null) {
                    data.headers = $scope.createKeypairsDeep(data.request.headers);
                }
                if (data.request.postData != null) {
                    data.postData = $scope.createKeypairsDeep(data.request.postData.params);
                }
            }
            if (data.response != null) {
                data["response_data"] = $scope.createKeypairs(data.response);
                if (data.response.cookies != null) {
                    data["response_cookies"] = $scope.createKeypairsDeep(data.response.cookies);
                }
                if (data.response.headers != null) {
                   data["response_headers"] = $scope.createKeypairsDeep(data.response.headers);
                }
            }

            data["request_method"] = request_method;
            data["request_url"] = request_url;
            data["response_status"] = response_status;
            data["id"] = requestId;
            data["saml"] = decoded_saml_message;

            $scope.requests[requestId] = data;
            if (decoded_saml_message != null || $scope.showAll === true) {
                $scope.showSamlRequests[requestId] = data;
            }

            $scope.cleanRequests();

            if ($scope.showIncomingRequests && $scope.showSamlRequests[requestId]) {
                $scope.setActive(requestId);
            }
        });
    };

    $scope.cleanRequests = function() {
        if ($scope.limitNetworkRequests === true) {
            var keys = Object.keys($scope.requests).reverse().slice(500);
            keys.forEach(function(key) {
                if ($scope.requests[key]) {
                    delete $scope.requests[key];
                }
                if ($scope.showSamlRequests[key]) {
                    delete $scope.showSamlRequests[key];
                }
            });
        }
    }

    $scope.clear = function() {
        $scope.requests = {};
        $scope.activeId = null;
        $scope.showSamlRequests = {};

        $scope.activeCookies = [];
        $scope.activeHeaders = [];
        $scope.activePostData = [];
        $scope.activeRequest = [];
        $scope.activeResponseData = [];
        $scope.activeResponseCookies = [];
        $scope.activeResponseHeaders = [];
        $scope.activeSaml = null;

        $scope.showIncomingRequests = true;
        document.getElementById("tab-saml-codemirror").style.visibility = "hidden";

    };

    $scope.setActive = function(requestId) {
        if (!$scope.requests[requestId]) {
            return;
        }
        $scope.activeId = requestId;

        $scope.activeCookies = $scope.requests[requestId].cookies;
        $scope.activeHeaders = $scope.requests[requestId].headers;
        $scope.activePostData = $scope.requests[requestId].postData;
        $scope.activeRequest = $scope.requests[requestId].request_data;
        $scope.activeResponseData = $scope.requests[requestId].response_data;
        $scope.activeResponseCookies = $scope.requests[requestId].response_cookies;
        $scope.activeResponseHeaders = $scope.requests[requestId].response_headers;
        $scope.activeSaml = $scope.requests[requestId].saml;

        var lastRequestId = Object.keys($scope.showSamlRequests)[Object.keys($scope.showSamlRequests).length - 1];

        $scope.showIncomingRequests = requestId == lastRequestId;

        if ($scope.activeSaml == null && $scope.currentDetailTab === "tab-saml") {
            $("#tabs").tabs("option", "active", $("tab-request" + "Selector").index() - 1);
        }
    };

    $scope.getClass = function(requestId) {
        if (requestId == $scope.activeId) {
            return 'selected';
        } else {
            return '';
        }
    };

    $scope.showTraffic = function() {
        $scope.showSamlRequests = {};
        $.each($scope.requests, function(request) {
            if ($scope.requests[request].saml != null || $scope.showAll === true) {
                $scope.showSamlRequests[request] = $scope.requests[request];
            }
        });
        var lastRequestId = Object.keys($scope.showSamlRequests)[Object.keys($scope.showSamlRequests).length - 1];

        $scope.showIncomingRequests = $scope.activeId == lastRequestId;
    }

    $scope.createKeypairs = function(data) {
        var keypairs = [];
        if (!(data instanceof Object)) {
            return keypairs;
        }

        $.each(data, function(key, value) {
            if (!(value instanceof Object)) {
                keypairs.push({
                    name: key,
                    value: value
                });
            }
        });

        return keypairs;
    };

    $scope.createKeypairsDeep = function(data) {
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
        $scope.displaySaml();
    });

    $scope.isSaml = function(requestId) {
        if ($scope.requests[requestId].saml != null) {
            return "saml";
        }
    }

    $scope.getTrafficStyle = function(request) {
        if (request.saml != null) {
            var status = request.response_status;
            if (status.startsWith("2")) {
                return "success";
            } else if (status.startsWith("3")) {
                return "redirect";
            } else {
                return "error"
            }
        }
        return "";
    }

    $scope.selectDetailTab = function(tabId) {
        $scope.currentDetailTab = tabId;
        if (tabId === "tab-saml") {
            $scope.displaySaml();
        }
    }

    $scope.displaySaml = function() {
        if ($scope.activeSaml != null) {
            document.getElementById("tab-saml-codemirror").style.visibility = "visible";
            
            var samlContent = $scope.activeSaml;
            if (!$scope.showOriginalSAML) {
                samlContent = $scope.getPrettyXML(samlContent);
            }

            if ($scope.myCodeMirror) {
                $scope.myCodeMirror.getDoc().setValue(samlContent);
                return;
            }

            document.getElementById("tab-saml-codemirror").innerHTML = "";
            var myCodeMirror = CodeMirror(document.getElementById("tab-saml-codemirror"), {
              value: samlContent,
              mode:  "xml",
              lineNumbers: true,
              lineWrapping: true
            });
            $scope.myCodeMirror = myCodeMirror;
        }
    }

    $scope.getPrettyXML = function(source) {
        var options = {
            source: source,
            mode: "beautify", //  beautify, diff, minify, parse
            lang: "xml",
            wrap: 100,
            inchar: " ", // indent character
        }
        var pd = prettydiff(options); // returns and array: [beautified, report]

        var pretty = pd[0];

        return pretty;
    }
});