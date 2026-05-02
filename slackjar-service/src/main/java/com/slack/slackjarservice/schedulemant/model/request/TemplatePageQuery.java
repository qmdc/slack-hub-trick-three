package com.slack.slackjarservice.schedulemant.model.request;

import com.slack.slackjarservice.common.base.BasePagination;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 计划模板分页查询请求
 *
 * @author zhn
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class TemplatePageQuery extends BasePagination {

    private String name;

    private Integer templateType;

    private Integer status;
}
