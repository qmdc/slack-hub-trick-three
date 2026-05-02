package com.slack.slackjarservice.schedulemant.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.slack.slackjarservice.schedulemant.entity.ScheduleTimeBlock;
import org.apache.ibatis.annotations.Mapper;

/**
 * 时间块DAO
 *
 * @author zhn
 */
@Mapper
public interface ScheduleTimeBlockDao extends BaseMapper<ScheduleTimeBlock> {

}
