package com.slack.slackjarservice.towerdefense.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.slack.slackjarservice.towerdefense.entity.TdWave;
import org.apache.ibatis.annotations.Mapper;

/**
 * 波次配置表(TdWave)表数据库访问层
 *
 * @author zhn
 */
@Mapper
public interface TdWaveDao extends BaseMapper<TdWave> {

}
