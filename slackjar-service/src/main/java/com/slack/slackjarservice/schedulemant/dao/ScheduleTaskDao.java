package com.slack.slackjarservice.schedulemant.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.slack.slackjarservice.schedulemant.entity.ScheduleTask;
import org.apache.ibatis.annotations.Mapper;

/**
 * 任务DAO
 *
 * @author zhn
 */
@Mapper
public interface ScheduleTaskDao extends BaseMapper<ScheduleTask> {

}
