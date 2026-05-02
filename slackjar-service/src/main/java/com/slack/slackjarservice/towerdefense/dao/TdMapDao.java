package com.slack.slackjarservice.towerdefense.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.slack.slackjarservice.towerdefense.entity.TdMap;
import org.apache.ibatis.annotations.Mapper;

/**
 * 塔防地图配置表(TdMap)表数据库访问层
 *
 * @author zhn
 */
@Mapper
public interface TdMapDao extends BaseMapper<TdMap> {

}
