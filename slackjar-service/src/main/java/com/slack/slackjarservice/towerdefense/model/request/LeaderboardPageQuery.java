package com.slack.slackjarservice.towerdefense.model.request;

import com.slack.slackjarservice.common.base.BasePagination;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 排行榜分页查询请求
 *
 * @author zhn
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class LeaderboardPageQuery extends BasePagination {

    private Long mapId;

    private Long userId;
}
