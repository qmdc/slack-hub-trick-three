package com.slack.slackjarservice.smarthome.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface EnergyService {

    Map<String, BigDecimal> getDailyEnergyConsumption(Long deviceId, Long date);

    Map<String, BigDecimal> getWeeklyEnergyConsumption(Long deviceId);

    Map<String, BigDecimal> getMonthlyEnergyConsumption(Long deviceId);

    List<Map<String, Object>> getEnergyAnalysis();

    List<Map<String, Object>> getEnergySavingSuggestions();
}