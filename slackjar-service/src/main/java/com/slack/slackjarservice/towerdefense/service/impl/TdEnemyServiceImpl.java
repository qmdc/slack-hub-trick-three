package com.slack.slackjarservice.towerdefense.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.slack.slackjarservice.common.enumtype.foundation.EnableStatusEnum;
import com.slack.slackjarservice.common.enumtype.foundation.ResponseEnum;
import com.slack.slackjarservice.common.response.PageResult;
import com.slack.slackjarservice.common.util.AssertUtil;
import com.slack.slackjarservice.towerdefense.dao.TdEnemyDao;
import com.slack.slackjarservice.towerdefense.entity.TdEnemy;
import com.slack.slackjarservice.towerdefense.model.request.TdEnemyPageQuery;
import com.slack.slackjarservice.towerdefense.model.request.TdEnemySaveRequest;
import com.slack.slackjarservice.towerdefense.service.TdEnemyService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

/**
 * 敌人配置服务实现类
 *
 * @author zhn
 */
@Service("tdEnemyService")
public class TdEnemyServiceImpl extends ServiceImpl<TdEnemyDao, TdEnemy> implements TdEnemyService {

    @Override
    public PageResult<TdEnemy> pageQuery(TdEnemyPageQuery query) {
        LambdaQueryWrapper<TdEnemy> queryWrapper = new LambdaQueryWrapper<>();

        if (Objects.nonNull(query.getName()) && !query.getName().isEmpty()) {
            queryWrapper.like(TdEnemy::getName, query.getName());
        }
        if (Objects.nonNull(query.getEnemyType())) {
            queryWrapper.eq(TdEnemy::getEnemyType, query.getEnemyType());
        }
        if (Objects.nonNull(query.getStatus())) {
            queryWrapper.eq(TdEnemy::getStatus, query.getStatus());
        }

        queryWrapper.orderByDesc(TdEnemy::getCreateTime);

        Page<TdEnemy> page = this.page(new Page<>(query.getPageNo(), query.getPageSize()), queryWrapper);

        return PageResult.of(page.getRecords(), page.getTotal(), query.getPageNo(), query.getPageSize());
    }

    @Override
    public TdEnemy saveEnemy(TdEnemySaveRequest request) {
        TdEnemy enemy;
        if (Objects.nonNull(request.getId())) {
            enemy = this.getById(request.getId());
            AssertUtil.notNull(enemy, ResponseEnum.DATA_NOT_EXISTS);
        } else {
            enemy = new TdEnemy();
            enemy.setStatus(EnableStatusEnum.ENABLE.getCode());
        }

        BeanUtils.copyProperties(request, enemy);

        if (Objects.nonNull(request.getStatus())) {
            enemy.setStatus(request.getStatus());
        }

        this.saveOrUpdate(enemy);
        return this.getById(enemy.getId());
    }

    @Override
    public void deleteEnemy(Long id) {
        TdEnemy enemy = this.getById(id);
        AssertUtil.notNull(enemy, ResponseEnum.DATA_NOT_EXISTS);
        this.removeById(id);
    }

    @Override
    public TdEnemy getEnemyDetail(Long id) {
        TdEnemy enemy = this.getById(id);
        AssertUtil.notNull(enemy, ResponseEnum.DATA_NOT_EXISTS);
        return enemy;
    }

    @Override
    public List<TdEnemy> getAvailableEnemies() {
        return this.list(new LambdaQueryWrapper<TdEnemy>()
                .eq(TdEnemy::getStatus, EnableStatusEnum.ENABLE.getCode())
                .orderByDesc(TdEnemy::getCreateTime));
    }
}
