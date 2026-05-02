package com.slack.slackjarservice.smarthome.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.slack.slackjarservice.smarthome.dao.AlertRecordDao;
import com.slack.slackjarservice.smarthome.entity.AlertRecord;
import com.slack.slackjarservice.smarthome.service.AlertService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class AlertServiceImpl extends ServiceImpl<AlertRecordDao, AlertRecord> implements AlertService {

    @Override
    public IPage<AlertRecord> pageQuery(IPage<AlertRecord> page, Long deviceId, Integer alertType, Integer status) {
        return baseMapper.selectPage(page, Wrappers.lambdaQuery(AlertRecord.class)
                .eq(deviceId != null, AlertRecord::getDeviceId, deviceId)
                .eq(alertType != null, AlertRecord::getAlertType, alertType)
                .eq(status != null, AlertRecord::getStatus, status)
                .orderByDesc(AlertRecord::getAlertTime));
    }

    @Override
    public void createAlert(Long deviceId, Integer alertType, Integer alertLevel, String message) {
        AlertRecord alert = new AlertRecord();
        alert.setDeviceId(deviceId);
        alert.setAlertType(alertType);
        alert.setAlertLevel(alertLevel);
        alert.setAlertMessage(message);
        alert.setAlertTime(System.currentTimeMillis());
        alert.setStatus(0);
        save(alert);
        pushAlert(alert.getId());
    }

    @Override
    public void handleAlert(Long alertId, Integer status) {
        AlertRecord alert = getById(alertId);
        if (alert != null) {
            alert.setStatus(status);
            updateById(alert);
            log.info("处理告警: alertId={}, status={}", alertId, status);
        }
    }

    @Override
    public void pushAlert(Long alertId) {
        AlertRecord alert = getById(alertId);
        if (alert != null) {
            log.info("推送告警消息: deviceId={}, type={}, level={}, message={}",
                    alert.getDeviceId(), alert.getAlertType(), alert.getAlertLevel(), alert.getAlertMessage());
        }
    }
}