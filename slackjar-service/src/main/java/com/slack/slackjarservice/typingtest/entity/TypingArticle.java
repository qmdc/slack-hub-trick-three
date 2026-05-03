package com.slack.slackjarservice.typingtest.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.slack.slackjarservice.common.base.BaseModel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@TableName("typing_article")
public class TypingArticle extends BaseModel {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String title;

    private String content;

    private Integer wordCount;

    private Integer difficulty;

    private String category;

    private Integer status;
}