package com.slack.slackjarservice.smarthome.service.impl;

import com.alibaba.csp.sentinel.util.StringUtil;
import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.slack.slackjarservice.smarthome.dao.LinkageRuleDao;
import com.slack.slackjarservice.smarthome.entity.IotDevice;
import com.slack.slackjarservice.smarthome.entity.LinkageRule;
import com.slack.slackjarservice.smarthome.service.IotDeviceService;
import com.slack.slackjarservice.smarthome.service.LinkageRuleService;
import jakarta.annotation.Resource;

import static cn.hutool.core.util.StrUtil.isNotBlank;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class LinkageRuleServiceImpl extends ServiceImpl<LinkageRuleDao, LinkageRule> implements LinkageRuleService {

    @Resource
    private IotDeviceService iotDeviceService;

    @Override
    public IPage<LinkageRule> pageQuery(IPage<LinkageRule> page, String ruleName, Integer status) {
        return baseMapper.selectPage(page, Wrappers.lambdaQuery(LinkageRule.class)
                .like(StringUtil.isNotBlank(ruleName), LinkageRule::getRuleName, ruleName)
                .eq(status != null, LinkageRule::getStatus, status));
    }

    @Override
    public void checkAndExecuteRule(Long deviceId) {
        List<LinkageRule> rules = baseMapper.selectList(Wrappers.lambdaQuery(LinkageRule.class)
                .eq(LinkageRule::getTriggerDeviceId, deviceId)
                .eq(LinkageRule::getStatus, 1)
                .orderByAsc(LinkageRule::getPriority));

        for (LinkageRule rule : rules) {
            if (checkCondition(rule, deviceId)) {
                executeAction(rule);
            }
        }
    }

    private boolean checkCondition(LinkageRule rule, Long deviceId) {
        IotDevice device = iotDeviceService.getById(deviceId);
        if (device == null) {
            return false;
        }

        JSONObject condition = JSON.parseObject(rule.getTriggerCondition());
        String conditionType = condition.getString("type");
        Integer targetValue = condition.getInteger("value");

        if ("power_status".equals(conditionType)) {
            return device.getPowerStatus() != null && device.getPowerStatus().equals(targetValue);
        } else if ("temperature".equals(conditionType)) {
            String operator = condition.getString("operator");
            Double temp = device.getTemperature() != null ? device.getTemperature().doubleValue() : 0;
            Double targetTemp = targetValue != null ? targetValue.doubleValue() : 0;
            return switch (operator) {
                case ">" -> temp > targetTemp;
                case "<" -> temp < targetTemp;
                case ">=" -> temp >= targetTemp;
                case "<=" -> temp <= targetTemp;
                case "==" -> temp.equals(targetTemp);
                default -> false;
            };
        } else if ("humidity".equals(conditionType)) {
            String operator = condition.getString("operator");
            Double humidity = device.getHumidity() != null ? device.getHumidity().doubleValue() : 0;
            Double targetHumidity = targetValue != null ? targetValue.doubleValue() : 0;
            return switch (operator) {
                case ">" -> humidity > targetHumidity;
                case "<" -> humidity < targetHumidity;
                default -> false;
            };
        }
        return false;
    }

    private void executeAction(LinkageRule rule) {
        JSONObject params = JSON.parseObject(rule.getActionParams());
        Integer powerStatus = params.getInteger("powerStatus");
        Integer brightness = params.getInteger("brightness");
        Double temperature = params.getDouble("temperature");
        iotDeviceService.controlDevice(rule.getActionDeviceId(), powerStatus, brightness, temperature);
        log.info("执行联动规则: ruleId={}, ruleName={}, actionDeviceId={}",
                rule.getId(), rule.getRuleName(), rule.getActionDeviceId());
    }
}