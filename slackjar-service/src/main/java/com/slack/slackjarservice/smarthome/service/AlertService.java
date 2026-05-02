package com.slack.slackjarservice.smarthome.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.slack.slackjarservice.smarthome.entity.AlertRecord;

public interface AlertService extends IService<AlertRecord> {

    IPage<AlertRecord> pageQuery(IPage<AlertRecord> page, Long deviceId, Integer alertType, Integer status);

    void createAlert(Long deviceId, Integer alertType, Integer alertLevel, String message);

    void handleAlert(Long alertId, Integer status);

    void pushAlert(Long alertId);
}