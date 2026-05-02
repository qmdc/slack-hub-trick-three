package com.slack.slackjarservice.schedulemant.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 计划模板保存请求
 *
 * @author zhn
 */
@Data
public class TemplateSaveRequest {

    private Long id;

    @NotBlank(message = "模板名称不能为空")
    private String name;

    @NotNull(message = "模板类型不能为空")
    private Integer templateType;

    private String templateData;

    private String description;

    private Integer isDefault;

    private Integer status;
}
