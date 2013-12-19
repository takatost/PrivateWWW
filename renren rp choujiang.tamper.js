// ==UserScript==
// @name       人人网人品抽奖页面-自动抽奖
// @namespace  http://www.smitechow.com
// @version    0.2
// @description  自动并发抽奖，自动并发领取奖品
// @include      http://renpin.renren.com/mall/lottery*
// @copyright  Smite Chow
// ==/UserScript==

//闭包写法
(function() {
    unsafeWindow.onload=function main() {
        //首先做一点准备工作
        
        //jquery
        var $=unsafeWindow.jxn
        
        //ajax
        var ajax=unsafeWindow.XN.net.xmlhttp
        
        //json parser
        var parse=unsafeWindow.XN.json.parse
        
        //location
        var location=unsafeWindow.location
        
        //let's go
        
        //页面检测
        if($('#rpLottery').length==0){
            alert('未检测到人品抽奖相关参数，请确认页面是否为抽奖页面，或者你是否有足够等级使用攒人品服务！')
            return
        }
        
        //抽奖吧
        
        //请用户决定
        var ret=confirm('这是人品抽奖页面，是否要使用脚本自动抽奖？')
        if(!ret){
            return
        }
        
        //检测是否还有机会
        var today_remain_time=parseInt($('#nowRemainTime').text())
        if(today_remain_time==0){
            alert('你今天抽奖次数用光了，明天再来吧！')
            return
        }
        
        //请用户决定是否自动并发领奖
        var auto_use=confirm('如果你中奖了（有正数收入），是否要脚本自动并发领奖？')
        
        //请用户输入抽奖的并发数目以及领奖的并发数目
        var how_many=null
        while(how_many==null){
            how_many=prompt('请输入你想并发抽奖的请求数目？默认为200次。','200')
            if(how_many==''){
                alert('你输入的数目有误，请输入>=0的整数！')
                how_many=null
            }else{
                how_many=parseInt(how_many)
                if(isNaN(how_many)){
                    alert('你输入的数目有误，请输入>=0的整数！')
                    how_many=null
                }else{
                    break
                }
            }
        }
        var how_many_use=null
        while(how_many_use==null){
            if(!auto_use){
                break
            }
            how_many_use=prompt('请输入你想并发领奖的请求数目？默认为10次。','10')
            if(how_many_use==''){
                alert('你输入的数目有误，请输入>=0的整数！')
                how_many_use=null
            }else{
                how_many_use=parseInt(how_many)
                if(isNaN(how_many_use)){
                    alert('你输入的数目有误，请输入>=0的整数！')
                    how_many_use=null
                }else{
                    break
                }
            }
        }
        
        //初始化统计量
        var count=0
        var status=[]
        var success=[]
        var count_auto=0
        var auto_status=[]
        var auto_success=[]
        
        //结果的特征量
        var all_renpin_results=[0,10,50,100,200,500,1000,-1]
        
        //在视图中实时提示
        $('body').append('<div class="sm_script_realtime_results" style="width:66%;height:77%;overflow-y:auto;position:fixed;top:20%;left:1%;background-color:red;color:white;z-index: 11010;"><div>～～～实时结果～～～</div></div>')
        var real_results=$('.sm_script_realtime_results')
        
        //提醒
        alert('请记住你当前的人品值，由于并行的原因，脚本无法统计真实花费的抽奖本钱，只能够统计你抽奖赢得了多少人品，领取了多少人品，在脚本运行结束后请手动刷新，自行计算纯收入！')
        
        //开始请求
        for(var idx=0;idx<how_many;idx++){
            //判断是否还有机会
            if(today_remain_time==0){
                return
            }
            
            count++
            new ajax({
                url: "http://renpin.renren.com/mall/lottery/dolottery",
                method: "post",
                onSuccess: function(D) {
                    //分析结果
                    var B = parse(D.responseText)
                    status.push(B.code)
                    
                    if(B.code==0){
                        //更新抽奖剩余次数
                        today_remain_time=B.remainCount
                        
                        //显示实时结果
                        if(B.type==0){
                            real_results.append('<div>中了'+all_renpin_results[B.result]+'点人品值。</div>')
                            success.push(all_renpin_results[B.result])
                        }else{
                            real_results.append('<div>这不科学，你中了话费？</div>')
                        }
                        
                        //是否自动领取
                        if(auto_use){
                            if(B.type==0){
                                //检测奖品是否正数奖励
                                if(all_renpin_results[B.result]<=0){
                                    real_results.append('<div>奖品id为'+B.id+'的奖励数值'+all_renpin_results[B.result]+'非正抛弃不领取！</div>')
                                }else{
                                    count_auto+=how_many_use
                                    for(var idx=0;idx<how_many_use;idx++){
                                        new ajax({
                                            url: "http://renpin.renren.com/mall/lottery/use",
                                            method: "post",
                                            data: "id=" + B.id,
                                            onSuccess: function(C) {
                                                var ret=parse(C.responseText)
                                                auto_status.push(ret.code)
                                                if(ret.code!=0){
                                                    real_results.append('<div>并发领取id为'+B.id+'的奖品'+all_renpin_results[B.result]+'点人品值失败！</div>')
                                                }else{
                                                    real_results.append('<div>并发领取id为'+B.id+'的奖品'+all_renpin_results[B.result]+'点人品值成功！</div>')
                                                    auto_success.push(all_renpin_results[B.result])
                                                }
                                            }
                                        })
                                    }
                                }
                            }else{
                                real_results.append('<div>奖品id为'+B.id+'的类型为话费，暂不支持自动领取！</div>')
                            }
                        }
                    }else{
                        real_results.append('<div>请求被判定为无效！</div>')
                    }
                    
                    //检测是否所有请求都已完成
                    if(status.length==count &&
                        auto_status.length==count_auto){
                        real_results.append('<div>~~~请求结束，正在统计结果～～～</div>')
                        
                        //统计
                        //奖品为正数的数目
                        var corrent_do=0
                        //奖品为正数的值求和
                        var corrent_do_value_count=0
                        //成功领取的所有奖品的值求和
                        var corrent_get_value_count=0
                        
                        for(var idx=0;idx<success.length;idx++){
                            if(success[idx]>0){
                                corrent_do++
                                corrent_do_value_count+=success[idx]
                            }
                        }
                        
                        for(var idx=0;idx<auto_success.length;idx++){
                            corrent_get_value_count+=auto_success[idx]
                        }
                        
                        //提供结果
                        alert('并发了'+count+'次抽奖请求，赢了'+corrent_do+'次，正数价值的奖品共值'+corrent_do_value_count+'人品，并发领奖得到'+corrent_get_value_count+'个人品，今天还有'+today_remain_time+'次抽奖机会！')
                    }
                }
            })
        }
    }
})();
