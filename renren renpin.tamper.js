// ==UserScript==
// @name       renren renpin
// @namespace  http://use.i.E.your.homepage/
// @version    0.1
// @description  enter something useful
// @include      http://www.renren.com/*
// @copyright  2012+, You
// ==/UserScript==

//闭包写法
(function() {
    unsafeWindow.onload=function main() {
        //首先做一点准备工作
        var $=unsafeWindow.jxn
        var ajax=unsafeWindow.XN.net.xmlhttp
        var parse=unsafeWindow.XN.json.parse
        var location=unsafeWindow.location
        //let's go
        if($('#interval').length==0){
        	console.log('非人人主页，要想攒人品，请切换到主页SB！')
            return
        }
        //首先定个时
        var time=parseInt($('#interval').val())
        var time_past=0
        setInterval(function(){
            time_past+=1000
            var revert_time=Math.round((time-time_past)/1000)
            console.log('还有'+revert_time+'秒开始自动刷新得人品！')
        },1000)
        setTimeout(function(){
            location.reload()
        },time)
        
        //随机攒
        var able=$('#userIfPin').val()
        if(able=='false'){
            var success=0
            var total=0
            var how_many=10
            for(var idx=0;idx<how_many;idx++){
                new ajax({
                    url: "http://renpin.renren.com/action/collectrp",
                    onSuccess: function(g) { 
                        var f = parse(g.responseText);
                        if(f.code==0){
                            success++
                                total+=f.currRp
                        } 
                    } 
                })
            }
            console.log('你总共并发了'+how_many+'次随机攒请求，共有'+success+'次成功攒到，你今天一共获得'+total+'个人品！')
        }
    }
})();
