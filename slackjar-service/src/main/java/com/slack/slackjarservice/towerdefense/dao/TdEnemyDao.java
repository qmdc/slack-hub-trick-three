package com.slack.slackjarservice.towerdefense.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.slack.slackjarservice.towerdefense.entity.TdEnemy;
import org.apache.ibatis.annotations.Mapper;

/**
 * 敌人配置表(TdEnemy)表数据库访问层
 *
 * @author zhn
 */
@Mapper
public interface TdEnemyDao extends BaseMapper<TdEnemy> {

}
