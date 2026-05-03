package com.slack.slackjarservice.polls.model.request;

import com.slack.slackjarservice.common.base.BasePagination;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class PollPageQuery extends BasePagination {
    private String title;
    private Integer status;
    private Long createdBy;
}