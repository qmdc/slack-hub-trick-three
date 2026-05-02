package com.slack.slackjarservice.towerdefense.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.slack.slackjarservice.common.enumtype.foundation.EnableStatusEnum;
import com.slack.slackjarservice.common.enumtype.foundation.ResponseEnum;
import com.slack.slackjarservice.common.response.PageResult;
import com.slack.slackjarservice.common.util.AssertUtil;
import com.slack.slackjarservice.towerdefense.dao.TdMapDao;
import com.slack.slackjarservice.towerdefense.entity.TdMap;
import com.slack.slackjarservice.towerdefense.model.request.TdMapPageQuery;
import com.slack.slackjarservice.towerdefense.model.request.TdMapSaveRequest;
import com.slack.slackjarservice.towerdefense.service.TdMapService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.List;
import java.util.Objects;

/**
 * 地图配置服务实现类
 *
 * @author zhn
 */
@Service("tdMapService")
public class TdMapServiceImpl extends ServiceImpl<TdMapDao, TdMap> implements TdMapService {

    @Override
    public PageResult<TdMap> pageQuery(TdMapPageQuery query) {
        LambdaQueryWrapper<TdMap> queryWrapper = new LambdaQueryWrapper<>();

        if (Objects.nonNull(query.getName()) && !query.getName().isEmpty()) {
            queryWrapper.like(TdMap::getName, query.getName());
        }
        if (Objects.nonNull(query.getStatus())) {
            queryWrapper.eq(TdMap::getStatus, query.getStatus());
        }

        queryWrapper.orderByDesc(TdMap::getCreateTime);

        Page<TdMap> page = this.page(new Page<>(query.getPageNo(), query.getPageSize()), queryWrapper);

        return PageResult.of(page.getRecords(), page.getTotal(), query.getPageNo(), query.getPageSize());
    }

    @Override
    public TdMap saveMap(TdMapSaveRequest request) {
        TdMap map;
        if (Objects.nonNull(request.getId())) {
            map = this.getById(request.getId());
            AssertUtil.notNull(map, ResponseEnum.DATA_NOT_EXISTS);
        } else {
            map = new TdMap();
            map.setStatus(EnableStatusEnum.ENABLE.getCode());
        }

        BeanUtils.copyProperties(request, map);

        if (Objects.nonNull(request.getStatus())) {
            map.setStatus(request.getStatus());
        }

        this.saveOrUpdate(map);
        return this.getById(map.getId());
    }

    @Override
    public void deleteMap(Long id) {
        TdMap map = this.getById(id);
        AssertUtil.notNull(map, ResponseEnum.DATA_NOT_EXISTS);
        this.removeById(id);
    }

    @Override
    public TdMap getMapDetail(Long id) {
        TdMap map = this.getById(id);
        AssertUtil.notNull(map, ResponseEnum.DATA_NOT_EXISTS);
        return map;
    }

    @Override
    public List<TdMap> getAvailableMaps() {
        return this.list(new LambdaQueryWrapper<TdMap>()
                .eq(TdMap::getStatus, EnableStatusEnum.ENABLE.getCode())
                .orderByDesc(TdMap::getCreateTime));
    }
}
