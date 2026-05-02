package com.slack.slackjarservice.towerdefense.controller;

import com.slack.slackjarservice.common.base.BaseController;
import com.slack.slackjarservice.common.response.ApiResponse;
import com.slack.slackjarservice.common.response.PageResult;
import com.slack.slackjarservice.towerdefense.model.request.LeaderboardPageQuery;
import com.slack.slackjarservice.towerdefense.model.response.LeaderboardItemResponse;
import com.slack.slackjarservice.towerdefense.service.LeaderboardService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

/**
 * 排行榜控制器
 *
 * @author zhn
 */
@RestController
@RequestMapping("/td/leaderboard")
public class LeaderboardController extends BaseController {

    @Resource
    private LeaderboardService leaderboardService;

    /**
     * 分页查询排行榜
     */
    @PostMapping("/pageQuery")
    public ApiResponse<PageResult<LeaderboardItemResponse>> pageQuery(@RequestBody LeaderboardPageQuery query) {
        return success(leaderboardService.getLeaderboard(query));
    }

    /**
     * 获取用户最好成绩
     */
    @GetMapping("/myBest")
    public ApiResponse<Integer> getMyBestWave(
            @RequestParam(required = false) Long mapId) {
        Long userId = getLoginUserId();
        return success(leaderboardService.getUserBestWave(userId, mapId));
    }
}
