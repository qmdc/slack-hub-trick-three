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
 * 塔防地图配置表(TdMap)表实体类
 *
 * @author zhn
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@TableName("td_map")
public class TdMap extends BaseModel {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private String description;

    private Integer mapWidth;

    private Integer mapHeight;

    private Integer tileSize;

    private String gridData;

    private String pathData;

    private Integer startGold;

    private Integer playerHp;

    private Integer totalWaves;

    private Integer status;
}
