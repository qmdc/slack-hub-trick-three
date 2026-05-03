package com.slack.slackjarservice.polls.controller;

import com.slack.slackjarservice.common.base.BaseController;
import com.slack.slackjarservice.common.response.ApiResponse;
import com.slack.slackjarservice.common.response.PageResult;
import com.slack.slackjarservice.polls.entity.PollSurvey;
import com.slack.slackjarservice.polls.model.request.PollPageQuery;
import com.slack.slackjarservice.polls.model.request.PollSaveRequest;
import com.slack.slackjarservice.polls.model.request.PollVoteRequest;
import com.slack.slackjarservice.polls.model.response.PollDetailResponse;
import com.slack.slackjarservice.polls.model.response.PollStatisticsResponse;
import com.slack.slackjarservice.polls.service.PollSurveyService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/polls")
@Validated
public class PollController extends BaseController {

    private final PollSurveyService pollSurveyService;

    public PollController(PollSurveyService pollSurveyService) {
        this.pollSurveyService = pollSurveyService;
    }

    @PostMapping("/save")
    public ApiResponse<PollDetailResponse> savePoll(@Valid @RequestBody PollSaveRequest request) {
        PollDetailResponse response = pollSurveyService.savePoll(request, getLoginUserId());
        return success(response);
    }

    @GetMapping("/detail/{id}")
    public ApiResponse<PollDetailResponse> getDetail(@PathVariable @NotNull Long id) {
        PollDetailResponse response = pollSurveyService.getByIdWithDetail(id);
        return success(response);
    }

    @GetMapping("/share/{shareCode}")
    public ApiResponse<PollDetailResponse> getByShareCode(@PathVariable @NotNull String shareCode) {
        PollDetailResponse response = pollSurveyService.getByShareCode(shareCode);
        return success(response);
    }

    @PostMapping("/pageQuery")
    public ApiResponse<PageResult<PollSurvey>> pageQuery(@RequestBody PollPageQuery query) {
        var page = pollSurveyService.pageQuery(query);
        PageResult<PollSurvey> result = PageResult.of(page.getRecords(), page.getTotal(), (int) page.getCurrent(), (int) page.getSize());
        return success(result);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable @NotNull Long id) {
        pollSurveyService.deleteById(id);
        return success();
    }

    @PutMapping("/{id}/status/{status}")
    public ApiResponse<Void> updateStatus(@PathVariable @NotNull Long id, @PathVariable @NotNull Integer status) {
        pollSurveyService.updateStatus(id, status);
        return success();
    }

    @PostMapping("/vote")
    public ApiResponse<Void> submitVote(@Valid @RequestBody PollVoteRequest request, HttpServletRequest httpRequest) {
        String ipAddress = getClientIp(httpRequest);
        pollSurveyService.submitVote(request, ipAddress);
        return success();
    }

    @GetMapping("/statistics/{id}")
    public ApiResponse<PollStatisticsResponse> getStatistics(@PathVariable @NotNull Long id) {
        PollStatisticsResponse response = pollSurveyService.getStatistics(id);
        return success(response);
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}