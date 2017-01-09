# DistPicker


distPicker为围绕Ta+3作了简单前端封装的三级行政区划选择插件。  

插件包含前端组件,后台action层实现模版,与db层数据脚本

# 依赖

* 前端：jquery-1.7.1.min.js
* 后台：Ta+3.12及以上
* 数据库：执行build/distPicker.sql,生成行政区划码表数据

# 快速开始

## 前端引入分为两个版本:

**原生html**:

   ① 引 入js、css
```html
<script type="text/javascript" src=".../distPicker.js"></script>
<link  rel="stylesheet" type="text/css" href=".../distPicker-default.css">
```
​                ② 为input元素className加上：ta-distPicker
```html
<input id="a0114" class="ta-distPicker" type="text" url="userManageAction!distPicker.do" panelwidth="100%" panelheight="200px"/>
```



**Ta+3**:

   ①引入tag、css文件

   ​    *.../webapp/WEB-INF/tags/tatags/distPicker.tag*

   ​    *.../webapp/ta/resource/themes/extends/distPicker/distPicker-ta3.css*

   ②引入js文件并由require.js控制其加载

   ​    *.../webapp/ta/resource/external/plugin/extends-all/distPicker.js*

```javascript
   mian.js:
     require.config()参数字面量中，paths添加属性
   	"distPicker" : "extends-all/distPicker"
```
​                 ③页面使用ta:distPicker标签对

```html
<ta:distPicker id="b0140" key="单位所属区划" url="companyInfoManagerAction!distPicker.do" />
```



## 后台action返回约定格式json:

```java
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
```

# 文档
细节请查看文档[WIKI](../../wiki)