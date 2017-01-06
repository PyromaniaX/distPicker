# DistPicker

三级行政区划选择插件及其对应ta3标签

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