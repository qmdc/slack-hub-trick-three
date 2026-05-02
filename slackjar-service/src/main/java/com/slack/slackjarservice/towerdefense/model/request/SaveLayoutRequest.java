package com.slack.slackjarservice.towerdefense.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 保存布局请求
 *
 * @author zhn
 */
@Data
public class SaveLayoutRequest {

    @NotBlank(message = "布局名称不能为空")
    private String name;

    @NotNull(message = "地图ID不能为空")
    private Long mapId;

    @NotBlank(message = "布局数据不能为空")
    private String layoutData;

    private Integer isPublic;
}
