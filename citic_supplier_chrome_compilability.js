// ==UserScript==
// @name         CITIC login from chrome helper
// @author       Smite Chow
// @include      *://*.ecitic.com/citiccard/vender/*.jsp
// @include      *://*.ecitic.com/citiccard/vender.do?func=*
// @include      *://*.ecitic.com/citiccard/vender/epose/*.jsp
// ==/UserScript==

// adjust login form style
GM_addStyle("body, #land_top, #land_c, #land_bottom { margin: 0 auto; }");
GM_addStyle("#land_bottom { width: 564px; }");
GM_addStyle("#head_table, body { background-size: cover; }");

var window = unsafeWindow;

// patch for window.ActiveXObject
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
            };
        }
        if (!xmlDoc.selectNodes) {
            xmlDoc.selectNodes = function(xpath) {
                var tmp = this.evaluate(xpath, this, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                tmp.length = tmp.snapshotLength;
                for (var idx = 0; idx < tmp.length; idx++)
                    tmp[idx] = tmp.snapshotItem(idx);
                return tmp;
            };
        }
        return xmlDoc;
    } 
    else if (name.indexOf('XMLHTTP') != -1) {
        var xmlhttp;
        if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
            xmlhttp.Open = xmlhttp.open;
        } else {
            // code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        return xmlhttp;
    }
};

// override getMsgCtn function
window.getMsgCtn = function getMsgCtn() {
    var xmlDoc = new ActiveXObject("MSXML2.DOMDOCUMENT");
    xmlDoc.async = false;
    return xmlDoc.loadXML("<request></request>");
};

// override XMLProxy function
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
        this.xmlhttp.setRequestHeader("Content-Type", "text/xml; charset=UTF-8");

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
            };
            this.xmlhttp.send(data);
        }
    };

    this.initProxy();
};

// override menu page
window.Redirect = window.inetpayRedirect = function(prarm) {
    window.top.mainframe.src = "/citiccard/inetpay.do?func=" + prarm; 
};
(function(){
    var all_id_suffix = [0,1,2,3,4,5,6,7,8,9,'logout'];
    for(var idx = 0; idx < all_id_suffix.length ; idx ++){
        var suffix = all_id_suffix[idx];
        console.log(suffix)
        window.document.getElementById('menu_' + suffix).style.display = ""; 
    }
})();
