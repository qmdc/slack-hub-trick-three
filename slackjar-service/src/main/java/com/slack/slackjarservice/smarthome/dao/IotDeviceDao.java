package com.slack.slackjarservice.smarthome.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.slack.slackjarservice.smarthome.entity.IotDevice;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface IotDeviceDao extends BaseMapper<IotDevice> {
}