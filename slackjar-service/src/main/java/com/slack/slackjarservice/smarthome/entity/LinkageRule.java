package com.slack.slackjarservice.smarthome.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.slack.slackjarservice.common.base.BaseModel;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("linkage_rule")
public class LinkageRule extends BaseModel {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String ruleName;

    private String ruleDescription;

    private Long triggerDeviceId;

    private String triggerCondition;

    private Long actionDeviceId;

    private String actionParams;

    private Integer status;

    private Integer priority;
}