package com.slack.slackjarservice.typingtest.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.slack.slackjarservice.typingtest.entity.TypingArticle;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface TypingArticleDao extends BaseMapper<TypingArticle> {

    List<TypingArticle> selectEnabledArticles();

    List<TypingArticle> selectByDifficulty(Integer difficulty);

    List<String> selectAllCategories();
}