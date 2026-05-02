package com.slack.slackjarservice.schedulemant.model.request;

import com.slack.slackjarservice.common.base.BasePagination;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 任务分页查询请求
 *
 * @author zhn
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class TaskPageQuery extends BasePagination {

    private String title;

    private Integer priority;

    private Integer taskType;

    private Integer status;

    private Long dueTimeStart;

    private Long dueTimeEnd;
}
