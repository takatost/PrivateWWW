// ==UserScript==
// @name         CITIC login from chrome helper
// @author       Smite Chow
// @include      *://*.ecitic.com/citiccard/vender/index.jsp
// ==/UserScript==
GM_addStyle("\
            body, #land_top, #land_c, #land_bottom {\
                margin: 0 auto;\
            }\
            #land_bottom {\
                width: 564px;\
            }\
            ");
(function(){
    unsafeWindow.onload=function main() {
        var window = unsafeWindow;
        window.transObjectValue = function(a, b) {
            // trans value from a to b
            for (var key in b) {
                var newValue, oldValue;
                try {
                    newValue = a[key];
                } catch (error) {
                    console.error('Skip...' + error);
                    continue;
                }
                if (b[key].constructor === Object)
                    transObjectValue(a[key], b[key]);
                else if (typeof (a[key]) !== "undefined") {
                    try {
                        b[key] = a[key];
                        // check if success set value or not
                        if (b[key] != a[key])
                            console.error('Skip... Failed set value on key: ' + key + ' but no exception raised!');
                    } catch (error) {
                        console.error('Skip...' + error);
                        continue;
                    }
                }
            }
        };

        window.ActiveXObject = function(name, realObject) {
            if (name.indexOf('DOMDOCUMENT') != -1) {
                var xmlDoc;
                if (document.implementation.createDocument) {
                    xmlDoc = document.implementation.createDocument("", "", null);
                } else {
                    xmlDoc = new ActiveXObject("MSXML2.DOMDocument");
                    xmlDoc.async = false;
                }
                xmlDoc = realObject ? realObject : xmlDoc;
                if (!xmlDoc.loadXML) {
                    xmlDoc.loadXML = function(xmlString) {
                        var tmp = (new DOMParser()).parseFromString(xmlString, "text/xml");
                        if (tmp.getElementsByTagName('parsererror').length) {
                            // try html
                            tmp = (new DOMParser()).parseFromString(xmlString, "text/html");
                            if (tmp.getElementsByTagName('parsererror').length) {
                                throw tmp.getElementsByTagName('parsererror');
                            }
                        }
                        return new ActiveXObject(name, tmp);
                    }
                }
                if (!xmlDoc.selectNodes) {
                    xmlDoc.selectNodes = function(xpath) {
                        var tmp = this.evaluate(xpath, this, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                        tmp.length = tmp.snapshotLength;
                        for (var idx = 0; idx < tmp.length; idx++)
                            tmp[idx] = tmp.snapshotItem(idx);
                        return tmp;
                    }
                }
                return xmlDoc;
            } 
            else if (name.indexOf('XMLHTTP') != -1) {
                var xmlhttp;
                if (window.XMLHttpRequest) 
                { // code for IE7+, Firefox, Chrome, Opera, Safari
                    xmlhttp = new XMLHttpRequest();
                    xmlhttp.Open = xmlhttp.open;
                } 
                else 
                { // code for IE6, IE5
                    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
                }
                return xmlhttp;
            }
        }

        window.getMsgCtn = function getMsgCtn() 
        {
            var xmlDoc = new ActiveXObject("MSXML2.DOMDOCUMENT");
            xmlDoc.async = false;
            return xmlDoc.loadXML("<request></request>");
        }

        window.XMLProxy = function XMLProxy() {
            this.xmlhttp = null;
            this.xmlDoc = null;
            this.isAsync = false;
            this.method = "post";

            this.initProxy = function() {
                this.xmlDoc = new ActiveXObject("MSXML2.DOMDOCUMENT");
                this.xmlhttp = new ActiveXObject("MSXML2.XMLHTTP");
            };

            this.onGetResponse = function(xmldocument) {
            };

            this.send = function(url, data) {
                this.xmlhttp.Open(this.method, url, this.isAsync);
                this.xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

                if (!this.isAsync) {
                    this.xmlhttp.send(data);
                    var Res = this.xmlhttp.responseText;
                    Res = Res.replace(/&#x0;/g, "");
                    this.xmlDoc.loadXML(Res);
                    return this.xmlDoc;
                } else {
                    var proxy = this;
                    this.xmlhttp.onreadystatechange = function() {
                        if (proxy.xmlhttp.readyState == 4) {
                            var Res = proxy.xmlhttp.responseText;
                            Res = Res.replace(/&#x0;/g, " ");
                            Res = Res.replace(/&#xc;/g, " ");
                            proxy.xmlDoc = proxy.xmlDoc.loadXML(Res);
                            proxy.onGetResponse(proxy.xmlDoc);
                        }
                    }
                    this.xmlhttp.send(data);
                }
            };

            this.initProxy();
        }
    };
})();
