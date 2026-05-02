package com.slack.slackjarservice.schedulemant.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.slack.slackjarservice.schedulemant.entity.PomodoroRecord;
import org.apache.ibatis.annotations.Mapper;

/**
 * 番茄钟记录DAO
 *
 * @author zhn
 */
@Mapper
public interface PomodoroRecordDao extends BaseMapper<PomodoroRecord> {

}
