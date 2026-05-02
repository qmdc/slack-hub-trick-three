package com.slack.slackjarservice.towerdefense.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.slack.slackjarservice.common.enumtype.foundation.EnableStatusEnum;
import com.slack.slackjarservice.common.enumtype.foundation.ResponseEnum;
import com.slack.slackjarservice.common.response.PageResult;
import com.slack.slackjarservice.common.util.AssertUtil;
import com.slack.slackjarservice.towerdefense.dao.TdTowerDao;
import com.slack.slackjarservice.towerdefense.entity.TdTower;
import com.slack.slackjarservice.towerdefense.model.request.TdTowerPageQuery;
import com.slack.slackjarservice.towerdefense.model.request.TdTowerSaveRequest;
import com.slack.slackjarservice.towerdefense.service.TdTowerService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

/**
 * 塔配置服务实现类
 *
 * @author zhn
 */
@Service("tdTowerService")
public class TdTowerServiceImpl extends ServiceImpl<TdTowerDao, TdTower> implements TdTowerService {

    @Override
    public PageResult<TdTower> pageQuery(TdTowerPageQuery query) {
        LambdaQueryWrapper<TdTower> queryWrapper = new LambdaQueryWrapper<>();

        if (Objects.nonNull(query.getName()) && !query.getName().isEmpty()) {
            queryWrapper.like(TdTower::getName, query.getName());
        }
        if (Objects.nonNull(query.getTowerType())) {
            queryWrapper.eq(TdTower::getTowerType, query.getTowerType());
        }
        if (Objects.nonNull(query.getStatus())) {
            queryWrapper.eq(TdTower::getStatus, query.getStatus());
        }

        queryWrapper.orderByDesc(TdTower::getCreateTime);

        Page<TdTower> page = this.page(new Page<>(query.getPageNo(), query.getPageSize()), queryWrapper);

        return PageResult.of(page.getRecords(), page.getTotal(), query.getPageNo(), query.getPageSize());
    }

    @Override
    public TdTower saveTower(TdTowerSaveRequest request) {
        TdTower tower;
        if (Objects.nonNull(request.getId())) {
            tower = this.getById(request.getId());
            AssertUtil.notNull(tower, ResponseEnum.DATA_NOT_EXISTS);
        } else {
            tower = new TdTower();
            tower.setStatus(EnableStatusEnum.ENABLE.getCode());
        }

        BeanUtils.copyProperties(request, tower);

        if (Objects.nonNull(request.getStatus())) {
            tower.setStatus(request.getStatus());
        }

        this.saveOrUpdate(tower);
        return this.getById(tower.getId());
    }

    @Override
    public void deleteTower(Long id) {
        TdTower tower = this.getById(id);
        AssertUtil.notNull(tower, ResponseEnum.DATA_NOT_EXISTS);
        this.removeById(id);
    }

    @Override
    public TdTower getTowerDetail(Long id) {
        TdTower tower = this.getById(id);
        AssertUtil.notNull(tower, ResponseEnum.DATA_NOT_EXISTS);
        return tower;
    }

    @Override
    public List<TdTower> getAvailableTowers(Integer currentWave) {
        LambdaQueryWrapper<TdTower> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(TdTower::getStatus, EnableStatusEnum.ENABLE.getCode());

        if (Objects.nonNull(currentWave)) {
            queryWrapper.and(w -> w.isNull(TdTower::getUnlockWave)
                    .or().le(TdTower::getUnlockWave, currentWave));
        }

        queryWrapper.orderByAsc(TdTower::getBaseCost);

        return this.list(queryWrapper);
    }
}
