package com.slack.slackjarservice.towerdefense.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.slack.slackjarservice.towerdefense.entity.TdWaveEnemy;
import org.apache.ibatis.annotations.Mapper;

/**
 * 波次敌人配置表(TdWaveEnemy)表数据库访问层
 *
 * @author zhn
 */
@Mapper
public interface TdWaveEnemyDao extends BaseMapper<TdWaveEnemy> {

}
