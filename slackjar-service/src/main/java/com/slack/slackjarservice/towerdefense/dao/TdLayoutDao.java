package com.slack.slackjarservice.towerdefense.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.slack.slackjarservice.towerdefense.entity.TdLayout;
import org.apache.ibatis.annotations.Mapper;

/**
 * 防御布局表(TdLayout)表数据库访问层
 *
 * @author zhn
 */
@Mapper
public interface TdLayoutDao extends BaseMapper<TdLayout> {

}
