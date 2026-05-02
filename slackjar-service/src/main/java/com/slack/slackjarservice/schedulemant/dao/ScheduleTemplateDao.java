package com.slack.slackjarservice.schedulemant.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.slack.slackjarservice.schedulemant.entity.ScheduleTemplate;
import org.apache.ibatis.annotations.Mapper;

/**
 * 计划模板DAO
 *
 * @author zhn
 */
@Mapper
public interface ScheduleTemplateDao extends BaseMapper<ScheduleTemplate> {

}
