package com.slack.slackjarservice.smarthome.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.slack.slackjarservice.common.base.BaseModel;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("alert_record")
public class AlertRecord extends BaseModel {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long deviceId;

    private Integer alertType;

    private Integer alertLevel;

    private String alertMessage;

    private Long alertTime;

    private Integer status;
}