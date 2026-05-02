package com.slack.slackjarservice.smarthome.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.slack.slackjarservice.smarthome.entity.ScheduleTask;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

@Mapper
@Repository("smartHomeScheduleTaskDao")
public interface ScheduleTaskDao extends BaseMapper<ScheduleTask> {
}