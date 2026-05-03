package com.slack.slackjarservice.typingtest.controller;

import com.slack.slackjarservice.common.base.BaseController;
import com.slack.slackjarservice.common.response.ApiResponse;
import com.slack.slackjarservice.typingtest.entity.TypingArticle;
import com.slack.slackjarservice.typingtest.entity.TypingTestRecord;
import com.slack.slackjarservice.typingtest.model.request.SaveTestRecordRequest;
import com.slack.slackjarservice.typingtest.model.response.TypingStatisticsResponse;
import com.slack.slackjarservice.typingtest.service.TypingArticleService;
import com.slack.slackjarservice.typingtest.service.TypingTestRecordService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/typing-test")
public class TypingTestController extends BaseController {

    @Resource
    private TypingArticleService typingArticleService;

    @Resource
    private TypingTestRecordService typingTestRecordService;

    @GetMapping("/article/random")
    public ApiResponse<TypingArticle> getRandomArticle(@RequestParam(required = false) Integer difficulty) {
        TypingArticle article;
        if (difficulty != null) {
            article = typingArticleService.getRandomArticleByDifficulty(difficulty);
        } else {
            article = typingArticleService.getRandomArticle();
        }
        return success(article);
    }

    @GetMapping("/article/{id}")
    public ApiResponse<TypingArticle> getArticleById(@PathVariable Long id) {
        return typingArticleService.getArticleById(id)
                .map(ApiResponse::success)
                .orElse(ApiResponse.error("文章不存在"));
    }

    @GetMapping("/articles")
    public ApiResponse<List<TypingArticle>> getAllArticles() {
        return success(typingArticleService.getAllEnabledArticles());
    }

    @GetMapping("/categories")
    public ApiResponse<List<String>> getAllCategories() {
        return success(typingArticleService.getAllCategories());
    }

    @PostMapping("/record")
    public ApiResponse<TypingTestRecord> saveRecord(@RequestBody SaveTestRecordRequest request) {
        Long userId = getLoginUserId();
        TypingTestRecord record = new TypingTestRecord();
        record.setUserId(userId);
        record.setArticleId(request.getArticleId());
        record.setArticleTitle(request.getArticleTitle());
        record.setWpm(request.getWpm());
        record.setAccuracy(request.getAccuracy());
        record.setTypedText(request.getTypedText());
        record.setCorrectChars(request.getCorrectChars());
        record.setTotalChars(request.getTotalChars());
        record.setTestDuration(request.getTestDuration());
        record.setStartTime(request.getStartTime());
        record.setEndTime(request.getEndTime());
        return success(typingTestRecordService.saveRecord(record));
    }

    @GetMapping("/records")
    public ApiResponse<List<TypingTestRecord>> getRecords() {
        Long userId = getLoginUserId();
        return success(typingTestRecordService.getRecordsByUserId(userId));
    }

    @GetMapping("/records/weekly")
    public ApiResponse<List<TypingTestRecord>> getWeeklyRecords() {
        Long userId = getLoginUserId();
        return success(typingTestRecordService.getWeeklyRecords(userId));
    }

    @GetMapping("/statistics")
    public ApiResponse<TypingStatisticsResponse> getStatistics() {
        Long userId = getLoginUserId();
        return success(typingTestRecordService.getStatistics(userId));
    }

    @GetMapping("/record/{id}")
    public ApiResponse<TypingTestRecord> getRecordById(@PathVariable Long id) {
        return success(typingTestRecordService.getRecordsByUserId(getLoginUserId()).stream()
                .filter(record -> record.getId().equals(id))
                .findFirst()
                .orElse(null));
    }

    @DeleteMapping("/record/{id}")
    public ApiResponse<Void> deleteRecord(@PathVariable Long id) {
        typingTestRecordService.deleteRecord(id);
        return success();
    }
}