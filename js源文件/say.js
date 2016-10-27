/**
 * author: rene
 * Date: 2016/10/15
 * Time: 12:40
 */
var ecp=null;

var e=[];
var flag=0;
var is_praise=0;
var token=null;
var p = "-219px -51px";
var a=null;
var b=null;
var c=null;
var d=null;
var nickname=null;
var is_anonymous=null;
var headimgurl=null;
var project_like=null;
var layer_opacity=null;
var layer_background_color=null;
var layer_like_url_1=null;
var layer_like_url_2=null;
var userlist_position=null;



function ecpanoSay(){
	
	var ecpano=document.getElementById("krpanoSWFObject");

	//获取点赞数量、是否已点赞
	this.getPraise=function(){
		var s = ecpano.get("scene[get(xml.scene)].name");
		var l = geturl();
		var datakr = {
			s: s,
			l: l
		};
	    //加载点赞数量
		$.ajax({
			type: 'post',

			url: 'http://say.ecpano.com/say/like_number',

			async: true,

			data: datakr,
			dataType: "json",
			success: function(data) {
				ecpano.call("set(layer[praise_text].html,"+data.body.data.project_like+")");
				ecpano.call("set(layer[readCount].html,人气："+data.body.data.project_number+")");
				project_like=data.body.data.project_like;
			},
			error: function() {

			}

		});
		//判定当前ip当天是否已点赞
		var url = geturl();
		var data = {
			l: url
		};
		$.ajax({
			type: 'post',

			url: 'http://say.ecpano.com/like_number/is_like',

			async: true,

			data: data,
			dataType: "json",
			success: function(data) {
				if (data.header.status == 1) {
					ecpano.call("set(layer[praise].url,"+layer_like_url_1+")");
					is_praise=0;
				} else {
					ecpano.call("set(layer[praise].url,"+layer_like_url_2+")");
					is_praise=1;
				}
			},
			error: function() {

			}
		});
	}

	//加载说一说列表
	this.sayList=function(){
		var s = ecpano.get("scene[get(xml.scene)].name");
		var l = geturl();
		var datakr = {
			s: s,
			l: l
		};
		$.ajax({

			type: 'post',

			url: 'http://say.ecpano.com/say/say_list',

			async: true,

			data: datakr,
			dataType: "json",
			success: function(data) {
				if (data.header.status == 1) {
				
					$.each(data.body.data, function(index, item) {
						if (s == item.s) {
							var a = item.a;
							var h = item.h;
							var v = item.v;
							var b = item.b;
							var c = item.c;
							var t = item.text;
							var url = item.hu;
							e.push(a);
							ecpano.call("ecpanoAddhot(" + a + "," + h + "," + v + "," + b + "," + c + ")");
							if (is_anonymous == 1) {
								ecpano.call("set(plugin[" + b + "].url," + url + ");");
							} else {
								posi = url.split(' ');
								posi[0] = -parseInt(posi[0]) * 2;
								posi[1] = -parseInt(posi[1]) * 2;
								ecpano.call("set(plugin[" + b + "].crop,'" + posi[0] + "|" + posi[1] + "|88|88');");
								ecpano.call("set(plugin[" + b + "].url," + userlist_position + ");");
							}

							ecpano.call("set(plugin[" + c + "].html," + t + ");");
							ecpano.call("set(hotspot[" + a + "].ondown,'')");
							ecpano.call("set(plugin[" + c + "].backgroundcolor," + layer_background_color + ");");
							ecpano.call("set(plugin[" + c + "].backgroundalpha," + layer_opacity + ");");
						}
					});
				}
			},
			error: function() {
				$("#content").html("&#10006;&nbsp;&nbsp;请求失败！");
				alert(data.header.info);
				alertlog();
			}
		});
		is_listComplete=1;
	};

	//点击说一说
	this.addsay=function(){
		$("#addmessage").show();
		ecp.hideLayer();

		$("#input1").val("");
		for (var k = 0; k < e.length; k++) {
			ecpano.call("set(hotspot[" + e[k] + "].visible,true)");
		}
		ecpano.call("skin_hideskin();");


		// 点击说一说时判断是否已登录，若已登录，则直接添加评论热点
		if(getCookie('username') != 'null' && getCookie('username').toString().length > 1){
				token=getCookie('username');
		};
		if (is_anonymous == 1) {

			if (token != null && token.toString().length > 1) {
				$.ajax({
					type: 'post',
					url: 'http://say.ecpano.com/say_user/index',
					async: true,
					data: {
						't': token //token参数
					},
					dataType: "json",
					success: function(data) {
						if (data.header.status == 1) {
							var nickname = data.body.data.nickname;
							var headimgurl = data.body.data.headimgurl;
							$(".qqimg").attr("src", headimgurl);
							$("#username").text(nickname);
							var num = Math.random() * 1000 + 0;
							num = parseInt(num, 10);
							a = "a" + num;
							b = "b" + num;
							c = "c" + num;
							var h = Number(ecpano.get("view.hlookat"));
							var v = Number(ecpano.get("view.vlookat"));
							ecpano.call("ecpanoAddhot(" + a + "," + h + "," + v + "," + b + "," + c + ")");
							ecpano.call("set(plugin[" + b + "].url," + headimgurl + ")");
							ecpano.call("set(plugin[" + c + "].backgroundcolor,0xFF8C00)");
							ecpano.call("set(plugin[" + c + "].backgroundalpha,0.9)");
						} else {
							alert('获取失败！');
						}
					},
					error: function() {
						alert("保存失败");
					}
				});
			} else {
				$("#input1").click(function() {
					$(".login").show();
					$("#input1").attr("disabled",true);
					$("#qq_login").click(function(){
						var uri = "http://qq.back.say.ecpano.com/callback/index?url=" + geturl();
						window.location.href = "https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=101344021&redirect_uri=" + encodeURIComponent(uri);	
					});
					$("#wechat_login").click(function(){
						var uri = geturl().substring(7);
						window.location.href = "http://wechat.back.say.ecpano.com/?redirect_url=\"" +uri+"\"";
			
						$("#input1").attr("disabled",false);

					});		
				});
			}
		} else {
			$("#addmessage").show();
			ecp.hideLayer();
			$("#input1").val("");
			for (var k = 0; k < e.length; k++) {
				ecpano.call("set(hotspot[" + e[k] + "].visible,true)");
			}
			ecpano.call("skin_hideskin();");
			var num = Math.random() * 1000 + 0;
			num = parseInt(num, 10);
			a = "a" + num;
			b = "b" + num;
			c = "c" + num;
			var h = Number(ecpano.get("view.hlookat"));
			var v = Number(ecpano.get("view.vlookat"));
			ecpano.call("ecpanoAddhot(" + a + "," + h + "," + v + "," + b + "," + c + ")");
			ecpano.call("set(plugin[" + b + "].url,"+userlist_position+")");
			ecpano.call("set(plugin[" + b + "].crop,'438|102|88|88')");
			ecpano.call("set(plugin[" + c + "].backgroundcolor,0xFF8C00)");
			ecpano.call("set(plugin[" + c + "].backgroundalpha,0.9)");
		}
		document.getElementById('input1').addEventListener('input', function(e) {
			var value = e.target.value;
			ecpano.call("set(plugin[" + c + "].html," + "[b]" + value + "[/b]" + ")");
		});
	};


	//取消评论
	this.cancelPost=function(){
		ecp.showLayer();
		$("#addmessage").hide();
		$("#userbox").hide();
		$(".login").hide();
		$("#input1").attr("disabled",false);
		$("#tx").css("backgroundPosition", '-219px -51px');
		ecpano.call("set(hotspot[" + a + "].visible,false)");
		ecpano.call("skin_showskin();");
	};

	//提交评论
	this.sayPost=function(){
		if (ecpano.get("plugin[" + c + "].html") == null || ecpano.get("plugin[" + c + "].html") == '[b]拖动我到指定位置[/b]' || ecpano.get("plugin[" + c + "].html") == "[b][/b]") {
			$("#content").html(" &nbsp;&nbsp;&#10006;&nbsp;&nbsp;内容不能为空！");
			alertlog();
		} else {
			ecpano.call("skin_showskin();");
			if (is_anonymous == 1) {
				$("#addmessage").hide();
				$("#userbox").hide();
				ecp.showLayer();
				var h = ecpano.get("hotspot[" + a + "].ath");
				var v = ecpano.get("hotspot[" + a + "].atv");
				var text = ecpano.get("plugin[" + c + "].html");

				var s = ecpano.get("scene[get(xml.scene)].name");
				var l = geturl();
				var t = token;
				var jsonkr = {
					a: a,
					h: h,
					v: v,
					b: b,
					c: c,
					t: t,
					text: text,
					s: s,
					l: l
				};
				$.ajax({

					type: 'post',

					url: 'http://say.ecpano.com/say/say_add ',

					async: true,

					data: jsonkr,
					dataType: "json",
					success: function(data) {

						if (data.header.status == 1) {
							ecpano.call("set(plugin[" + c + "].backgroundcolor,"+layer_background_color+")");
							ecpano.call("set(plugin[" + c + "].backgroundalpha,"+layer_opacity+")");
							$("#content").html(" &#10004;&nbsp;&nbsp;评论成功！");
							alertlog();
						} else {

							ecpano.call("set(hotspot[" + a + "].visible,'false')");
							$("#content").html("&#10006;&nbsp;&nbsp;评论失败");
							alert(data.header.info);
							alertlog();
						}

					},
					error: function() {
						$("#content").html("&#10006;&nbsp;&nbsp;评论失败！");
						alert(data.header.info);
						alertlog();
					}
				});
			} else {
				ecpano.call("set(hotspot[" + a + "].ondown,'')");
				$("#addmessage").hide();
				$("#userbox").hide();
				ecp.showLayer();
				var h = ecpano.get("hotspot[" + a + "].ath");
				var v = ecpano.get("hotspot[" + a + "].atv");
				var text = ecpano.get("plugin[" + c + "].html");
				var s = ecpano.get("scene[get(xml.scene)].name");
				var l = geturl();
				var jsonkr = {
					a: a,
					h: h,
					v: v,
					b: b,
					p: p,
					c: c,
					text: text,
					s: s,
					l: l
				};
				$.ajax({

					type: 'post',

					url: 'http://say.ecpano.com/say/say_add ',

					async: true,

					data: jsonkr,
					dataType: "json",
					success: function(data) {
						if (data.header.status == 1) {
							ecpano.call("set(plugin[" + c + "].backgroundcolor,"+layer_background_color+")");
							ecpano.call("set(plugin[" + c + "].backgroundalpha,"+layer_opacity+")");
							$("#tx").css("backgroundPosition", '-219px -51px');
							$("#content").html(" &#10004;&nbsp;&nbsp;评论成功！");
							alertlog();
						} else {

							ecpano.call("set(hotspot[" + a + "].visible,'false')");
							$("#content").html("&#10006;&nbsp;&nbsp;评论失败");
							alertlog();
						}

					},
					error: function() {
						$("#content").html("&#10006;&nbsp;&nbsp;评论失败！");
						alertlog();
					}
				});
			}

		}
	};


	//全屏计时器
	this.fullsceneClock=function(){

		if (flag == 0) {
			ecpano.call("set(layer[skin_btn_fs].onclick,jscall(ecp.fullscene()))");
			ecpano.call("set(layer[skin_btn_fs].crop, '0|576|64|64');");
		} else {

			ecpano.call("set(layer[skin_btn_fs].onclick,jscall(ecp.exitscene()))");
			ecpano.call("set(layer[skin_btn_fs].crop, '64|576|64|64');");
		}
	};


	//全屏
	this.fullscene=function(){
		var docElm = document.documentElement;
		flag = 1;
		if (docElm.requestFullscreen) {
			docElm.requestFullscreen();
		} else if (docElm.mozRequestFullScreen) {
			docElm.mozRequestFullScreen();
		} else if (docElm.webkitRequestFullScreen) {
			docElm.webkitRequestFullScreen();
		} else if (elem.msRequestFullscreen) {
			elem.msRequestFullscreen();
		}
	};


	//退出全屏
	this.exitscene=function(){
		flag = 0;
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if (document.webkitCancelFullScreen) {
			document.webkitCancelFullScreen();
		} else if (document.msExitFullscreen) {
			document.msExitFullscreen();
		}
	};


	//隐藏评论
	this.hideHot=function(){
		for (var k = 0; k < e.length; k++) {
			ecpano.call("set(hotspot[" + e[k] + "].visible,false)");
		}
		ecpano.call("set(layer[hideHot].visible,true)");
		ecpano.call("set(layer[showHot].visible,false)");

	};


	//显示评论
	this.showHot=function(){
		for (var k = 0; k < e.length; k++) {
			ecpano.call("set(hotspot[" + e[k] + "].visible,true)");
		}
		ecpano.call("set(layer[hideHot].visible,false)");
		ecpano.call("set(layer[showHot].visible,true)");
	};


	//显示layer
	this.showLayer=function(){
		ecpano.call("set(layer[skin_btn_prev_fs].visible, true);");
		ecpano.call("set(layer[skin_btn_next_fs].visible, true);");
		ecpano.call("set(layer[skin_btn_show_icon].visible, true);");
		ecpano.call("set(layer[say].visible,true)");
		ecpano.call("set(layer[showHot].visible,true)");
		ecpano.call("set(layer[praise].visible,true)");
		ecpano.call("set(layer[hideHot].visible,false)");

	};
	//隐藏layer
	this.hideLayer=function(){
		ecpano.call("set(layer[skin_btn_prev_fs].visible, false);");
		ecpano.call("set(layer[skin_btn_next_fs].visible, false);");
		ecpano.call("set(layer[skin_bt n_show_icon].visible, false);");
		ecpano.call("set(layer[say].visible,false)");
		ecpano.call("set(layer[showHot].visible,false)");
		ecpano.call("set(layer[praise].visible,false)");
		ecpano.call("set(layer[hideHot].visible,false)");
	};

	this.initLayer=function(){
		var l = geturl();
		var datakr = {
			l: l
		};
		$.ajax({

			type: 'post',

			url: 'http://say.ecpano.com/say_api_config/get_config',

			async: true,

			data: datakr,
			dataType: "json",
			success: function(data) {
				if (data.header.status == 1) {
					
						
						
							layer_background_color= "0x"+data.body.data.background_color.split('#')[1];
							layer_opacity  = data.body.data.opacity;
							
							var layer_num_position  = data.body.data.number_position;
							var layer_num_margin_left  = data.body.data.number_margin_left;
							var layer_num_margin_top  = data.body.data.number_margin_top;
							var layer_like_position  = data.body.data.like_position;
							var layer_like_margin_left  = data.body.data.like_margin_left;
							var layer_like_margin_top  = data.body.data.like_margin_top;
							layer_like_url_1  = data.body.data.like_url_1;
							layer_like_url_2  = data.body.data.like_url_2;
							var layer_say_position  = data.body.data.say_position;
							var layer_say_margin_left  = data.body.data.say_margin_left;
							var layer_say_margin_top  = data.body.data.say_margin_top;
							var layer_say_url  = data.body.data.say_url;
							var layer_show_position  = data.body.data.show_position;
							var layer_show_margin_left  = data.body.data.show_margin_left;
							var layer_show_margin_top  = data.body.data.show_margin_top;
							var layer_show_url_1  = data.body.data.show_url_1;
							var layer_show_url_2  = data.body.data.show_url_2;
							userlist_position=data.body.data.head_img;

							ecpano.call("set(layer[readCount].align,"+layer_num_position+")");
							ecpano.call("set(layer[readCount].x,"+layer_num_margin_left+")");
							ecpano.call("set(layer[readCount].y,"+layer_num_margin_top+")");

							ecpano.call("set(layer[praise].align,"+layer_like_position+")");
							ecpano.call("set(layer[praise].x,"+layer_like_margin_left+")");
							ecpano.call("set(layer[praise].y,"+layer_like_margin_top+")");
							ecpano.call("set(layer[praise].url,"+layer_like_url_1+")");

							ecpano.call("set(layer[say].align,"+layer_say_position+")");
							ecpano.call("set(layer[say].x,"+layer_say_margin_left+")");
							ecpano.call("set(layer[say].y,"+layer_say_margin_top+")");
							ecpano.call("set(layer[say].url,"+layer_say_url+")");
							

							// alert(layer_show_url_2);
							// alert(layer_show_url_1);
							ecpano.call("set(layer[showHot].align,"+layer_show_position+")");
							ecpano.call("set(layer[showHot].x,"+layer_show_margin_left+")");
							ecpano.call("set(layer[showHot].y,"+layer_show_margin_top+")");
							ecpano.call("set(layer[showHot].url,"+layer_show_url_2+")");

							ecpano.call("set(layer[hideHot].align,"+layer_show_position+")");
							ecpano.call("set(layer[hideHot].x,"+layer_show_margin_left+")");
							ecpano.call("set(layer[hideHot].y,"+layer_show_margin_top+")");
							ecpano.call("set(layer[hideHot].url,"+layer_show_url_1+")");

							

														// ecpano.call("set(plugin[" + c + "].backgroundcolor,0x000000)");
							// ecpano.call("set(plugin[" + c + "].backgroundalpha,"+layer_opacity+")");

					
				}
			},
			error: function() {
				$("#content").html("&#10006;&nbsp;&nbsp;请求失败！");
				alert(data.header.info);
				alertlog();
			}
		});
	};
}





function globalPanoEnter(ret) {

	if (ret) {return}
	var ecpano=document.getElementById("krpanoSWFObject");
	var startclock = self.setInterval(ecp.fullsceneClock(), 50);
	ecp.initLayer();
	ecp.getPraise();
	initHtml();//动态加载页面

}


function scenePanoEnter(ret) {
	if(ret){return}
	var ecpano=document.getElementById("krpanoSWFObject");
	ecp.sayList();
	ecp.showLayer();
}
globalPanoEnter(true);
scenePanoEnter(true);
addPraise(true);

$(document).ready(function(){
	ecp = new ecpanoSay();
	readCount();//获取阅读量
	reloadDom();//判断url是否包含token
	
	
});





function qqHtml(){
	return "<div class='login '><div class='login_left login_nav' id='qq_login' ><img class='login_img'  src='http://txcloud.say.ecpano.com/say/qqlog.png'><p>QQ快速登录</p></div><div class='login_right login_nav' id='wechat_login'><img class='login_img'  src='http://txcloud.say.ecpano.com/say/wechat.png'><p>微信快速登录</p> </div></div><form id='addmessage'><div><img style='float:left;width:18px;height:18px;margin-top:5px;margin-right:8px;' src='http://txcloud.say.ecpano.com/say/123.png'></img><p style='float:left;'>说一说</p></div><input  placeholder='随便说点什么吧...(不要超过二十个字哦！)' maxlength='20' id='input1' type='text'><div class='btn'><input  readonly='readonly' onclick='ecp.sayPost()'  style='width:50px;height:25px;padding:5px 10px;float:left;' class='sub' value='提交'   id='message_submit'><input readonly='readonly' type='text' onclick='ecp.cancelPost()' style='width:50px;height:25px;padding:5px 10px;float:left;' class='cancel'  value='取消' ></div><div class='user' id='user'><img class='qqimg' id='tx' src='http://txcloud.say.ecpano.com/say/user01.png'></img><p style='overflow:hidden;text-overflow:ellipsis;white-space: nowrap;course:hand;' id='username'>未登录</p></div></form><div id='praiseNum' style='text-align:center'></div></div></div><div id='alertlog' style='font-famliy:微软雅黑;position:absolute;left:50%;top:48%;margin-left:-90px;z-index:9999;height:34px;width:180px;background: #20d8a6;text-align:center;display:none;'><p id='content' style='margin-top:6px;margin-left:-12px;'>&#10004;&nbsp;&nbsp;&nbsp;&nbsp;评论成功</p></div>";
}
function anonymousHtml(){
	return "<form id='addmessage'><div><img style='float:left;width:18px;height:18px;margin-top:5px;margin-right:8px' src='http://txcloud.say.ecpano.com/say/123.png'><p style='float:left'>说一说</p></div><input placeholder='随便说点什么吧...(不要超过二十个字哦！)' maxlength='20' id='input1' type='text'><div class='btn'><input readonly='readonly' onclick='ecp.sayPost()'  style='width:50px;height:25px;padding:5px 10px;float:left' class='sub' value='提交' id='message_submit'><input readonly='readonly' type='text'  onclick='ecp.cancelPost()' style='width:50px;height:25px;padding:5px 10px;float:left' class='cancel' value='取消'></div><div class='user' id='user'><i class='userimg' id='tx'></i>选择头像</div></form><div class='box' id='userbox'><div class='userlist' style='background:url("+userlist_position+") -1px -3px / 269px 170px no-repeat'></div><div class='userlist' style='background:url("+userlist_position+") -56px -3px / 269px 170px no-repeat'></div><div class='userlist' style='background:url("+userlist_position+") -110px -3px / 269px 170px no-repeat'></div><div class='userlist' style='background:url("+userlist_position+") -164.5px -3px / 269px 170px no-repeat'></div><div class='userlist' style='background:url("+userlist_position+") -219px -3px / 269px 170px no-repeat'></div><div class='userlist' style='background:url("+userlist_position+") -1px -51px / 269px 170px no-repeat'></div><div class='userlist' style='background:url("+userlist_position+") -56px -51px / 269px 170px no-repeat'></div><div class='userlist' style='background:url("+userlist_position+") -110px -51px / 269px 170px no-repeat'></div><div class='userlist' style='background:url("+userlist_position+") -164.5px -51px / 269px 170px no-repeat'></div><div class='userlist' style='background:url("+userlist_position+") -219px -51px / 269px 170px no-repeat'></div><div class='userlist' style='background:url("+userlist_position+") -1px -99px / 269px 170px no-repeat'></div><div class='userlist' style='background:url("+userlist_position+") -56px -99px / 269px 170px no-repeat'></div><div class='userlist' style='background:url("+userlist_position+") -110px -99px / 269px 170px no-repeat'></div><div class='userlist' style='background:url("+userlist_position+") -164.5px -99px / 269px 170px no-repeat'></div><div class='userlist' style='background:url("+userlist_position+") -219px -99px / 269px 170px no-repeat'></div></div><div id='alertlog' style='font-famliy:微软雅黑;position:absolute;left:50%;top:48%;margin-left:-90px;z-index:9999;height:30px;width:180px;background:#20d8a6;text-align:center;display:none'><p id='content' style='margin-top:4px;margin-left:-12px'>&#10004;&nbsp;&nbsp;&nbsp;&nbsp;评论成功</p></div>";
}

function indexcss(){
	return "body{height:100%;overflow:hidden;margin:0;padding:0;font-family:'微软雅黑';font-size:14px;color:#FFF;background-color:#67c2d4}.login{position:absolute;z-index:4000;bottom:50%;width:210px;height:70px;left:50%;margin-left:-105px;background:rgba(0,0,0,.498039);padding-top:10px;font-size:12px;font-family:微软雅黑;text-align:center}.login_img{width:40px;height:40px;float:left;vertical-align:middle;margin-left:20px}.login_nav{width:80px;height:60px;float:left}.login_left{background:#2196f3;margin-left:20px}.login_right{background:#4caf50;margin-left:10px}.login p{float:left;margin-top:0;margin-left:5px}@-webkit-keyframes login_nav-out{10%{-webkit-transform:translateX(5px) rotate(4deg)}20%{-webkit-transform:translateX(-5px) rotate(-4deg)}30%{-webkit-transform:translateX(5px) rotate(4deg)}40%{-webkit-transform:translateX(-5px) rotate(-4deg)}50%{-webkit-transform:translateX(3px) rotate(2deg)}60%{-webkit-transform:translateX(-3px) rotate(-2deg)}70%{-webkit-transform:translateX(3px) rotate(2deg)}80%{-webkit-transform:translateX(-3px) rotate(-2deg)}90%{-webkit-transform:translateX(2px) rotate(0)}100%{-webkit-transform:translateX(-2px) rotate(0)}}.login_nav:hover{-webkit-animation-name:login_nav-out;-webkit-animation-duration:.75s;-webkit-animation-timing-function:linear;-webkit-animation-iteration-count:1}form{position:absolute;left:50%;bottom:10%;transform:translate(-50%,0);border:1px solid rgba(0,0,0,.498039);color:#fff;padding:5px 20px;font-family:微软雅黑;font-size:14px;background:rgba(0,0,0,.498039);z-index:4000}form p{margin:5px 0}form input{width:300px;height:50px;max-width:300px;max-height:100px;padding:10px;box-sizing:border-box;display:block;margin-bottom:10px;font-family:微软雅黑}.btn{float:right;text-align:right;margin-top:10px}.sub{border:none;padding:5px 15px;color:#fff;margin-right:10px;background:#166a8b}.cancel{border:1px solid #fff;padding:4px 10px;color:#fff;background:0 0}.user{line-height:44px}.userimg{display:inline-block;width:44px;height:44px;vertical-align:middle;margin-right:10px;background:url("+userlist_position+") -219px -51px/269px 170px no-repeat}.qqimg{display:inline-block;width:44px;height:44px;float:left;vertical-align:middle;margin-right:10px}.box{overflow:hidden;position:absolute;top:30%;left:50%;transform:translateX(-50%);width:270px;padding:10px;background:rgba(0,0,0,.498039)}.userlist{width:44px;height:44px;margin:5px;float:left}@media only screen and (max-height:340px){.box{top:0}form{bottom:0}}@media only screen and (min-height:500px) and (max-height:780px){.box{top:15%}}@media only screen and (min-height:360px) and (max-height:480px){.box{top:4%}form{bottom:4%}}@media only screen and (max-width:340px){form{padding:5px}}"
}

//动态加载html
function initHtml(){
	var ecpano=document.getElementById("krpanoSWFObject");
	var l = geturl();
	var project_url = {
		l: l
	};
	$.ajax({

		type: 'post',

		url: 'http://say.ecpano.com/say/is_anonymous',

		async: true,

		data: project_url,
		dataType: "json",
		success: function(data) {
			if (data.body.data.is_anonymous == 1) {
				is_anonymous = 1;
				$("style").append(indexcss());
				$("style").before("<meta name='renderer' content='ie-comp'>");
				$("body").append(qqHtml());
				$("#addmessage").hide();
				$(".login").hide();
			} else {
				is_anonymous = 0;
				$("style").append(indexcss());
				$("style").before("<meta name='renderer' content='ie-comp'>");
				$("body").append(anonymousHtml());
				$("#addmessage").hide();
				$("#userbox").hide();
				$(".login").hide();
				$("#user").click(function() {
					$("#userbox").toggle();
				});
				$(".userlist").click(function() {
					p = this.style.backgroundPosition;
					$("#tx").css("backgroundPosition", p);
					$("#userbox").hide();
					var posi = p.split(' ');
					posi[0] = -parseInt(posi[0]) * 2;
					posi[1] = -parseInt(posi[1]) * 2;
					ecpano.call("set(plugin[" + b + "].crop,'" + posi[0] + "|" + posi[1] + "|88|88');");
				});
			}
		},
		error: function(data) {
			alert(data.header.info);

		}
	});
}

//去除QQ、微信登录成功返回地址后带的token

function reloadDom(){
	var url = window.location.href; //完整地址
	var arr = url.split('?');     
	if (typeof(arr[1]) != 'undefined') {
	 	window.location.replace(arr[0]);
	 	token=GetQueryString('token');
	 	setCookie('username',token,30);
	};
}


/***************阅读量  开始*******************/

function readCount() {
	var url = geturl();
	var datalike = {
		l: url
	};
	$.ajax({
		type: 'post',

		url: 'http://say.ecpano.com/say_number/setInc',

		async: true,

		data: datalike,
		dataType: "json",
		success: function() {

		},
		error: function() {}
	});
} /***************阅读量  结束*******************/



/***************点赞  开始*******************/

function addPraise() {
	var ecpano=document.getElementById("krpanoSWFObject");
	if (is_praise == 1) {
		$("#content").html("&nbsp;&nbsp;&#10006;您今天已经点过赞啦！");
		alertlog();
	} else {
		ecpano.call("set(layer[praise].url,"+layer_like_url_2+")");
		var text = project_like;
		var num = parseInt(text) + 1;
		ecpano.call("set(layer[praise_text].html,"+num+")");
		var url = geturl();
		var datal = {
			l: url
		};
		$.ajax({
			type: 'post',

			url: 'http://say.ecpano.com/like_number/setInc',

			async: true,

			data: datal,
			dataType: "json",
			success: function(data) {
				if (data.header.status == 1) {
					$("#content").html("&#10004;&nbsp;&nbsp;点赞成功");
					alertlog();
				} else {
					alert(data.header.info);
				}
			},
			error: function(data) {
				$("#content").html("&nbsp;&nbsp;&#10006;您今天已经点过赞啦！");
				alertlog();
			}

		});
	}
} /***************点赞  结束*******************/




/***************获取地址栏 开始*******************/

//获取地址栏参数

function GetQueryString(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	var r = window.location.search.substr(1).match(reg);
	if (r != null) return unescape(r[2]);
	return null;
}

//获取不带参数的地址

function geturl() {
	var url = window.location.href; //完整地址
	var arr = url.split('?');
	var ar = arr[0]; //不含参数的地址
	return ar;
} /***************获取地址栏 结束*******************/


/***************弹出提示 开始*******************/

function alertlog() {
	$("#alertlog").fadeIn(1000);
	setTimeout($("#alertlog").fadeOut(1000), 6000);
} /***************弹出提示 结束*******************/

/***************创建cookie 开始*******************/
function setCookie(tokenVlu,value,expiredays)
{
var exdate=new Date()
exdate.setDate(exdate.getDate()+expiredays)
document.cookie=tokenVlu+ "=" +escape(value)+
((expiredays==null) ? "" : ";expires="+exdate.toGMTString())
}
/***************创建cookie 结束*******************/


/***************获取cookie 开始*******************/
function getCookie(tokenVlu)
{
if (document.cookie.length>0)
  {
  c_start=document.cookie.indexOf(tokenVlu + "=")
  if (c_start!=-1)
    { 
    c_start=c_start + tokenVlu.length+1 
    c_end=document.cookie.indexOf(";",c_start)
    if (c_end==-1) c_end=document.cookie.length
    return unescape(document.cookie.substring(c_start,c_end))
    } 
  }
return ""
}