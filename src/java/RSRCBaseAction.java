package com.yinhai.common.action;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import com.yinhai.sysframework.codetable.domain.AppCode;
import com.yinhai.sysframework.codetable.service.CodeTableLocator;
import com.yinhai.sysframework.dto.ParamDTO;
import com.yinhai.sysframework.util.ValidateUtil;
import com.yinhai.webframework.BaseAction;

/**
 * 专家人才管理公共Action
 * @author win
 *
 */
public class RSRCBaseAction extends BaseAction {

	 /**
     * 
     * @title distPicker
     * @author 郭侃
     * @date  2016年11月5日
     * @return
     * @throws Exception String
     * @description 获取行政区划数据
     */
    @SuppressWarnings({ "unchecked", "rawtypes" })
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
}
