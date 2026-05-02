package com.slack.slackjarservice.towerdefense.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.slack.slackjarservice.towerdefense.entity.TdGameRecord;
import org.apache.ibatis.annotations.Mapper;

/**
 * 游戏记录表(TdGameRecord)表数据库访问层
 *
 * @author zhn
 */
@Mapper
public interface TdGameRecordDao extends BaseMapper<TdGameRecord> {

}
