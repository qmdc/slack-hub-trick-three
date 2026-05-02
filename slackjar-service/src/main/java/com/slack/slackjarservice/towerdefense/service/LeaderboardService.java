package com.slack.slackjarservice.towerdefense.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.slack.slackjarservice.common.response.PageResult;
import com.slack.slackjarservice.towerdefense.entity.TdGameRecord;
import com.slack.slackjarservice.towerdefense.model.request.LeaderboardPageQuery;
import com.slack.slackjarservice.towerdefense.model.response.LeaderboardItemResponse;

/**
 * 排行榜服务接口
 *
 * @author zhn
 */
public interface LeaderboardService extends IService<TdGameRecord> {

    PageResult<LeaderboardItemResponse> getLeaderboard(LeaderboardPageQuery query);

    void recordGame(TdGameRecord record);

    Integer getUserBestWave(Long userId, Long mapId);
}
