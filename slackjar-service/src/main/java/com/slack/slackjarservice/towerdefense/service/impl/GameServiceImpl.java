package com.slack.slackjarservice.towerdefense.service.impl;

import cn.hutool.core.util.IdUtil;
import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONArray;
import com.alibaba.fastjson2.JSONObject;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.slack.slackjarservice.common.enumtype.foundation.ResponseEnum;
import com.slack.slackjarservice.common.exception.BusinessException;
import com.slack.slackjarservice.common.util.AssertUtil;
import com.slack.slackjarservice.common.util.RedisUtil;
import com.slack.slackjarservice.towerdefense.dao.TdWaveEnemyDao;
import com.slack.slackjarservice.towerdefense.entity.*;
import com.slack.slackjarservice.towerdefense.model.request.*;
import com.slack.slackjarservice.towerdefense.model.response.*;
import com.slack.slackjarservice.towerdefense.service.*;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * 游戏核心服务实现类
 *
 * @author zhn
 */
@Slf4j
@Service("gameService")
public class GameServiceImpl implements GameService {

    @Resource
    private TdMapService tdMapService;

    @Resource
    private TdTowerService tdTowerService;

    @Resource
    private TdEnemyService tdEnemyService;

    @Resource
    private TdWaveService tdWaveService;

    @Resource
    private TdWaveEnemyDao tdWaveEnemyDao;

    @Resource
    private LeaderboardService leaderboardService;

    @Resource
    private LayoutService layoutService;

    @Resource
    private RedisUtil redisUtil;

    private static final String GAME_SESSION_PREFIX = "td:game:session:";
    private static final String TOWER_INSTANCE_PREFIX = "td:tower:instance:";
    private static final String ENEMY_INSTANCE_PREFIX = "td:enemy:instance:";
    private static final int GAME_SESSION_EXPIRE = 3600;

    @Override
    public GameInitResponse initGame(GameInitRequest request, Long userId) {
        TdMap map = tdMapService.getMapDetail(request.getMapId());
        AssertUtil.notNull(map, ResponseEnum.DATA_NOT_EXISTS);

        String sessionId = IdUtil.simpleUUID();

        List<TdTower> towers = tdTowerService.getAvailableTowers(0);
        List<TdWave> waves = tdWaveService.getWavesByMapId(map.getId());

        GameInitResponse response = new GameInitResponse();
        response.setGameSessionId(sessionId);
        response.setMapId(map.getId());
        response.setMapName(map.getName());
        response.setMapWidth(map.getMapWidth());
        response.setMapHeight(map.getMapHeight());
        response.setTileSize(map.getTileSize());
        response.setGridData(map.getGridData());
        response.setStartGold(map.getStartGold());
        response.setPlayerHp(map.getPlayerHp());
        response.setTotalWaves(map.getTotalWaves());

        JSONArray pathJson = JSON.parseArray(map.getPathData());
        List<GameInitResponse.PathPoint> pathPoints = new ArrayList<>();
        if (pathJson != null) {
            for (int i = 0; i < pathJson.size(); i++) {
                JSONObject point = pathJson.getJSONObject(i);
                GameInitResponse.PathPoint pp = new GameInitResponse.PathPoint();
                pp.setX(point.getInteger("x"));
                pp.setY(point.getInteger("y"));
                pathPoints.add(pp);
            }
        }
        response.setPathData(pathPoints);

        List<GameInitResponse.TowerInfo> towerInfos = towers.stream().map(t -> {
            GameInitResponse.TowerInfo info = new GameInitResponse.TowerInfo();
            info.setId(t.getId());
            info.setName(t.getName());
            info.setTowerType(t.getTowerType());
            info.setDescription(t.getDescription());
            info.setBaseCost(t.getBaseCost());
            info.setBaseDamage(t.getBaseDamage());
            info.setBaseAttackSpeed(t.getBaseAttackSpeed());
            info.setBaseRange(t.getBaseRange());
            info.setUpgradeCost(t.getUpgradeCost());
            info.setIcon(t.getIcon());
            info.setColor(t.getColor());
            info.setSpecialEffect(t.getSpecialEffect());
            info.setUnlockWave(t.getUnlockWave());
            return info;
        }).toList();
        response.setAvailableTowers(towerInfos);

        List<GameInitResponse.WaveInfo> waveInfos = waves.stream().map(w -> {
            GameInitResponse.WaveInfo info = new GameInitResponse.WaveInfo();
            info.setId(w.getId());
            info.setWaveNumber(w.getWaveNumber());
            info.setName(w.getName());
            info.setTotalEnemies(w.getTotalEnemies());
            info.setSpawnInterval(w.getSpawnInterval());
            info.setDifficultyMultiplier(w.getDifficultyMultiplier());
            info.setBonusGold(w.getBonusGold());

            List<TdWaveEnemy> waveEnemies = tdWaveEnemyDao.selectList(
                    new LambdaQueryWrapper<TdWaveEnemy>()
                            .eq(TdWaveEnemy::getWaveId, w.getId())
                            .orderByAsc(TdWaveEnemy::getSpawnOrder)
            );

            List<GameInitResponse.WaveEnemyInfo> enemyInfos = waveEnemies.stream().map(we -> {
                TdEnemy enemy = tdEnemyService.getById(we.getEnemyId());
                GameInitResponse.WaveEnemyInfo ei = new GameInitResponse.WaveEnemyInfo();
                ei.setEnemyId(we.getEnemyId());
                ei.setEnemyName(enemy != null ? enemy.getName() : "");
                ei.setEnemyType(enemy != null ? enemy.getEnemyType() : 0);
                ei.setCount(we.getCount());
                ei.setHpMultiplier(we.getHpMultiplier());
                ei.setSpeedMultiplier(we.getSpeedMultiplier());
                ei.setSpawnOrder(we.getSpawnOrder());
                return ei;
            }).toList();
            info.setEnemies(enemyInfos);

            return info;
        }).toList();
        response.setWaveInfos(waveInfos);

        JSONObject sessionData = new JSONObject();
        sessionData.put("sessionId", sessionId);
        sessionData.put("userId", userId);
        sessionData.put("mapId", map.getId());
        sessionData.put("currentWave", 0);
        sessionData.put("currentGold", map.getStartGold());
        sessionData.put("currentHp", map.getPlayerHp());
        sessionData.put("maxHp", map.getPlayerHp());
        sessionData.put("gameStatus", 1);
        sessionData.put("startTime", System.currentTimeMillis());
        sessionData.put("totalGoldEarned", 0);
        sessionData.put("totalDamageDealt", 0);
        sessionData.put("enemiesKilled", 0);
        sessionData.put("towersBuilt", 0);

        redisUtil.set(GAME_SESSION_PREFIX + sessionId, sessionData.toJSONString(), GAME_SESSION_EXPIRE);

        if (request.getLayoutId() != null) {
            TdLayout layout = layoutService.getById(request.getLayoutId());
            if (layout != null) {
                applyLayoutToSession(sessionId, layout.getLayoutData(), map.getStartGold());
            }
        } else if (request.getShareCode() != null && !request.getShareCode().isEmpty()) {
            List<TdLayout> layouts = layoutService.list(
                    new LambdaQueryWrapper<TdLayout>()
                            .eq(TdLayout::getShareCode, request.getShareCode())
                            .eq(TdLayout::getIsPublic, 1)
            );
            if (!CollectionUtils.isEmpty(layouts)) {
                applyLayoutToSession(sessionId, layouts.get(0).getLayoutData(), map.getStartGold());
            }
        }

        return response;
    }

    private void applyLayoutToSession(String sessionId, String layoutData, int startGold) {
        try {
            JSONArray towers = JSON.parseArray(layoutData);
            if (towers != null) {
                int totalCost = 0;
                for (int i = 0; i < towers.size(); i++) {
                    JSONObject tower = towers.getJSONObject(i);
                    Long towerId = tower.getLong("towerId");
                    Integer level = tower.getInteger("level");
                    if (level == null) level = 1;

                    TdTower towerConfig = tdTowerService.getById(towerId);
                    if (towerConfig != null) {
                        int cost = towerConfig.getBaseCost();
                        for (int l = 2; l <= level; l++) {
                            cost += (int) (towerConfig.getUpgradeCost() * Math.pow(1.2, l - 2));
                        }
                        totalCost += cost;
                    }
                }

                if (totalCost <= startGold) {
                    for (int i = 0; i < towers.size(); i++) {
                        JSONObject tower = towers.getJSONObject(i);
                        String instanceId = IdUtil.simpleUUID();
                        JSONObject towerInstance = new JSONObject();
                        towerInstance.put("instanceId", instanceId);
                        towerInstance.put("towerId", tower.getLong("towerId"));
                        towerInstance.put("level", tower.getInteger("level") == null ? 1 : tower.getInteger("level"));
                        towerInstance.put("gridX", tower.getInteger("gridX"));
                        towerInstance.put("gridY", tower.getInteger("gridY"));
                        towerInstance.put("lastAttackTime", 0L);

                        redisUtil.set(TOWER_INSTANCE_PREFIX + sessionId + ":" + instanceId,
                                towerInstance.toJSONString(), GAME_SESSION_EXPIRE);
                    }

                    String sessionKey = GAME_SESSION_PREFIX + sessionId;
                    String sessionStr = (String) redisUtil.get(sessionKey);
                    if (sessionStr != null) {
                        JSONObject sessionData = JSON.parseObject(sessionStr);
                        sessionData.put("currentGold", startGold - totalCost);
                        redisUtil.set(sessionKey, sessionData.toJSONString(), GAME_SESSION_EXPIRE);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("应用布局失败: {}", e.getMessage());
        }
    }

    @Override
    public PlaceTowerResponse placeTower(PlaceTowerRequest request, Long userId) {
        PlaceTowerResponse response = new PlaceTowerResponse();

        String sessionKey = GAME_SESSION_PREFIX + request.getGameSessionId();
        String sessionStr = (String) redisUtil.get(sessionKey);
        if (sessionStr == null) {
            response.setSuccess(false);
            response.setMessage("游戏会话不存在或已过期");
            return response;
        }

        JSONObject sessionData = JSON.parseObject(sessionStr);
        Long sessionUserId = sessionData.getLong("userId");
        if (!Objects.equals(sessionUserId, userId)) {
            response.setSuccess(false);
            response.setMessage("无权操作此游戏会话");
            return response;
        }

        int gameStatus = sessionData.getIntValue("gameStatus");
        if (gameStatus != 1 && gameStatus != 6) {
            response.setSuccess(false);
            response.setMessage("只能在准备阶段或波次完成时放置塔");
            return response;
        }

        TdTower tower = tdTowerService.getById(request.getTowerId());
        if (tower == null) {
            response.setSuccess(false);
            response.setMessage("塔类型不存在");
            return response;
        }

        int currentGold = sessionData.getIntValue("currentGold");
        if (currentGold < tower.getBaseCost()) {
            response.setSuccess(false);
            response.setMessage("金币不足");
            return response;
        }

        if (!isValidPlacement(request.getGameSessionId(), request.getGridX(), request.getGridY())) {
            response.setSuccess(false);
            response.setMessage("该位置无法放置塔");
            return response;
        }

        String instanceId = IdUtil.simpleUUID();
        JSONObject towerInstance = new JSONObject();
        towerInstance.put("instanceId", instanceId);
        towerInstance.put("towerId", tower.getId());
        towerInstance.put("level", 1);
        towerInstance.put("gridX", request.getGridX());
        towerInstance.put("gridY", request.getGridY());
        towerInstance.put("lastAttackTime", 0L);

        redisUtil.set(TOWER_INSTANCE_PREFIX + request.getGameSessionId() + ":" + instanceId,
                towerInstance.toJSONString(), GAME_SESSION_EXPIRE);

        sessionData.put("currentGold", currentGold - tower.getBaseCost());
        sessionData.put("towersBuilt", sessionData.getIntValue("towersBuilt") + 1);
        redisUtil.set(sessionKey, sessionData.toJSONString(), GAME_SESSION_EXPIRE);

        response.setSuccess(true);
        response.setMessage("放置成功");
        response.setTowerInstanceId(instanceId);
        response.setTowerId(tower.getId());
        response.setGridX(request.getGridX());
        response.setGridY(request.getGridY());
        response.setRemainingGold(currentGold - tower.getBaseCost());
        response.setTowerLevel(1);

        return response;
    }

    private boolean isValidPlacement(String sessionId, int gridX, int gridY) {
        String sessionKey = GAME_SESSION_PREFIX + sessionId;
        String sessionStr = (String) redisUtil.get(sessionKey);
        if (sessionStr == null) {
            return false;
        }

        JSONObject sessionData = JSON.parseObject(sessionStr);
        Long mapId = sessionData.getLong("mapId");
        TdMap map = tdMapService.getById(mapId);
        if (map == null) {
            return false;
        }

        try {
            JSONArray grid = JSON.parseArray(map.getGridData());
            if (gridX < 0 || gridX >= map.getMapWidth() || gridY < 0 || gridY >= map.getMapHeight()) {
                return false;
            }

            int cellType = grid.getIntValue(gridY * map.getMapWidth() + gridX);
            if (cellType != 0) {
                return false;
            }

            Set<String> towerKeys = redisUtil.scan(TOWER_INSTANCE_PREFIX + sessionId + ":*");
            for (String key : towerKeys) {
                String towerStr = (String) redisUtil.get(key);
                if (towerStr != null) {
                    JSONObject tower = JSON.parseObject(towerStr);
                    if (tower.getIntValue("gridX") == gridX && tower.getIntValue("gridY") == gridY) {
                        return false;
                    }
                }
            }

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public UpgradeTowerResponse upgradeTower(UpgradeTowerRequest request, Long userId) {
        UpgradeTowerResponse response = new UpgradeTowerResponse();

        String sessionKey = GAME_SESSION_PREFIX + request.getGameSessionId();
        String sessionStr = (String) redisUtil.get(sessionKey);
        if (sessionStr == null) {
            response.setSuccess(false);
            response.setMessage("游戏会话不存在或已过期");
            return response;
        }

        JSONObject sessionData = JSON.parseObject(sessionStr);
        Long sessionUserId = sessionData.getLong("userId");
        if (!Objects.equals(sessionUserId, userId)) {
            response.setSuccess(false);
            response.setMessage("无权操作此游戏会话");
            return response;
        }

        String towerKey = TOWER_INSTANCE_PREFIX + request.getGameSessionId() + ":" + request.getTowerInstanceId();
        String towerStr = (String) redisUtil.get(towerKey);
        if (towerStr == null) {
            response.setSuccess(false);
            response.setMessage("塔实例不存在");
            return response;
        }

        JSONObject towerInstance = JSON.parseObject(towerStr);
        int currentLevel = towerInstance.getIntValue("level");

        if (request.getTargetLevel() <= currentLevel) {
            response.setSuccess(false);
            response.setMessage("目标等级必须高于当前等级");
            return response;
        }

        TdTower tower = tdTowerService.getById(towerInstance.getLong("towerId"));
        if (tower == null) {
            response.setSuccess(false);
            response.setMessage("塔配置不存在");
            return response;
        }

        int totalUpgradeCost = 0;
        for (int l = currentLevel + 1; l <= request.getTargetLevel(); l++) {
            totalUpgradeCost += (int) (tower.getUpgradeCost() * Math.pow(1.2, l - 2));
        }

        int currentGold = sessionData.getIntValue("currentGold");
        if (currentGold < totalUpgradeCost) {
            response.setSuccess(false);
            response.setMessage("金币不足，需要 " + totalUpgradeCost + " 金币");
            return response;
        }

        towerInstance.put("level", request.getTargetLevel());
        redisUtil.set(towerKey, towerInstance.toJSONString(), GAME_SESSION_EXPIRE);

        sessionData.put("currentGold", currentGold - totalUpgradeCost);
        redisUtil.set(sessionKey, sessionData.toJSONString(), GAME_SESSION_EXPIRE);

        double damageMultiplier = Math.pow(tower.getDamageUpgradeRate() != null ? tower.getDamageUpgradeRate() : 1.3, request.getTargetLevel() - 1);
        double speedMultiplier = Math.pow(tower.getAttackSpeedUpgradeRate() != null ? tower.getAttackSpeedUpgradeRate() : 1.1, request.getTargetLevel() - 1);
        int rangeBonus = (request.getTargetLevel() - 1) * (tower.getRangeUpgrade() != null ? tower.getRangeUpgrade() : 1);

        response.setSuccess(true);
        response.setMessage("升级成功");
        response.setTowerInstanceId(request.getTowerInstanceId());
        response.setNewLevel(request.getTargetLevel());
        response.setRemainingGold(currentGold - totalUpgradeCost);
        response.setUpgradedDamage((int) (tower.getBaseDamage() * damageMultiplier));
        response.setUpgradedAttackSpeed(tower.getBaseAttackSpeed() * speedMultiplier);
        response.setUpgradedRange(tower.getBaseRange() + rangeBonus);

        return response;
    }

    @Override
    public SellTowerResponse sellTower(SellTowerRequest request, Long userId) {
        SellTowerResponse response = new SellTowerResponse();

        String sessionKey = GAME_SESSION_PREFIX + request.getGameSessionId();
        String sessionStr = (String) redisUtil.get(sessionKey);
        if (sessionStr == null) {
            response.setSuccess(false);
            response.setMessage("游戏会话不存在或已过期");
            return response;
        }

        JSONObject sessionData = JSON.parseObject(sessionStr);
        Long sessionUserId = sessionData.getLong("userId");
        if (!Objects.equals(sessionUserId, userId)) {
            response.setSuccess(false);
            response.setMessage("无权操作此游戏会话");
            return response;
        }

        String towerKey = TOWER_INSTANCE_PREFIX + request.getGameSessionId() + ":" + request.getTowerInstanceId();
        String towerStr = (String) redisUtil.get(towerKey);
        if (towerStr == null) {
            response.setSuccess(false);
            response.setMessage("塔实例不存在");
            return response;
        }

        JSONObject towerInstance = JSON.parseObject(towerStr);
        TdTower tower = tdTowerService.getById(towerInstance.getLong("towerId"));
        if (tower == null) {
            response.setSuccess(false);
            response.setMessage("塔配置不存在");
            return response;
        }

        int level = towerInstance.getIntValue("level");
        int totalCost = tower.getBaseCost();
        for (int l = 2; l <= level; l++) {
            totalCost += (int) (tower.getUpgradeCost() * Math.pow(1.2, l - 2));
        }
        int refund = (int) (totalCost * 0.7);

        redisUtil.delete(towerKey);

        int currentGold = sessionData.getIntValue("currentGold");
        sessionData.put("currentGold", currentGold + refund);
        redisUtil.set(sessionKey, sessionData.toJSONString(), GAME_SESSION_EXPIRE);

        response.setSuccess(true);
        response.setMessage("出售成功");
        response.setRefundGold(refund);
        response.setRemainingGold(currentGold + refund);

        return response;
    }

    @Override
    public StartWaveResponse startWave(StartWaveRequest request, Long userId) {
        StartWaveResponse response = new StartWaveResponse();

        String sessionKey = GAME_SESSION_PREFIX + request.getGameSessionId();
        String sessionStr = (String) redisUtil.get(sessionKey);
        if (sessionStr == null) {
            response.setSuccess(false);
            response.setMessage("游戏会话不存在或已过期");
            return response;
        }

        JSONObject sessionData = JSON.parseObject(sessionStr);
        Long sessionUserId = sessionData.getLong("userId");
        if (!Objects.equals(sessionUserId, userId)) {
            response.setSuccess(false);
            response.setMessage("无权操作此游戏会话");
            return response;
        }

        int currentWave = sessionData.getIntValue("currentWave");
        if (request.getWaveNumber() != currentWave + 1) {
            response.setSuccess(false);
            response.setMessage("波次序号不正确");
            return response;
        }

        Long mapId = sessionData.getLong("mapId");
        List<TdWave> waves = tdWaveService.getWavesByMapId(mapId);
        TdWave targetWave = waves.stream()
                .filter(w -> w.getWaveNumber().equals(request.getWaveNumber()))
                .findFirst()
                .orElse(null);

        if (targetWave == null) {
            response.setSuccess(false);
            response.setMessage("波次配置不存在");
            return response;
        }

        List<TdWaveEnemy> waveEnemies = tdWaveEnemyDao.selectList(
                new LambdaQueryWrapper<TdWaveEnemy>()
                        .eq(TdWaveEnemy::getWaveId, targetWave.getId())
                        .orderByAsc(TdWaveEnemy::getSpawnOrder)
        );

        List<StartWaveResponse.EnemySpawnInfo> spawnInfos = new ArrayList<>();
        int spawnOrder = 0;
        for (TdWaveEnemy we : waveEnemies) {
            TdEnemy enemy = tdEnemyService.getById(we.getEnemyId());
            if (enemy != null) {
                for (int i = 0; i < we.getCount(); i++) {
                    String instanceId = IdUtil.simpleUUID();
                    StartWaveResponse.EnemySpawnInfo info = new StartWaveResponse.EnemySpawnInfo();
                    info.setInstanceId(instanceId);
                    info.setEnemyId(we.getEnemyId());
                    info.setSpawnOrder(spawnOrder++);

                    Double hpMult = we.getHpMultiplier() != null ? we.getHpMultiplier() : 1.0;
                    Double waveMult = targetWave.getDifficultyMultiplier() != null ? targetWave.getDifficultyMultiplier() : 1.0;
                    info.setMaxHp((int) (enemy.getBaseHp() * hpMult * waveMult));

                    Double speedMult = we.getSpeedMultiplier() != null ? we.getSpeedMultiplier() : 1.0;
                    info.setBaseSpeed((int) (enemy.getBaseSpeed() * speedMult * enemy.getSpeedMultiplier()));

                    spawnInfos.add(info);

                    JSONObject enemyInstance = new JSONObject();
                    enemyInstance.put("instanceId", instanceId);
                    enemyInstance.put("enemyId", we.getEnemyId());
                    enemyInstance.put("maxHp", info.getMaxHp());
                    enemyInstance.put("currentHp", info.getMaxHp());
                    enemyInstance.put("baseSpeed", enemy.getBaseSpeed());
                    enemyInstance.put("speedMultiplier", enemy.getSpeedMultiplier() * (we.getSpeedMultiplier() != null ? we.getSpeedMultiplier() : 1.0));
                    enemyInstance.put("reward", enemy.getReward());
                    enemyInstance.put("armor", enemy.getArmor());
                    enemyInstance.put("magicResistance", enemy.getMagicResistance());
                    enemyInstance.put("specialAbility", enemy.getSpecialAbility());
                    enemyInstance.put("pathIndex", 0L);
                    enemyInstance.put("positionX", -1);
                    enemyInstance.put("positionY", -1);
                    enemyInstance.put("isAlive", true);
                    enemyInstance.put("slowEffect", 1.0);
                    enemyInstance.put("isFrozen", false);
                    enemyInstance.put("spawnOrder", info.getSpawnOrder());
                    enemyInstance.put("spawned", false);

                    redisUtil.set(ENEMY_INSTANCE_PREFIX + request.getGameSessionId() + ":" + instanceId,
                            enemyInstance.toJSONString(), GAME_SESSION_EXPIRE);
                }
            }
        }

        sessionData.put("currentWave", request.getWaveNumber());
        sessionData.put("gameStatus", 2);
        sessionData.put("waveStartTime", System.currentTimeMillis());
        sessionData.put("totalEnemiesThisWave", spawnInfos.size());
        sessionData.put("enemiesSpawned", 0);
        sessionData.put("enemiesKilledThisWave", 0);
        redisUtil.set(sessionKey, sessionData.toJSONString(), GAME_SESSION_EXPIRE);

        response.setSuccess(true);
        response.setMessage("波次开始");
        response.setWaveNumber(request.getWaveNumber());
        response.setSpawnInterval(targetWave.getSpawnInterval());
        response.setSpawnOrder(spawnInfos);

        return response;
    }

    @Override
    public BattleSyncResponse syncBattle(BattleSyncRequest request, Long userId) {
        BattleSyncResponse response = new BattleSyncResponse();

        String sessionKey = GAME_SESSION_PREFIX + request.getGameSessionId();
        String sessionStr = (String) redisUtil.get(sessionKey);
        if (sessionStr == null) {
            response.setIsValid(false);
            response.setValidationMessage("游戏会话不存在或已过期");
            return response;
        }

        JSONObject sessionData = JSON.parseObject(sessionStr);
        Long sessionUserId = sessionData.getLong("userId");
        if (!Objects.equals(sessionUserId, userId)) {
            response.setIsValid(false);
            response.setValidationMessage("无权操作此游戏会话");
            return response;
        }

        int gameStatus = sessionData.getIntValue("gameStatus");
        response.setGameStatus(gameStatus);
        response.setCurrentWave(sessionData.getIntValue("currentWave"));

        int serverGold = sessionData.getIntValue("currentGold");
        int serverHp = sessionData.getIntValue("currentHp");
        response.setServerGold(serverGold);
        response.setServerHp(serverHp);

        boolean isValid = true;
        List<String> validationErrors = new ArrayList<>();
        List<BattleSyncResponse.ServerEvent> serverEvents = new ArrayList<>();

        if (request.getCurrentGold() != null && request.getCurrentGold() != serverGold) {
            isValid = false;
            validationErrors.add("客户端金币与服务器不一致");
        }
        if (request.getCurrentHp() != null && request.getCurrentHp() != serverHp) {
            isValid = false;
            validationErrors.add("客户端生命值与服务器不一致");
        }

        List<BattleSyncResponse.EnemyState> enemyStates = new ArrayList<>();
        Set<String> enemyKeys = redisUtil.scan(ENEMY_INSTANCE_PREFIX + request.getGameSessionId() + ":*");
        for (String key : enemyKeys) {
            String enemyStr = (String) redisUtil.get(key);
            if (enemyStr != null) {
                JSONObject enemy = JSON.parseObject(enemyStr);
                BattleSyncResponse.EnemyState state = new BattleSyncResponse.EnemyState();
                state.setInstanceId(enemy.getString("instanceId"));
                state.setEnemyId(enemy.getLong("enemyId"));
                state.setCurrentHp(enemy.getIntValue("currentHp"));
                state.setMaxHp(enemy.getIntValue("maxHp"));
                state.setPositionX(enemy.getDouble("positionX"));
                state.setPositionY(enemy.getDouble("positionY"));
                state.setPathIndex(enemy.getLong("pathIndex"));
                state.setIsAlive(enemy.getBooleanValue("isAlive"));
                state.setSlowEffect(enemy.getDouble("slowEffect"));
                state.setIsFrozen(enemy.getBooleanValue("isFrozen"));
                enemyStates.add(state);
            }
        }
        response.setEnemyStates(enemyStates);

        List<BattleSyncResponse.TowerState> towerStates = new ArrayList<>();
        Set<String> towerKeys = redisUtil.scan(TOWER_INSTANCE_PREFIX + request.getGameSessionId() + ":*");
        for (String key : towerKeys) {
            String towerStr = (String) redisUtil.get(key);
            if (towerStr != null) {
                JSONObject tower = JSON.parseObject(towerStr);
                BattleSyncResponse.TowerState state = new BattleSyncResponse.TowerState();
                state.setInstanceId(tower.getString("instanceId"));
                state.setTowerId(tower.getLong("towerId"));
                state.setLevel(tower.getIntValue("level"));
                state.setGridX(tower.getIntValue("gridX"));
                state.setGridY(tower.getIntValue("gridY"));
                state.setLastAttackTime(tower.getLong("lastAttackTime"));
                towerStates.add(state);
            }
        }
        response.setTowerStates(towerStates);

        if (request.getEnemyDamages() != null) {
            for (BattleSyncRequest.EnemyDamageRecord damage : request.getEnemyDamages()) {
                String enemyKey = ENEMY_INSTANCE_PREFIX + request.getGameSessionId() + ":" + damage.getEnemyInstanceId();
                String enemyStr = (String) redisUtil.get(enemyKey);
                if (enemyStr != null) {
                    JSONObject enemy = JSON.parseObject(enemyStr);
                    if (enemy.getBooleanValue("isAlive")) {
                        int currentHp = enemy.getIntValue("currentHp");
                        int newHp = currentHp - damage.getDamage();

                        if (damage.getSourceTowerId() != null) {
                            sessionData.put("totalDamageDealt",
                                    sessionData.getIntValue("totalDamageDealt") + damage.getDamage());
                        }

                        if (newHp <= 0) {
                            enemy.put("isAlive", false);
                            enemy.put("currentHp", 0);

                            int reward = enemy.getIntValue("reward");
                            serverGold += reward;
                            sessionData.put("currentGold", serverGold);
                            sessionData.put("totalGoldEarned",
                                    sessionData.getIntValue("totalGoldEarned") + reward);
                            sessionData.put("enemiesKilled",
                                    sessionData.getIntValue("enemiesKilled") + 1);
                            sessionData.put("enemiesKilledThisWave",
                                    sessionData.getIntValue("enemiesKilledThisWave") + 1);

                            BattleSyncResponse.ServerEvent event = new BattleSyncResponse.ServerEvent();
                            event.setEventType("ENEMY_KILLED");
                            event.setTimestamp(System.currentTimeMillis());
                            event.setTargetId(damage.getEnemyInstanceId());
                            event.setAmount(reward);
                            event.setMessage("敌人被击杀，获得 " + reward + " 金币");
                            serverEvents.add(event);
                        } else {
                            enemy.put("currentHp", newHp);
                        }

                        redisUtil.set(enemyKey, enemy.toJSONString(), GAME_SESSION_EXPIRE);
                    }
                }
            }
        }

        int totalEnemiesThisWave = sessionData.getIntValue("totalEnemiesThisWave");
        int enemiesKilledThisWave = sessionData.getIntValue("enemiesKilledThisWave");

        if (gameStatus == 2 && totalEnemiesThisWave > 0 && enemiesKilledThisWave >= totalEnemiesThisWave) {
            Long mapId = sessionData.getLong("mapId");
            TdMap map = tdMapService.getById(mapId);

            int currentWave = sessionData.getIntValue("currentWave");
            List<TdWave> waves = tdWaveService.getWavesByMapId(mapId);
            TdWave currentWaveConfig = waves.stream()
                    .filter(w -> w.getWaveNumber().equals(currentWave))
                    .findFirst()
                    .orElse(null);

            if (currentWaveConfig != null && currentWaveConfig.getBonusGold() != null) {
                serverGold += currentWaveConfig.getBonusGold();
                sessionData.put("currentGold", serverGold);
                sessionData.put("totalGoldEarned",
                        sessionData.getIntValue("totalGoldEarned") + currentWaveConfig.getBonusGold());
            }

            if (currentWave >= map.getTotalWaves()) {
                gameStatus = 4;
                sessionData.put("gameStatus", gameStatus);

                TdGameRecord record = new TdGameRecord();
                record.setUserId(userId);
                record.setMapId(mapId);
                record.setMaxWaveReached(currentWave);
                record.setTotalGoldEarned(sessionData.getIntValue("totalGoldEarned"));
                record.setTotalDamageDealt(sessionData.getIntValue("totalDamageDealt"));
                record.setEnemiesKilled(sessionData.getIntValue("enemiesKilled"));
                record.setTowersBuilt(sessionData.getIntValue("towersBuilt"));
                record.setGameStatus(gameStatus);
                record.setPlayTime(System.currentTimeMillis() - sessionData.getLong("startTime"));
                record.setStatus(1);
                leaderboardService.recordGame(record);

                BattleSyncResponse.ServerEvent event = new BattleSyncResponse.ServerEvent();
                event.setEventType("GAME_VICTORY");
                event.setTimestamp(System.currentTimeMillis());
                event.setMessage("恭喜通关！");
                serverEvents.add(event);
            } else {
                gameStatus = 6;
                sessionData.put("gameStatus", gameStatus);

                BattleSyncResponse.ServerEvent event = new BattleSyncResponse.ServerEvent();
                event.setEventType("WAVE_COMPLETE");
                event.setTimestamp(System.currentTimeMillis());
                event.setAmount(currentWaveConfig != null ? currentWaveConfig.getBonusGold() : 0);
                event.setMessage("波次 " + currentWave + " 完成！");
                serverEvents.add(event);
            }

            response.setGameStatus(gameStatus);
        }

        response.setServerGold(serverGold);
        response.setIsValid(isValid);
        response.setValidationMessage(isValid ? "同步成功" : String.join("; ", validationErrors));
        response.setServerEvents(serverEvents);

        redisUtil.set(sessionKey, sessionData.toJSONString(), GAME_SESSION_EXPIRE);

        return response;
    }

    @Override
    public void endGame(String gameSessionId, Integer gameStatus, Long userId) {
        String sessionKey = GAME_SESSION_PREFIX + gameSessionId;
        String sessionStr = (String) redisUtil.get(sessionKey);
        if (sessionStr == null) {
            return;
        }

        JSONObject sessionData = JSON.parseObject(sessionStr);
        Long sessionUserId = sessionData.getLong("userId");
        if (!Objects.equals(sessionUserId, userId)) {
            return;
        }

        TdGameRecord record = new TdGameRecord();
        record.setUserId(userId);
        record.setMapId(sessionData.getLong("mapId"));
        record.setMaxWaveReached(sessionData.getIntValue("currentWave"));
        record.setTotalGoldEarned(sessionData.getIntValue("totalGoldEarned"));
        record.setTotalDamageDealt(sessionData.getIntValue("totalDamageDealt"));
        record.setEnemiesKilled(sessionData.getIntValue("enemiesKilled"));
        record.setTowersBuilt(sessionData.getIntValue("towersBuilt"));
        record.setGameStatus(gameStatus);
        record.setPlayTime(System.currentTimeMillis() - sessionData.getLong("startTime"));
        record.setStatus(1);
        leaderboardService.recordGame(record);

        Set<String> towerKeys = redisUtil.scan(TOWER_INSTANCE_PREFIX + gameSessionId + ":*");
        for (String key : towerKeys) {
            redisUtil.delete(key);
        }

        Set<String> enemyKeys = redisUtil.scan(ENEMY_INSTANCE_PREFIX + gameSessionId + ":*");
        for (String key : enemyKeys) {
            redisUtil.delete(key);
        }

        redisUtil.delete(sessionKey);
    }
}
