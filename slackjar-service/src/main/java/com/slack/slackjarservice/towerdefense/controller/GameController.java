package com.slack.slackjarservice.towerdefense.controller;

import com.slack.slackjarservice.common.base.BaseController;
import com.slack.slackjarservice.common.response.ApiResponse;
import com.slack.slackjarservice.towerdefense.model.request.*;
import com.slack.slackjarservice.towerdefense.model.response.*;
import com.slack.slackjarservice.towerdefense.service.GameService;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

/**
 * 游戏核心控制器
 *
 * @author zhn
 */
@RestController
@RequestMapping("/td/game")
public class GameController extends BaseController {

    @Resource
    private GameService gameService;

    /**
     * 初始化游戏
     */
    @PostMapping("/init")
    public ApiResponse<GameInitResponse> initGame(@Valid @RequestBody GameInitRequest request) {
        Long userId = getLoginUserId();
        return success(gameService.initGame(request, userId));
    }

    /**
     * 放置塔
     */
    @PostMapping("/placeTower")
    public ApiResponse<PlaceTowerResponse> placeTower(@Valid @RequestBody PlaceTowerRequest request) {
        Long userId = getLoginUserId();
        return success(gameService.placeTower(request, userId));
    }

    /**
     * 升级塔
     */
    @PostMapping("/upgradeTower")
    public ApiResponse<UpgradeTowerResponse> upgradeTower(@Valid @RequestBody UpgradeTowerRequest request) {
        Long userId = getLoginUserId();
        return success(gameService.upgradeTower(request, userId));
    }

    /**
     * 出售塔
     */
    @PostMapping("/sellTower")
    public ApiResponse<SellTowerResponse> sellTower(@Valid @RequestBody SellTowerRequest request) {
        Long userId = getLoginUserId();
        return success(gameService.sellTower(request, userId));
    }

    /**
     * 开始波次
     */
    @PostMapping("/startWave")
    public ApiResponse<StartWaveResponse> startWave(@Valid @RequestBody StartWaveRequest request) {
        Long userId = getLoginUserId();
        return success(gameService.startWave(request, userId));
    }

    /**
     * 战斗同步（服务器验证）
     */
    @PostMapping("/syncBattle")
    public ApiResponse<BattleSyncResponse> syncBattle(@Valid @RequestBody BattleSyncRequest request) {
        Long userId = getLoginUserId();
        return success(gameService.syncBattle(request, userId));
    }

    /**
     * 结束游戏
     */
    @PostMapping("/endGame/{gameSessionId}/{gameStatus}")
    public ApiResponse<Void> endGame(
            @PathVariable String gameSessionId,
            @PathVariable Integer gameStatus) {
        Long userId = getLoginUserId();
        gameService.endGame(gameSessionId, gameStatus, userId);
        return success();
    }
}
