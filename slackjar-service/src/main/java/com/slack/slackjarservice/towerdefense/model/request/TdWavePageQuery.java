package com.slack.slackjarservice.towerdefense.model.request;

import com.slack.slackjarservice.common.base.BasePagination;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 波次分页查询请求
 *
 * @author zhn
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class TdWavePageQuery extends BasePagination {

    private Long mapId;

    private Integer waveNumber;

    private Integer status;
}
