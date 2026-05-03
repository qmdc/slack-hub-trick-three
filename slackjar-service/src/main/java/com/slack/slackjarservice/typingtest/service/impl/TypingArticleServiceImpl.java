package com.slack.slackjarservice.typingtest.service.impl;

import com.slack.slackjarservice.typingtest.dao.TypingArticleDao;
import com.slack.slackjarservice.typingtest.entity.TypingArticle;
import com.slack.slackjarservice.typingtest.service.TypingArticleService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class TypingArticleServiceImpl implements TypingArticleService {

    @Resource
    private TypingArticleDao typingArticleDao;

    private final Random random = new Random();

    @Override
    public List<TypingArticle> getAllEnabledArticles() {
        return typingArticleDao.selectEnabledArticles();
    }

    @Override
    public List<TypingArticle> getArticlesByDifficulty(Integer difficulty) {
        return typingArticleDao.selectByDifficulty(difficulty);
    }

    @Override
    public Optional<TypingArticle> getArticleById(Long id) {
        return Optional.ofNullable(typingArticleDao.selectById(id));
    }

    @Override
    public TypingArticle getRandomArticle() {
        List<TypingArticle> articles = getAllEnabledArticles();
        if (articles.isEmpty()) {
            return null;
        }
        return articles.get(random.nextInt(articles.size()));
    }

    @Override
    public TypingArticle getRandomArticleByDifficulty(Integer difficulty) {
        List<TypingArticle> articles = getArticlesByDifficulty(difficulty);
        if (articles.isEmpty()) {
            return null;
        }
        return articles.get(random.nextInt(articles.size()));
    }

    @Override
    public List<String> getAllCategories() {
        return typingArticleDao.selectAllCategories();
    }

    @Override
    public TypingArticle saveArticle(TypingArticle article) {
        if (article.getId() == null) {
            article.setCreateTime(System.currentTimeMillis());
            typingArticleDao.insert(article);
        } else {
            article.setUpdateTime(System.currentTimeMillis());
            typingArticleDao.updateById(article);
        }
        return article;
    }

    @Override
    public void deleteArticle(Long id) {
        typingArticleDao.deleteById(id);
    }
}