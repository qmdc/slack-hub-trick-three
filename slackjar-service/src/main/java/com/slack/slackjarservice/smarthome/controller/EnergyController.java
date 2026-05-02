package com.slack.slackjarservice.smarthome.controller;

import com.slack.slackjarservice.common.base.BaseController;
import com.slack.slackjarservice.common.response.ApiResponse;
import com.slack.slackjarservice.smarthome.service.EnergyService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/smart-home/energy")
public class EnergyController extends BaseController {

    @Resource
    private EnergyService energyService;

    @GetMapping("/daily/{deviceId}")
    public ApiResponse<Map<String, BigDecimal>> getDailyEnergy(
            @PathVariable Long deviceId,
            @RequestParam(required = false) Long date) {
        Map<String, BigDecimal> result = energyService.getDailyEnergyConsumption(deviceId, date);
        return success(result);
    }

    @GetMapping("/weekly/{deviceId}")
    public ApiResponse<Map<String, BigDecimal>> getWeeklyEnergy(@PathVariable Long deviceId) {
        Map<String, BigDecimal> result = energyService.getWeeklyEnergyConsumption(deviceId);
        return success(result);
    }

    @GetMapping("/monthly/{deviceId}")
    public ApiResponse<Map<String, BigDecimal>> getMonthlyEnergy(@PathVariable Long deviceId) {
        Map<String, BigDecimal> result = energyService.getMonthlyEnergyConsumption(deviceId);
        return success(result);
    }

    @GetMapping("/analysis")
    public ApiResponse<List<Map<String, Object>>> getEnergyAnalysis() {
        List<Map<String, Object>> analysis = energyService.getEnergyAnalysis();
        return success(analysis);
    }

    @GetMapping("/suggestions")
    public ApiResponse<List<Map<String, Object>>> getEnergySuggestions() {
        List<Map<String, Object>> suggestions = energyService.getEnergySavingSuggestions();
        return success(suggestions);
    }
}