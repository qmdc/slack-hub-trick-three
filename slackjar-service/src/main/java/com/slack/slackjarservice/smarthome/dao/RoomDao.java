package com.slack.slackjarservice.smarthome.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.slack.slackjarservice.smarthome.entity.Room;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface RoomDao extends BaseMapper<Room> {
}