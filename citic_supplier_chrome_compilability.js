// ==UserScript==
// @name         CITIC login from chrome helper
// @author       Smite Chow
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @include      *://*.ecitic.com/citiccard/vender/*.jsp
// @include      *://*.ecitic.com/citiccard/vender.do?func=*
// @include      *://*.ecitic.com/citiccard/vender/epose/*.jsp
// ==/UserScript==

// adjust login form style
GM_addStyle("body, #land_top, #land_c, #land_bottom { margin: 0 auto; }");
GM_addStyle("#land_bottom { width: 564px; }");
GM_addStyle("#head_table, body { background-size: cover; }");

var window = unsafeWindow;

// tools

// use this transport for "binary" data type from http://www.henryalgus.com/reading-binary-files-using-jquery-ajax/
$.ajaxTransport("+binary", function(options, originalOptions, jqXHR){
    // check for conditions and support for blob / arraybuffer response type
    if (window.FormData && ((options.dataType && (options.dataType == 'binary')) || (options.data && ((window.ArrayBuffer && options.data instanceof ArrayBuffer) || (window.Blob && options.data instanceof Blob)))))
    {
        return {
            // create new XMLHttpRequest
            send: function(headers, callback){
                // setup all variables
                var xhr = new XMLHttpRequest(),
                    url = options.url,
                    type = options.type,
                    async = options.async || true,
                    // blob or arraybuffer. Default is blob
                    dataType = options.responseType || "blob",
                    data = options.data || null,
                    username = options.username || null,
                    password = options.password || null;

                xhr.addEventListener('load', function(){
                    var data = {};
                    data[options.dataType] = xhr.response;
                    // make callback and send data
                    callback(xhr.status, xhr.statusText, data, xhr.getAllResponseHeaders());
                });

                xhr.open(type, url, async, username, password);

                // setup custom headers
                for (var i in headers ) {
                    xhr.setRequestHeader(i, headers[i] );
                }

                xhr.responseType = dataType;
                xhr.send(data);
            },
            abort: function(){
                jqXHR.abort();
            }
        };
    }
});

// patch Elment Object
Object.defineProperty(window.Element.prototype, "text", {
    get: function () { return this.textContent; }
});

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
        this.xmlDoc = new window.ActiveXObject("MSXML2.DOMDOCUMENT");
        this.xmlhttp = new window.ActiveXObject("MSXML2.XMLHTTP");
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
            this.xmlDoc = this.xmlDoc.loadXML(Res);
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

// patch CSSStyleDeclaration.prototype.removeAttribute
window.CSSStyleDeclaration.prototype.removeAttribute = window.CSSStyleDeclaration.prototype.removeProperty;

// override menu page
if(window.location.href.endsWith('menu.jsp')){
    window.Redirect = window.inetpayRedirect = function(prarm) {
        window.top.mainframe.src = "/citiccard/vender.do?func=" + prarm; 
    };
    var all_id_suffix = [0,1,2,3,4,5,6,7,8,9,'logout'];
    for(var idx = 0; idx < all_id_suffix.length ; idx ++){
        var suffix = all_id_suffix[idx];
        window.document.getElementById('menu_' + suffix).style.display = ""; 
    }
}

// fix reversal page
if(window.location.href.endsWith('ep_ordercancel')){
    var follow_calander_style = function(){
        setInterval(function(){
            $('iframe').attr('style', $('#meizzCalendarLayer').attr('style'));
        }, 100);
    };
    $.ajax({
        url: '/citiccard/vender/js/calendar.js',
        processData: false,
        success: function(data){
            // decode content
            var dataView = new DataView(data);  
            var decoder = new TextDecoder('gbk');  
            data = decoder.decode(dataView);

            // replace fix
            data = data.replace(/function String.prototype.trim/g, 'String.prototype.trim = function');
            data = data.replace(/document.write\((.+)\);/g, 'document.getElementsByTagName("body")[0].insertAdjacentHTML( "beforeend", $1 );');
            data = data.replace(/function document.onclick/g, 'document.onclick = function');
            data = data.replace(/window.frames\("(\w+)"\)/g, 'window.frames["$1"]');
            data = data.replace(/arguments.length==0/g, '0==0');
            data = data.replace(/removeAttribute\('backgroundColor'\)/g, 'removeAttribute("background-color")');

            // append to dom
            $('head').append('<script>' + data + '</script>');

            // fix calander position
            follow_calander_style();
        }, 
        responseType:'arraybuffer',
        dataType: 'binary'
    });
}
