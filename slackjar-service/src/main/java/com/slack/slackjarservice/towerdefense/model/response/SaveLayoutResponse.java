package com.slack.slackjarservice.towerdefense.model.response;

import lombok.Data;

/**
 * 保存布局响应
 *
 * @author zhn
 */
@Data
public class SaveLayoutResponse {

    private Boolean success;

    private String message;

    private Long layoutId;

    private String shareCode;
}
