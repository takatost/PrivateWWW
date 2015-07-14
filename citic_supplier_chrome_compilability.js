// hook ActiveXObject
window.ActiveXObject = function(name){
    if(name.indexOf('DOMDOCUMENT')!=-1){
        var xmlDoc;
        if (document.implementation.createDocument) {
          xmlDoc = document.implementation.createDocument("", "", null);
        } else {
          xmlDoc = new ActiveXObject("MSXML2.DOMDocument"); 
          xmlDoc.async = false;
        }
        if(!xmlDoc.loadXML){
            xmlDoc.loadXML = function(xmlString){
                return (new DOMParser()).parseFromString(xmlString, "text/xml");
            }
        }
        return xmlDoc;
    }
    else if(name.indexOf('XMLHTTP')!=-1){
        var xmlhttp;
        if (window.XMLHttpRequest)
          {// code for IE7+, Firefox, Chrome, Opera, Safari
          xmlhttp=new XMLHttpRequest();
          }
        else
          {// code for IE6, IE5
          xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
          }
          return xmlhttp;
    }
}

// hook business logic
function getMsgCtn()
{
	var xmlDoc   = new ActiveXObject("MSXML2.DOMDOCUMENT");
	xmlDoc.async = false;
	xmlDoc=xmlDoc.loadXML("<request></request>");
	return xmlDoc;	
}
