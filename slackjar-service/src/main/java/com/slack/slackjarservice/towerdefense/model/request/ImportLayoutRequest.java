package com.slack.slackjarservice.towerdefense.model.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 导入布局请求
 *
 * @author zhn
 */
@Data
public class ImportLayoutRequest {

    @NotBlank(message = "分享码不能为空")
    private String shareCode;
}
