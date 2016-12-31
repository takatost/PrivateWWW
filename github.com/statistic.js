// ==UserScript==
// @name         今年GitHub成绩单
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @require      http://yckart.github.io/jquery.base64.js/jquery.base64.js
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       Smite Chow
// @match        https://github.com/*?show_current_year_statistic
// @match        https://github.com/*/graphs/contributors?from=*-01-01&to=*-12-31&type=c
// @grant        unsafeWindow
// ==/UserScript==
const user = $('.header-nav-current-user .css-truncate-target').text();

function getGitHubToken() {
    let token = prompt('请输入GitHub Token');
    if (token.trim() === '') {
        throw '无效参数, 逻辑异常';
    }
    return token;
}

function getAPI() {
    let perPage = prompt('确认API 返回的repo 总数，默认1000，如果你所有的repo 数大于1000，请修正，否则请保持默认值', '1000');

    perPage = parseInt(perPage);

    if (perPage < 1) {
        throw '无效参数，逻辑异常';
    }
    return `https://api.github.com/user/repos?per_page=${perPage}`;
}

function goURL(url) {
    unsafeWindow.location.href = url;
}

function requestUserRepos() {
    let token = getGitHubToken(),
        api = getAPI(),
        auth = $.base64.encode(`${user}/token:${token}`);

    $.ajax({
        type: "GET",
        beforeSend: function (request) {
            request.setRequestHeader("Authorization", 'Basic ' + auth);
        },
        url: api,
        success: function (data) {
            unsafeWindow.localStorage.setItem(`${user}_repos`, JSON.stringify(data));

            alert(`
            成功获取到所有repo，接下来开始遍历repo的contributor,
            当前页面会自动刷新，请不要关闭或做其他操作，遍历完成后会提示你,
            如果你的repo 数量很多，会导致/graphs/contributors API 访问频次超限报429 (Too Many Requests) 错误,
            目前未知频次限制参数，发生429 错误请等待一段时间后刷新页面重试,
            请打开chrome console查看是否发生429 错误。
            `);

            nextRepo(data);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(`${textStatus}, ${errorThrown}`);
            throw 'API 请求异常';
        }
    });
}

function nextRepo(repos) {
    if (typeof repos === "undefined")
        repos = JSON.parse(unsafeWindow.localStorage.getItem(`${user}_repos`));

    let year = (new Date()).getFullYear(),
        results = [],
        numbers = 0,
        commits = 0,
        addLines = 0,
        delLines = 0,
        re = /[\d,]+/g;

    for(let idx = 0; idx < repos.length; idx ++) {
        let repo = repos[idx],
            url = `https://github.com/${repo.full_name}/graphs/contributors?from=${year}-01-01&to=${year}-12-31&type=c`;

        if (unsafeWindow.localStorage.getItem(`result_${url}`)) {
            let info = JSON.parse(unsafeWindow.localStorage.getItem(`result_${url}`));
            results.push(`repo: ${repo.full_name} rank: ${info.rank} count: ${info.count}`);

            let summary = info.count.match(re);
            if (summary && summary.length === 3) {
                numbers +=1 ;
                commits += parseInt(summary[0].replace(/,/g, ''));
                addLines += parseInt(summary[1].replace(/,/g, ''));
                delLines += parseInt(summary[2].replace(/,/g, ''));
            }
            continue;
        }

        goURL(url);
        return;
    }

    let profile = `https://github.com/${user}?show_current_year_statistic`;
    alert(`遍历完成，将会返回${profile}并输出结果`);
    unsafeWindow.localStorage.setItem(`${user}_results`, JSON.stringify(results));
    unsafeWindow.localStorage.setItem(`${user}_results_summary`, `${year}年你在${numbers}个repo中贡献了${commits}次commit，增加了${addLines}行代码，删除了${delLines}行代码`);
    unsafeWindow.location.href = profile;
}

var timer;

function checkRepoContributors() {
    // wait contributors info loading...
    if (!$('.capped-card').length) {
        return;
    }
    clearInterval(timer);

    let $user = $(`.aname[href="/${user}"]`),
        url = unsafeWindow.location.href,
        rank,
        count;

    // you never contribute or in 2016 never contribute
    if ($user.length === 0 || !$user.is(':visible')) {
        rank = count = '未知';
    } else {
        let $info = $user.parent();

        rank = $info.find('.rank').text();
        count = $info.find('.ameta').text();
    }
    unsafeWindow.localStorage.setItem(`result_${url}`, JSON.stringify({
        rank: rank,
        count: count
    }));

    nextRepo();
}

(function() {
    // get results already and location in profile page
    var results = unsafeWindow.localStorage.getItem(`${user}_results`);
    if (results && $('.js-contribution-graph').length) {
        results = JSON.parse(results);

        let display = results.join('<br>'),
            summary = unsafeWindow.localStorage.getItem(`${user}_results_summary`);
        $('.js-contribution-graph').append(`<div>${summary}</div><div>${display}</div>`);
        return;
    }

    // not get repos
    var repos = unsafeWindow.localStorage.getItem(`${user}_repos`);
    if (!repos) {
        requestUserRepos();
        return;
    }

    timer = setInterval(checkRepoContributors, 1000);
})();
