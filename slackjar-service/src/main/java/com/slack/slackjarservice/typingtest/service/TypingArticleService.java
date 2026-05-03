package com.slack.slackjarservice.typingtest.service;

import com.slack.slackjarservice.typingtest.entity.TypingArticle;

import java.util.List;
import java.util.Optional;

public interface TypingArticleService {

    List<TypingArticle> getAllEnabledArticles();

    List<TypingArticle> getArticlesByDifficulty(Integer difficulty);

    Optional<TypingArticle> getArticleById(Long id);

    TypingArticle getRandomArticle();

    TypingArticle getRandomArticleByDifficulty(Integer difficulty);

    List<String> getAllCategories();

    TypingArticle saveArticle(TypingArticle article);

    void deleteArticle(Long id);
}