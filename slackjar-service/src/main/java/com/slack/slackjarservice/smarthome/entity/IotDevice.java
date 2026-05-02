package com.slack.slackjarservice.smarthome.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.slack.slackjarservice.common.base.BaseModel;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("iot_device")
public class IotDevice extends BaseModel {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String deviceName;

    private Integer deviceType;

    private String deviceCode;

    private Integer status;

    private Integer powerStatus;

    private Integer brightness;

    private BigDecimal temperature;

    private BigDecimal humidity;

    private String position;

    private Long roomId;
}