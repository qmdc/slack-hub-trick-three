package com.slack.slackjarservice.smarthome.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.slack.slackjarservice.common.base.BaseModel;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("scene_action")
public class SceneAction extends BaseModel {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long sceneId;

    private Integer actionType;

    private Long targetDeviceId;

    private String actionParams;

    private Integer actionDelay;

    private Integer actionOrder;
}