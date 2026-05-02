package com.slack.slackjarservice.towerdefense.model.request;

import com.slack.slackjarservice.common.base.BasePagination;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 塔分页查询请求
 *
 * @author zhn
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class TdTowerPageQuery extends BasePagination {

    private String name;

    private Integer towerType;

    private Integer status;
}
