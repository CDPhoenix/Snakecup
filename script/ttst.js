var content1;
var scanner = function(){
    var scanner01 = api.require('FNScanner');
        scanner01.open(function(ret,err) {
            if(ret.eventType == 'success'){
                content1 = ret.content;//获取二维码索引信息
                //alert(content);
                localStorage.setItem(1,content1);//将该索引信息储存在本地
            }
            var model = api.require('model');
            //访问请求
            model.config({
                appId:'A6108324211946',
                appKey:'EE1F371D-1FC6-2B76-AE17-1C499EB7E877',
                host:'https://d.apicloud.com'
            });
            var query = api.require('query');//访问数据库
            query.createQuery(function(ret,err){
                if(ret){
                    //alert(JSON.stringify(ret.qid));
                    model.findAll({//findALL---获得数据库中全部已记录的药品信息
                    class:"medicine",
                    qid:ret.qid
                },function(ret,err){
                    if (ret){
                        //如果访问成功
                        //var content = '0';

                        var exist;
                        var count = 0;
                        Indices = new Array();
                        for(i = 0;i < ret.length;i++){
                            if(ret[i].Index == content1){
                                count = count + 1;//发现该药物
                                Expiredate = ret[i].Expiredate;
                                var flag = 0;//flag为日期分割识别符号
                                var year = new Array();
                                var month = new Array();
                                var day = new Array();
                                for(j =  0;j<Expiredate.length;j++){
                                    if(Expiredate[j] == '.'){
                                        flag = flag + 1;
                                        continue;
                                    }
                                    if(flag == 0){
                                        year.push(Expiredate[j]);
                                    }else if(flag == 1){
                                        month.push(Expiredate[j]);
                                    }else if(flag == 2){
                                        day.push(Expiredate[j]);
                                    }
                                }
                                year = year.join('');
                                month = month.join('');
                                day = day.join('');
                                year = parseInt(year);
                                month = Number(month);
                                day = Number(day);
                                time = year*365 + month*30 + day - 10;
                                //alert(month);
                                var current = new Date();
                                var cur_year = current.getFullYear();
                                var cur_month = current.getMonth()+1;
                                var cur_day = current.getDate();
                                time01 = cur_year*365 + cur_month*30 + cur_day;
                                //判断是否过期
                                if(time < time01){
                                    //过期了发送过期提醒
                                    Alert = "This Med would expired in 10 days!\n";
                                    info = Alert + "The expired drug: " + ret[i].Name + "\n" + "Expired Date: " + ret[i].Expiredate + "\n" + "Record index: " + ret[i].Index;
                                    alert(info);
                                    //alert(exist);
                                    continue;
                                }else{
                                    //没有就算了
                                    //exist = 1;
                                    //alert(exist)
                                    //continue;
                                }
                            }
                        }
                        if(count > 0){
                            exist = 1;
                        }else{
                            exist = 0;
                        }
                        if(exist == 0){//发现未记录的药品，要求输入药品信息
                            //scanner01.closeView();//关闭扫码窗口
                            //alert("No such item");//数据库中没有该药物
                                api.openWin({//打开提交表单窗口
                                    name: 'datasubmit',
                                    url:'../datasubmit.html'
                                });
                        }else{
                            api.closeWin({
                                name:'datasubmit'
                            });
                        }
                    }else{
                        alert(JSON.stringify(err));//答应数据库访问失败信息
                    }
                });
            }else{
                alert(JSON.stringify(err));//打印数据库连接失败信息
            }
            });
            scanner01.closeView();//扫描成功后关闭扫描窗口
        });
};
var datasubmit = function(){
    let formData = new FormData(MedicineInfo);//获取datasubmit.html页面中的药品保单
    let name = formData.get('Name');//获取该药品名称
    let Expiredate = formData.get('Expiredate');//获取该药品过期日期
    var index = localStorage.getItem(1);//获取QRcode编码
    Expiredate = DateProcess(Expiredate);//对过期日期进行格式转化,转化为统一格式
    obj = {//新建object包含该药品所有属性
        'Name':name,
        'Expiredate':Expiredate,
        'Index':index
    };
    dataadd(obj);//将该object添加进数据库
    api.closeWin({
        name:'datasubmit'//关闭该窗口，返回扫码页面
    });
}
var DateProcess = function(Date){
    Date = String(Date);//先强制转化成字符串
    var year = new Array();
    var month = new Array();
    var day = new Array();
    var flag = 0;//记录切割点位置
    for(i = 0;i<Date.length;i++){
        if(Date[i] == "-"){
            flag = flag + 1;//更新切割点位置
            continue;
        }
        if(flag == 0){
            year.push(Date[i]);
        }else if(flag == 1){
            month.push(Date[i]);
        }else if(flag == 2){
            day.push(Date[i]);
        }
    }
    year = year.join('');
    month = month.join('');
    day = day.join('');
    Date = year + "." + month + "." + day//利用字符串统一格式
    return Date;//返回标准日期值
}
function dataadd(obj){
    var model = api.require('model');
    model.config({//访问数据库
        appId:'A6108324211946',
        appKey:'EE1F371D-1FC6-2B76-AE17-1C499EB7E877',
        host:'https://d.apicloud.com'
    });
    model.insert({
        class:'medicine',//添加到medicine类
        value: {
            Name : obj.Name,
            Expiredate:obj.Expiredate,
            Index:obj.Index
        }
    },function(ret,err){
        if(ret){
            alert(JSON.stringify(ret));//显示添加成功信息
        }else{
            alert(JSON.stringify(err));//显示错误信息
        }
    });
}

var check = function(){//查找所有在记录过期药信息
    var model = api.require('model');
    model.config({
        appId:'A6108324211946',
        appKey:'EE1F371D-1FC6-2B76-AE17-1C499EB7E877',
        host:'https://d.apicloud.com'
    });
    var query = api.require('query');
    query.createQuery(function(ret,err){//请求访问数据库
        if(ret){
            model.findAll({
                class:"medicine",
                qid:ret.qid
            },function(ret,err){
                if (ret){
                    for (i = 0;i<ret.length;i++){//以下代码是现场计算在册药品相对当前系统时间是否过期
                        Expiredate = ret[i].Expiredate;
                        var flag = 0;
                        var year = new Array();
                        var month = new Array();
                        var day = new Array();
                        for(j =  0;j<Expiredate.length;j++){
                            if(Expiredate[j] == '.'){
                                flag = flag + 1;
                                continue;
                            }
                            if(flag == 0){
                                year.push(Expiredate[j]);
                            }else if(flag == 1){
                                month.push(Expiredate[j]);
                            }else if(flag == 2){
                                day.push(Expiredate[j]);
                            }
                        }
                        year = year.join('');
                        month = month.join('');
                        day = day.join('');
                        year = parseInt(year);
                        month = Number(month);
                        day = Number(day);
                        time = year*365 + month*30 + day
                        var current = new Date();
                        var cur_year = current.getFullYear();
                        var cur_month = current.getMonth();
                        var cur_day = current.getDate();
                        time01 = cur_year*365 + cur_month*30 + cur_day;
                        if(time < time01){
                            info = "The expired drug: " + ret[i].Name + "\n" + "Expired Date: " + ret[i].Expiredate + "\n" + "Record index: " + ret[i].Index;
                            alert(info);
                        }
                    }  
                }else{
                    alert(JSON.stringify(err));
                }
            });
        }else{
            alert(JSON.stringify(err));
        }
    });
}

var one = function(){
    return 1;
}

var zero = function(){
    return 0;
}

var ScanningName = function(){//扫条形码获得名字
    var URL = 'https://api.upcitemdb.com/prod/trial/lookup?upc='//数据库查询网址
    var scanner02 = api.require('FNScanner');
    var content2;
    scanner02.open(function(ret,err){
        if(ret.eventType == 'success'){
            content2 = ret.content;//获取条形码编号信息
            URL = URL + String(content2);//生成查询用的URL
            api.ajax({//访问条形码数据库
                url: URL,
                method: 'get',
                },function(ret,err){
                if (ret) {
                    var C = JSON.stringify(ret.items);
                    var result = JSON.parse(C);
                    var B = JSON.stringify(result[0].offers);
                    var result2 = JSON.parse(B);
                    document.getElementById("MedName").value = JSON.stringify(result2[0].title);//专门提取药品名称,输入             
                } else {
                    api.alert({msg:JSON.stringify(err)});
                }; 
                });
        }
    });
    //alert(document.getElementById("MedName").value);
}