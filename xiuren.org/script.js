// ==UserScript==
// @name         xiuren.org proxy client
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @require      https://go.dist.pub/http!/www.xiuren.org/jquery.fancybox.js
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://go.dist.pub/http!/www.xiuren.org/*
// @grant        none
// ==/UserScript==

$('link[href="http://www.xiuren.org/style.css"]').prop('href', getPatchedUrl('http://www.xiuren.org/style.css'));
$('link[href="http://www.xiuren.org/jquery.fancybox.css"]').prop('href', getPatchedUrl('http://www.xiuren.org/jquery.fancybox.css'));

function getPatchedUrl(url) {
    return 'https://go.dist.pub/http!/' + url.replace('http://', '');
}
$('.loop img, .photoThum img').each(function () {
    $(this).prop('src', getPatchedUrl($(this).prop('src')));
});
$('.loop a, .photoThum a, #page a').each(function () {
    $(this).prop('href', getPatchedUrl($(this).prop('href')));
});

if ($('.post').length) {
    $(function() {
        $(".post a:has(img)").attr("rel","gallery");
        $(".post a:has(img)").fancybox();
    });
}

$(function killNotice() {
    var killed = false;
    console.log('try killed avoid-ad-block-plugin');
    for (var key in window) {
        var object = window[key];
        if (object && object.displayMessage && object.deferExecution) {
            object.displayMessage = object.deferExecution = undefined;
            $('body > div').each(function() {
                if($(this).find('img').length === 0){
                    $(this).remove();
                }
            });
            killed = true;
            console.log('killed');
            break;
        }
    }
    if (!killed) {
        setTimeout(killNotice, 2E3);
    }
});
