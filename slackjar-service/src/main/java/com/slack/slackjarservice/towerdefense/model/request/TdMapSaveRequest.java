package com.slack.slackjarservice.towerdefense.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 地图保存请求
 *
 * @author zhn
 */
@Data
public class TdMapSaveRequest {

    private Long id;

    @NotBlank(message = "地图名称不能为空")
    private String name;

    private String description;

    @NotNull(message = "地图宽度不能为空")
    private Integer mapWidth;

    @NotNull(message = "地图高度不能为空")
    private Integer mapHeight;

    @NotNull(message = "格子大小不能为空")
    private Integer tileSize;

    @NotBlank(message = "网格数据不能为空")
    private String gridData;

    @NotBlank(message = "路径数据不能为空")
    private String pathData;

    @NotNull(message = "初始金币不能为空")
    private Integer startGold;

    @NotNull(message = "玩家生命值不能为空")
    private Integer playerHp;

    @NotNull(message = "总波次不能为空")
    private Integer totalWaves;

    private Integer status;
}
