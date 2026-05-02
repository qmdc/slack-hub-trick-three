package com.slack.slackjarservice.towerdefense.service.impl;

import com.alibaba.fastjson2.JSON;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.slack.slackjarservice.common.enumtype.foundation.EnableStatusEnum;
import com.slack.slackjarservice.common.enumtype.foundation.ResponseEnum;
import com.slack.slackjarservice.common.response.PageResult;
import com.slack.slackjarservice.common.util.AssertUtil;
import com.slack.slackjarservice.towerdefense.dao.TdWaveDao;
import com.slack.slackjarservice.towerdefense.dao.TdWaveEnemyDao;
import com.slack.slackjarservice.towerdefense.entity.TdWave;
import com.slack.slackjarservice.towerdefense.entity.TdWaveEnemy;
import com.slack.slackjarservice.towerdefense.model.request.TdWavePageQuery;
import com.slack.slackjarservice.towerdefense.model.request.TdWaveSaveRequest;
import com.slack.slackjarservice.towerdefense.service.TdWaveService;
import jakarta.annotation.Resource;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.util.List;
import java.util.Objects;

/**
 * 波次配置服务实现类
 *
 * @author zhn
 */
@Service("tdWaveService")
public class TdWaveServiceImpl extends ServiceImpl<TdWaveDao, TdWave> implements TdWaveService {

    @Resource
    private TdWaveEnemyDao tdWaveEnemyDao;

    @Override
    public PageResult<TdWave> pageQuery(TdWavePageQuery query) {
        LambdaQueryWrapper<TdWave> queryWrapper = new LambdaQueryWrapper<>();

        if (Objects.nonNull(query.getMapId())) {
            queryWrapper.eq(TdWave::getMapId, query.getMapId());
        }
        if (Objects.nonNull(query.getWaveNumber())) {
            queryWrapper.eq(TdWave::getWaveNumber, query.getWaveNumber());
        }
        if (Objects.nonNull(query.getStatus())) {
            queryWrapper.eq(TdWave::getStatus, query.getStatus());
        }

        queryWrapper.orderByAsc(TdWave::getWaveNumber);

        Page<TdWave> page = this.page(new Page<>(query.getPageNo(), query.getPageSize()), queryWrapper);

        return PageResult.of(page.getRecords(), page.getTotal(), query.getPageNo(), query.getPageSize());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TdWave saveWave(TdWaveSaveRequest request) {
        TdWave wave;
        if (Objects.nonNull(request.getId())) {
            wave = this.getById(request.getId());
            AssertUtil.notNull(wave, ResponseEnum.DATA_NOT_EXISTS);
        } else {
            wave = new TdWave();
            wave.setStatus(EnableStatusEnum.ENABLE.getCode());
        }

        BeanUtils.copyProperties(request, wave);

        if (Objects.nonNull(request.getStatus())) {
            wave.setStatus(request.getStatus());
        }

        this.saveOrUpdate(wave);

        if (!CollectionUtils.isEmpty(request.getEnemies())) {
            if (Objects.nonNull(request.getId())) {
                tdWaveEnemyDao.delete(new LambdaQueryWrapper<TdWaveEnemy>()
                        .eq(TdWaveEnemy::getWaveId, wave.getId()));
            }

            for (int i = 0; i < request.getEnemies().size(); i++) {
                var enemyReq = request.getEnemies().get(i);
                TdWaveEnemy waveEnemy = new TdWaveEnemy();
                waveEnemy.setWaveId(wave.getId());
                waveEnemy.setEnemyId(enemyReq.getEnemyId());
                waveEnemy.setCount(enemyReq.getCount());
                waveEnemy.setHpMultiplier(Objects.nonNull(enemyReq.getHpMultiplier()) ? enemyReq.getHpMultiplier() : 1.0);
                waveEnemy.setSpeedMultiplier(Objects.nonNull(enemyReq.getSpeedMultiplier()) ? enemyReq.getSpeedMultiplier() : 1.0);
                waveEnemy.setSpawnOrder(Objects.nonNull(enemyReq.getSpawnOrder()) ? enemyReq.getSpawnOrder() : i);
                waveEnemy.setStatus(EnableStatusEnum.ENABLE.getCode());
                tdWaveEnemyDao.insert(waveEnemy);
            }
        }

        return this.getById(wave.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteWave(Long id) {
        TdWave wave = this.getById(id);
        AssertUtil.notNull(wave, ResponseEnum.DATA_NOT_EXISTS);

        tdWaveEnemyDao.delete(new LambdaQueryWrapper<TdWaveEnemy>()
                .eq(TdWaveEnemy::getWaveId, id));

        this.removeById(id);
    }

    @Override
    public TdWave getWaveDetail(Long id) {
        TdWave wave = this.getById(id);
        AssertUtil.notNull(wave, ResponseEnum.DATA_NOT_EXISTS);
        return wave;
    }

    @Override
    public List<TdWave> getWavesByMapId(Long mapId) {
        return this.list(new LambdaQueryWrapper<TdWave>()
                .eq(TdWave::getMapId, mapId)
                .orderByAsc(TdWave::getWaveNumber));
    }
}
