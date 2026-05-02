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
@TableName("energy_record")
public class EnergyRecord extends BaseModel {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long deviceId;

    private BigDecimal energyConsumed;

    private Long recordTime;
}