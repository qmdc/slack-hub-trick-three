package com.slack.slackjarservice.towerdefense.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.slack.slackjarservice.common.base.BaseModel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * 防御布局表(TdLayout)表实体类
 *
 * @author zhn
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@TableName("td_layout")
public class TdLayout extends BaseModel {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private Long mapId;

    private String name;

    private String layoutData;

    private String shareCode;

    private Integer downloadCount;

    private Integer isPublic;

    private Integer status;
}
