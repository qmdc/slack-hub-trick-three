package com.slack.slackjarservice.smarthome.service.impl;

import com.slack.slackjarservice.smarthome.service.EnergyService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class EnergyServiceImpl implements EnergyService {

    @Override
    public Map<String, BigDecimal> getDailyEnergyConsumption(Long deviceId, Long date) {
        Map<String, BigDecimal> result = new HashMap<>();
        for (int i = 0; i < 24; i++) {
            result.put(String.format("%02d:00", i), BigDecimal.valueOf(Math.random() * 2));
        }
        return result;
    }

    @Override
    public Map<String, BigDecimal> getWeeklyEnergyConsumption(Long deviceId) {
        Map<String, BigDecimal> result = new HashMap<>();
        String[] days = {"周一", "周二", "周三", "周四", "周五", "周六", "周日"};
        for (String day : days) {
            result.put(day, BigDecimal.valueOf(Math.random() * 30));
        }
        return result;
    }

    @Override
    public Map<String, BigDecimal> getMonthlyEnergyConsumption(Long deviceId) {
        Map<String, BigDecimal> result = new HashMap<>();
        for (int i = 1; i <= 30; i++) {
            result.put(String.valueOf(i), BigDecimal.valueOf(Math.random() * 5));
        }
        return result;
    }

    @Override
    public List<Map<String, Object>> getEnergyAnalysis() {
        List<Map<String, Object>> analysis = new ArrayList<>();
        
        Map<String, Object> device1 = new HashMap<>();
        device1.put("deviceName", "客厅空调");
        device1.put("totalEnergy", BigDecimal.valueOf(45.6));
        device1.put("avgDaily", BigDecimal.valueOf(1.52));
        device1.put("trend", "up");
        analysis.add(device1);

        Map<String, Object> device2 = new HashMap<>();
        device2.put("deviceName", "卧室灯光");
        device2.put("totalEnergy", BigDecimal.valueOf(8.2));
        device2.put("avgDaily", BigDecimal.valueOf(0.27));
        device2.put("trend", "down");
        analysis.add(device2);

        Map<String, Object> device3 = new HashMap<>();
        device3.put("deviceName", "厨房电器");
        device3.put("totalEnergy", BigDecimal.valueOf(23.8));
        device3.put("avgDaily", BigDecimal.valueOf(0.79));
        device3.put("trend", "stable");
        analysis.add(device3);

        return analysis;
    }

    @Override
    public List<Map<String, Object>> getEnergySavingSuggestions() {
        List<Map<String, Object>> suggestions = new ArrayList<>();

        Map<String, Object> suggestion1 = new HashMap<>();
        suggestion1.put("id", 1);
        suggestion1.put("title", "空调温度优化");
        suggestion1.put("description", "当前空调平均温度为22°C，建议调整至26°C，预计可节省15%电量");
        suggestion1.put("type", "high");
        suggestion1.put("estimatedSavings", "15%");
        suggestions.add(suggestion1);

        Map<String, Object> suggestion2 = new HashMap<>();
        suggestion2.put("id", 2);
        suggestion1.put("title", "灯光定时关闭");
        suggestion2.put("description", "检测到卧室灯光夜间常亮，建议设置23:00自动关闭");
        suggestion2.put("type", "medium");
        suggestion2.put("estimatedSavings", "8%");
        suggestions.add(suggestion2);

        Map<String, Object> suggestion3 = new HashMap<>();
        suggestion3.put("id", 3);
        suggestion3.put("title", "插座智能断电");
        suggestion3.put("description", "电视待机功率较高，建议使用智能插座自动断电");
        suggestion3.put("type", "low");
        suggestion3.put("estimatedSavings", "5%");
        suggestions.add(suggestion3);

        return suggestions;
    }
}