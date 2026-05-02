package com.slack.slackjarservice.towerdefense.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.slack.slackjarservice.towerdefense.entity.TdTower;
import org.apache.ibatis.annotations.Mapper;

/**
 * 塔配置表(TdTower)表数据库访问层
 *
 * @author zhn
 */
@Mapper
public interface TdTowerDao extends BaseMapper<TdTower> {

}
