/**
 * 行政区划选择
 * @module distPicker
 * @class distPicker
 * @author GuoKan
 */
$(function(){
	function DistPicker(target){
		var thisDist=this
		$.each(target.attributes,function(){
			switch(this.name){
			case "id":
				thisDist.target =this.value.replace("_desc","")
				thisDist.id ="dp-"+thisDist.target
			    break
			case "distvaluedata":
				var distValue=[[]]
				this.value.split(",").forEach(function(item){
					distValue.push(item.split("-"))
				})
				thisDist.distValue=distValue
				break
			case "panelheight":
				thisDist.panelheight=parseInt(this.value)
				break
			default:
				thisDist[this.name]=this.value
			}
		})
		thisDist.fontSize=$(target).css("font-size")
		DistPicker.prototype.url=DistPicker.prototype.url||thisDist.url
	} 
	DistPicker.prototype={  
		constructor:DistPicker,
		distPickers:{}, 
		distData:{},
		distValue:[],
		activeTab:0,
		theme:"default",
		structure:[["省","110000"],["市","111100"],["县","111111"]],
		panelwidth:"100%",
		panelheight:200,
		init:function(){
			/*生成tabHead与tabBody*/
			var $distHead=$("<ul>").attr({"class":"distHead"}),
				$distBody=$("<div>").attr({"class":"distBody"})
			for (var i = 0, len = this.structure.length; i < len; i++){
				$distHead.append(
						$("<li>").text(this.structure[i][0])
								.attr("class",i==this.activeTab?"active":"")
						)
				$distBody.append(
						$("<div>").attr("class",i==this.activeTab?"active":"")
						)
		    }
			$("<div>").append($distHead).append("<style>#"+this.id+" div.distBody{height:"+(100-Math.round(4000/this.panelheight))+"%;}</style>").append($distBody)
			          .attr({
							"id":this.id,
							"style":"width:"+this.panelwidth+";height:0",
					   })
					  .mouseleave(this.autoHide)
			          .insertAfter($("#"+this.target+"_desc").mouseleave(this.autoHide))
			/*确定选择框显示位置*/
			this.locate()
			/*存入初始状态：activeTab=0(已初始化在proto中),且其上级状态为[000000,true,null]*/          
			this.distValue[0]=[this.structure[0][1].replace(/1/g,"0"),true]
			this.renderTargetDesc().renderTab()
			/*此对象以targetId为索引存入全局变量*/
            DistPicker.prototype.distPickers[this.target]=this
            return this
		},	
		toggle:function(){
			/*DistPickerPanel显示/隐藏*/
			var $this=$("#"+this.id)
			$this.css("height",$this.css("height").replace("px","")>0?"0":this.panelheight+"px")
			setTimeout(function(){
				$("ul.distHead>li",$this).eq(DistPicker.prototype.activeTab).addClass("active").siblings(".active").removeClass("active")
				$("div.distBody>div",$this).eq(DistPicker.prototype.activeTab).addClass("active").siblings(".active").removeClass("active")
			},200)
			this.locate()
		},
		autoHide:function(){
			/*鼠标离开0.5s后自动收起*/
			var targetId=event.currentTarget.id.replace(/dp-|_desc/,"")
			setTimeout(function(){
				if($("#dp-"+targetId+":hover,#"+targetId+"_desc:hover").length==0){
					$("#dp-"+targetId).css("height","0px")
				}
			},500)
		},
		choose:function($choosen){
			/*DistPickerPanel内元素被选择*/
			/*li*/
			if($choosen.is("ul.distHead>li:not(.active)","#"+this.id)){
				var tabIndex=$choosen.prevAll().length
				/*若所选tab非空则显示*/
				if($("div.distBody>div","#"+this.id).eq(tabIndex).children("a").length>0){
					this.activeTab=tabIndex
					this.renderTab()
				}
			/*a*/
			}else if($choosen.is("div.distBody a")){
				var tabIndex=$choosen.parent().prevAll().length
				$choosen.addClass("active").siblings(".active").removeClass("active")
				/*压入此次选择状态[choosenVal,true,上级名]*/
				this.activeTab=tabIndex+1
				this.distValue[tabIndex+1]=[$choosen.data("id"),true,$choosen.text()]
				/*若所选为最后一级,则收起DistPickerPanel;否则继续渲染下一级数据*/
				if(tabIndex==this.structure.length-1){
					this.renderTargetDesc().toggle()
				}else{
					this.renderTargetDesc().renderTab()
				}
				/*数据放入原始input,更新input_desc值*/
				$("#"+this.target).val($choosen.data("id"))
			}
		},
		renderTab:function(){
			/*根据activeTab/distValue状态渲染Tabs*/
			var thisDist=this,
			    parentStat=this.distValue[this.activeTab],
			    $this=$("#"+this.id)
			/*当更新标志为true才获取数据渲染*/
			if(parentStat[1]){
				var $thisTabBody=$("div.distBody>div",$this).eq(thisDist.activeTab).html("<p>加载中......<p>")
				if(!this.distData[parentStat[0]]){
					var parentId=parentStat[0].toString().replace(/(00)+$/,"")
					$.ajax({url: this.url,
						    dataType:"json",
							data: {"dto.frag":parentId},//单独区分湖北省省级行政区划 parentId=="42"?"((((0[1-9])|([1-8][0-9]))00)|(90)((0[1-9])|([1-9][0-9])))$":"((0[1-9])|([1-9][0-9]))0*$"
						 	success: function(data){
					 			var items=data.fieldData.items,itemsDoc=[];
								for (var i = 0, len =items.length; i < len; i++) {
									if(len>1&&items[i]["id"]==parentStat[0])continue
									itemsDoc.push("<a data-id='" + items[i]["id"]+"'"+(thisDist.distValue.indexOf(items[i]["id"])>-1?" class='active'":"")+">" + items[i]["name"] + "</a>");
								}
								DistPicker.prototype.distData[parentStat[0]]=itemsDoc
								$thisTabBody.empty().append(itemsDoc.join(""))
					 	}
					})
				}else{
					$thisTabBody.empty().append(this.distData[parentStat[0]].join(""))
				}
				/*数据渲染完成,修改更新标志为false*/
				this.distValue[this.activeTab][1]=false
				/*清空下级数据*/
				$thisTabBody.next().empty()
			}
			/*tab显示状态更新*/
			$("ul.distHead>li",$this).eq(thisDist.activeTab).addClass("active").siblings(".active").removeClass("active")
			$("div.distBody>div",$this).eq(thisDist.activeTab).siblings(".active").removeClass("active").end().delay(200).addClass("active")
		},
		renderTargetDesc:function(){
			var $target_desc=$("#"+this.target+"_desc"),val_desc=[],inputWidth=2*($target_desc.css("width").replace("px","")*0.85||200)
			for(var i=1,distValue=this.distValue;i<distValue.length;i++){
				val_desc.push(distValue[i][2])
				if((distValue[i][1]||"").toString()=="true"){
					break
				}
			}
			//若字体调整至12px仍超出,或三级行政区划相同(港澳),则移除上级区划
			while(val_desc.join("-").replace(/[^\x00-\xff]/g, 'xx').length*12>inputWidth||val_desc[0]==val_desc[1]&&val_desc.length>1){
				val_desc.shift()
			}
			if(val_desc.join("-").replace(/[^\x00-\xff]/g, 'xx').length*this.fontSize.replace("px","")>inputWidth){
				$target_desc.css("cssText","font-size:"+Math.ceil(inputWidth/val_desc.join("-").replace(/[^\x00-\xff]/g, 'xx').length)+"px!important")
			}else{
				$target_desc.css("cssText","font-size:"+this.fontSize+"!important")
			}
			$target_desc.val(val_desc.join("-")).addClass("show")
			return this
		},
		locate:function(){
			var obj =document.getElementById(this.id),loc={}
			loc.dW=obj.clientWidth, loc.dH=this.panelheight;  
			for (loc.dL= obj.offsetLeft,loc.dT= obj.offsetTop;obj.offsetParent;){
				    obj=obj.offsetParent;
			        loc.dT+= obj.offsetTop;  
			        loc.dL+= obj.offsetLeft;  
			} 
			if(loc.dT+loc.dH>obj.clientHeight){
				$("#"+this.id).css("top",-this.panelheight+"px").before("<style>#"+this.id+":before{top:"+(this.panelheight-8)+"px;border-top-color: #ddd;border-bottom-color:transparent;}#"+this.id+":after{top:"+(this.panelheight-9)+"px;border-top-color: #fff;border-bottom-color:transparent;}</style>")
			}
			if(loc.dL+loc.dW>obj.clientWidth){
				$("#"+this.id).css("right",0).before("<style>#"+this.id+":before{left:"+Math.round(100-8500/this.panelwidth.replace("%",""))+"%;}#"+this.id+":after{left:"+Math.round(100-8500/this.panelwidth.replace("%",""))+"%;}</style>")
			}
		},
		cookie:function(){
			console.log("cookie")
		}
	}
	/*initDoms*/
	$("input.ta-distPicker").each(function(){
		var $target=$(this),
		    chars=(this.value.match(/(..)/g))||[],
		    len=chars.length,
		    rgxs=[],
		    descVal=""
		/*生成descInput显示明文,隐藏原始输入框*/
			/*decode码值*/
		while(len>0){
			rgxs.push(chars.join(""))
			chars[--len]="00"
		}
		$.ajax({url: this.getAttribute("url"),
				data: {"dto.frag":rgxs.join("|"),"dto.wholeReg":true},
			 	success: function(data){
			 		$target.clone()
			 		       .attr({"id":$target.attr("id")+"_desc", "name":""})
			 			   .insertAfter($target.hide())
			 			   .each(function(){
			 				   if(data.fieldData){
				                   this.setAttribute("distvaluedata",rgxs.length?(data.fieldData.items.map(function(item){
				                	   return item.id+"-"+false+"-"+item.name
				                   })):"")
			 				   }
						 	   new DistPicker(this).init()
					 		})
					 	}
		})
	})
	/*eventListen*/
	$("body").click(function(){
		//全部点击事件托管
		var $target=$(event.target),
			$targetDistPicker=$target.parents("[id^=dp-]")
		//输入框，toggle DistPickerPanel
		if($target.hasClass("ta-distPicker")){
			$target.blur()
			DistPicker.prototype.distPickers[$target.attr("id").replace("_desc","")].toggle()
		}
		//DistPickerPanel
		else if($targetDistPicker.length){
			DistPicker.prototype.distPickers[$targetDistPicker.attr("id").replace("dp-","")].choose($target)
		}
	})
})


/****************************************************
 使用方法,示例 
 HTML:
 	DOM:
 		//引入js、css
 		<script type="text/javascript" src=".../distPicker.js"></script>
 		<link  rel="stylesheet" type="text/css" href=".../distPicker-default.css">
 		//input元素className包含"ta-distPicker"即可,url:数据来源,panelwidth:宽默认100%,panelheight:默认200px
		<input id="a0114" class="ta-distPicker" type="text" url="userManageAction!distPicker.do" panelwidth="100%" panelheight="200px"/>
	Ta3:
		<ta:distPicker id="b0140" key="单位所属区划" url="companyInfoManagerAction!distPicker.do" />
 Action:
 	public String distPicker() throws Exception{
        ParamDTO dto=getDto();
        String frag=dto.getAsString("frag");
        Pattern p=ValidateUtil.isEmpty(dto.getAsString("wholeReg"))?
                  Pattern.compile("^"+frag+"((0[1-9])|([1-9][0-9]))0*$"):
                  Pattern.compile(frag);  
        List<Map<String,Object>> resultList=new ArrayList();
        List<AppCode> codeList=CodeTableLocator.getCodeList("A0114");
        Map map;
        for (AppCode appCode : codeList) {
            if(p.matcher((appCode.getCodeValue())).matches()){
               map=new HashMap();
               map.put("id", appCode.getCodeValue());
               map.put("name", appCode.getCodeDESC());
               resultList.add(map);
            }
        }
        setData("items",resultList);
        return JSON;
    }
*/