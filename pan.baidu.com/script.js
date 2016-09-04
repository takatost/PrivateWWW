// ==UserScript==
// @name         Baidu YunPan Video Player +
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  auto play next video
// @author       Smite
// @match        https://pan.baidu.com/play/video*
// @grant        none
// ==/UserScript==

// === utils ===

function getPlayerState() {
    var player = window[$('embed').prop('id')];
    if (player && player.getState)
        return player.getState();
    return undefined;
}

function getFillZeroOnLeftString(number, length) {
    for (;length > number.length;)
        number = '0' + number;
    return number;
}

function getFillZeroList(list) {
    for (var idx = 0; idx < list.length; idx ++) {
        list[idx] = getFillZeroOnLeftString(list[idx], 3);
    }
    return list;
}

function getMatchNumberList(string) {
    return string.match(/\d+/g);
}

// === sort video items ===

function sortVideoItems() {
    var items = $('#videoListView .video-item').detach();
    $('#videoListView').append(items.sort(function (itemA, itemB) {
        var itemANumberList = getMatchNumberList($(itemA).attr('title')),
            itemBNumberList = getMatchNumberList($(itemB).attr('title'));
        return getFillZeroList(itemANumberList) >= getFillZeroList(itemBNumberList) ? 1 : -1;
    }));
}

(function checkVideoList() {
    if ('none' === $('#videoListView-tips').css('display') && $('#videoListView .load').length) {
        sortVideoItems();
    } else {
        setTimeout(checkVideoList, 2E3);
    }
})();

// === when player end start next ===

function playNextItem() {
    $('#videoListView .currentplay').next().find('.video-list-thumbnail').click();
}

$(document).on('player-state-changed', function (event, states) {
    if (states.before === 'playing' && states.current === 'ready' && $('#autoplay').prop('checked')) {
        playNextItem();
    }
});

(function watchPlayerState(before) {
    var state = getPlayerState();
    if (before && before != state) {
        $(document).trigger('player-state-changed', {before: before, current: state});
    }
    setTimeout(function () {
        watchPlayerState(state);
    }, 2E3);
})();

// === interactive ===

$('.video-features').append('<input type="checkbox" id="autoplay" /><span style="color: red;">自动播放下一集</span>');

