package com.slack.slackjarservice.towerdefense.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.slack.slackjarservice.common.response.PageResult;
import com.slack.slackjarservice.foundation.entity.SysUser;
import com.slack.slackjarservice.towerdefense.dao.TdGameRecordDao;
import com.slack.slackjarservice.towerdefense.dao.TdMapDao;
import com.slack.slackjarservice.towerdefense.dao.TdTowerDao;
import com.slack.slackjarservice.towerdefense.entity.TdGameRecord;
import com.slack.slackjarservice.towerdefense.entity.TdMap;
import com.slack.slackjarservice.towerdefense.model.request.LeaderboardPageQuery;
import com.slack.slackjarservice.towerdefense.model.response.LeaderboardItemResponse;
import com.slack.slackjarservice.towerdefense.service.LeaderboardService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * 排行榜服务实现类
 *
 * @author zhn
 */
@Service("leaderboardService")
public class LeaderboardServiceImpl extends ServiceImpl<TdGameRecordDao, TdGameRecord> implements LeaderboardService {

    @Resource
    private TdMapDao tdMapDao;

    @Resource
    private com.slack.slackjarservice.foundation.dao.SysUserDao sysUserDao;

    @Override
    public PageResult<LeaderboardItemResponse> getLeaderboard(LeaderboardPageQuery query) {
        LambdaQueryWrapper<TdGameRecord> queryWrapper = new LambdaQueryWrapper<>();

        if (Objects.nonNull(query.getMapId())) {
            queryWrapper.eq(TdGameRecord::getMapId, query.getMapId());
        }
        if (Objects.nonNull(query.getUserId())) {
            queryWrapper.eq(TdGameRecord::getUserId, query.getUserId());
        }

        queryWrapper.orderByDesc(TdGameRecord::getMaxWaveReached)
                .orderByDesc(TdGameRecord::getTotalGoldEarned)
                .orderByDesc(TdGameRecord::getEnemiesKilled);

        Page<TdGameRecord> page = this.page(new Page<>(query.getPageNo(), query.getPageSize()), queryWrapper);

        List<LeaderboardItemResponse> items = new ArrayList<>();

        if (!CollectionUtils.isEmpty(page.getRecords())) {
            List<Long> userIds = page.getRecords().stream()
                    .map(TdGameRecord::getUserId)
                    .distinct()
                    .toList();

            List<Long> mapIds = page.getRecords().stream()
                    .map(TdGameRecord::getMapId)
                    .filter(Objects::nonNull)
                    .distinct()
                    .toList();

            Map<Long, SysUser> userMap = sysUserDao.selectBatchIds(userIds).stream()
                    .collect(Collectors.toMap(SysUser::getId, u -> u));

            Map<Long, TdMap> mapMap = tdMapDao.selectBatchIds(mapIds).stream()
                    .collect(Collectors.toMap(TdMap::getId, m -> m));

            int rank = (int) (page.getCurrent() * page.getSize()) + 1;
            for (TdGameRecord record : page.getRecords()) {
                LeaderboardItemResponse item = new LeaderboardItemResponse();
                item.setId(record.getId());
                item.setUserId(record.getUserId());
                item.setMapId(record.getMapId());
                item.setMaxWaveReached(record.getMaxWaveReached());
                item.setTotalGoldEarned(record.getTotalGoldEarned());
                item.setTotalDamageDealt(record.getTotalDamageDealt());
                item.setEnemiesKilled(record.getEnemiesKilled());
                item.setPlayTime(record.getPlayTime());
                item.setCreateTime(record.getCreateTime());
                item.setRank(rank++);

                SysUser user = userMap.get(record.getUserId());
                if (user != null) {
                    item.setUsername(user.getUsername());
                    item.setNickname(user.getNickname());
                }

                TdMap map = mapMap.get(record.getMapId());
                if (map != null) {
                    item.setMapName(map.getName());
                }

                items.add(item);
            }
        }

        return PageResult.of(items, page.getTotal(), query.getPageNo(), query.getPageSize());
    }

    @Override
    public void recordGame(TdGameRecord record) {
        this.save(record);
    }

    @Override
    public Integer getUserBestWave(Long userId, Long mapId) {
        LambdaQueryWrapper<TdGameRecord> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(TdGameRecord::getUserId, userId);
        if (mapId != null) {
            queryWrapper.eq(TdGameRecord::getMapId, mapId);
        }
        queryWrapper.orderByDesc(TdGameRecord::getMaxWaveReached);
        queryWrapper.last("LIMIT 1");

        TdGameRecord record = this.getOne(queryWrapper);
        return record != null ? record.getMaxWaveReached() : 0;
    }
}
