// ==UserScript==
// @name       人人网个人主页-自动刷人品
// @namespace  http://www.smitechow.com
// @version    final 1.0
// @description  自动刷新页面获得人品，并发请求刷随即攒
// @include      http://www.renren.com/*
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
        if($('#interval').length==0){
            alert('未检测到人品相关参数，请确认页面是否为个人主页，或者你是否有足够等级使用攒人品服务！')
            return
        }
        
        //自动刷新得人品
        
        //距离下次刷新还有多少毫秒
        var time=parseInt($('#interval').val())
        
        //定时刷新页面
        setTimeout(function(){
            location.reload()
        },time)
        
        //倒计时提示
        $('body').append('<span style="position:fixed;top:10px;right:10px;background-color:red;color:white;z-index: 11010;">还有<span class="sm_script_remain_sec">？</span>秒页面将自动刷新得人品</span>')
        var time_past=0
        setInterval(function(){
            time_past+=1000
            var revert_time=Math.round((time-time_past)/1000)
            $('.sm_script_remain_sec').text(''+revert_time)
        },1000)
        
        //随机攒
        
        //检测是否还有机会
        var able=$('#userIfPin').val()
        if(able=='false'){
            //请用户决定
            var ret=confirm('检测到你今天还没有点随机攒按钮，是否要使用脚本自动刷？')
            if(!ret){
                return
            }
            
            //请用户输入并发数
            var how_many=null
            while(how_many==null){
                how_many=prompt('请输入你想并发的请求数目？默认为10次。','10')
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
            
            //初始化统计量
            var success=[]
            var status=[]
            
            //开始请求
            for(var idx=0;idx<how_many;idx++){
                new ajax({
                    url: "http://renpin.renren.com/action/collectrp",
                    onSuccess: function(g) {
                        //分析请求是否成功
                        var f = parse(g.responseText);
                        status.push(f.code)
                        if(f.code==0){
                            success.push(f.currRp)
                        }
                        
                        //检测是否所有的请求都已完成
                        if(status.length==how_many){
                            var total=0
                            for(var idx=0;idx<success.length;idx++){
                                total+=success[idx]
                            }
                            
                            //统计结果的显示
                            alert('你总共并发了'+how_many+'次随机攒请求，共有'+success.length+'次成功攒到，你今天一共获得'+total+'个人品！')
                            location.reload()
                        }
                    } 
                })
            }
        }
    }
})();
