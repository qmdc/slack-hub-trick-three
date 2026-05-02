package com.slack.slackjarservice.towerdefense.service;

import com.slack.slackjarservice.common.response.PageResult;
import com.slack.slackjarservice.towerdefense.model.request.*;
import com.slack.slackjarservice.towerdefense.model.response.*;

/**
 * 游戏核心服务接口
 *
 * @author zhn
 */
public interface GameService {

    GameInitResponse initGame(GameInitRequest request, Long userId);

    PlaceTowerResponse placeTower(PlaceTowerRequest request, Long userId);

    UpgradeTowerResponse upgradeTower(UpgradeTowerRequest request, Long userId);

    SellTowerResponse sellTower(SellTowerRequest request, Long userId);

    StartWaveResponse startWave(StartWaveRequest request, Long userId);

    BattleSyncResponse syncBattle(BattleSyncRequest request, Long userId);

    void endGame(String gameSessionId, Integer gameStatus, Long userId);
}
