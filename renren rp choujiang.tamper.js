// ==UserScript==
// @name       renren renpin choujiang
// @namespace  http://use.i.E.your.homepage/
// @version    0.1
// @description  enter something useful
// @include      http://renpin.renren.com/mall/lottery*
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
        if($('#rpLottery').length==0){
        	console.log('非人品抽奖页，请切换！')
            return
        }
        
        //抽奖吧
        var today_remain_time=parseInt($('#nowRemainTime').text())
        var do_time=0
        var real_do_time=0
        var send_time=0
        var success=[]
        //这里时并发数，你需要弄清楚两个问题
        //1.并发越多，消耗的人品越多
        //2.但同时意味着抽的次数多
        //3.举个例子，我写10,导致我的人品扣到负数，但我获得了两百多个大小奖品
        //4.最后算来我居然赚了300多人品
        var how_many_eachtime=1//小心
        var auto_use=true
        var all_results=[0,10,50,100,200,500,1000,-1]
        //这里是并发一次的时间间隔设置，太低容易把浏览器搞死
        //太高并发成功率就低
        var myTimer=setInterval(worker,3*1000)//每3s并发一次请求
        
        function worker(){
            if(today_remain_time==0){
                clearInterval(myTimer)
                return
            }
            for(var idx=0;idx<how_many_eachtime;idx++){
                send_time++
                new ajax({url: "http://renpin.renren.com/mall/lottery/dolottery",method: "post",onSuccess: function(D) {
                    do_time++
                    var B = parse(D.responseText);
                    today_remain_time=B.remainCount
                    if(B.code==0){
                        real_do_time++
                        console.log('中'+all_results[B.result])
                        success.push(all_results[B.result])
                        if(auto_use){
                            if(B.type==1){
                                console.log('这不科学，你中话费了？')
                            }else{
                                new ajax({url: "http://renpin.renren.com/mall/lottery/use",method: "post",data: "id=" + B.id,onSuccess: function(C) {
                                    var ret=parse(C.responseText)
                                    if(ret.code!=0){
                                        console.log('领取人品失败！')
                                    }else{
                                        console.log('成功领取人品！')
                                    }
                                }})
                            }
                        }
                    }else{
                        console.log('不是有效的抽奖动作')
                    }
                    //check
                    if(do_time==send_time){
                        var count_cost=real_do_time*28
                        var count_get=0
                        var win_nub=0
                        for(var idx=0;idx<success.length;idx++){
                            if(success[idx]>0){
                                win_nub++
                            }
                            count_get+=success[idx]
                        }
                        alert('现在共抽了'+real_do_time+'次奖，赢了'+win_nub+'次，今天总花费'+count_cost+'人品，得到'+count_get+'个人品，还有'+today_remain_time+'次抽奖机会！')
                    }
                }})
            }
        }
    }
})();
