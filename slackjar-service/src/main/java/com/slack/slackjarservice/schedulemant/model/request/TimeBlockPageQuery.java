package com.slack.slackjarservice.schedulemant.model.request;

import com.slack.slackjarservice.common.base.BasePagination;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 时间块分页查询请求
 *
 * @author zhn
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class TimeBlockPageQuery extends BasePagination {

    private Long startTime;

    private Long endTime;

    private Integer blockType;

    private Integer priority;

    private Integer status;
}
