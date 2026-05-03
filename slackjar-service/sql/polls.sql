CREATE TABLE IF NOT EXISTS poll_survey (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '投票问卷ID',
    title VARCHAR(500) NOT NULL COMMENT '问卷标题',
    description TEXT COMMENT '问卷描述',
    status INT DEFAULT 1 NOT NULL COMMENT '状态（0-关闭，1-开启）',
    deadline BIGINT COMMENT '截止时间（毫秒时间戳）',
    share_code VARCHAR(64) UNIQUE COMMENT '分享码',
    total_votes INT DEFAULT 0 COMMENT '总投票数',
    created_by BIGINT COMMENT '创建人ID',
    create_time BIGINT NULL COMMENT '创建时间（毫秒时间戳）',
    update_time BIGINT NULL COMMENT '更新时间（毫秒时间戳）',
    deleted TINYINT DEFAULT 0 NOT NULL COMMENT '逻辑删除（0-未删，1-已删）',
    version BIGINT DEFAULT 1 NOT NULL COMMENT '版本号（用于乐观锁）',
    INDEX idx_status (status),
    INDEX idx_deadline (deadline),
    INDEX idx_share_code (share_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='投票问卷表';

CREATE TABLE IF NOT EXISTS poll_question (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '问题ID',
    survey_id BIGINT NOT NULL COMMENT '所属问卷ID',
    question_text VARCHAR(1000) NOT NULL COMMENT '问题内容',
    question_type INT NOT NULL COMMENT '问题类型（1-单选，2-多选）',
    sort_order INT DEFAULT 0 COMMENT '排序序号',
    is_required INT DEFAULT 1 COMMENT '是否必填（0-可选，1-必填）',
    create_time BIGINT NULL COMMENT '创建时间（毫秒时间戳）',
    update_time BIGINT NULL COMMENT '更新时间（毫秒时间戳）',
    deleted TINYINT DEFAULT 0 NOT NULL COMMENT '逻辑删除（0-未删，1-已删）',
    version BIGINT DEFAULT 1 NOT NULL COMMENT '版本号（用于乐观锁）',
    INDEX idx_survey_id (survey_id),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='投票问题表';

CREATE TABLE IF NOT EXISTS poll_option (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '选项ID',
    question_id BIGINT NOT NULL COMMENT '所属问题ID',
    option_text VARCHAR(500) NOT NULL COMMENT '选项内容',
    vote_count INT DEFAULT 0 COMMENT '投票数',
    sort_order INT DEFAULT 0 COMMENT '排序序号',
    create_time BIGINT NULL COMMENT '创建时间（毫秒时间戳）',
    update_time BIGINT NULL COMMENT '更新时间（毫秒时间戳）',
    deleted TINYINT DEFAULT 0 NOT NULL COMMENT '逻辑删除（0-未删，1-已删）',
    version BIGINT DEFAULT 1 NOT NULL COMMENT '版本号（用于乐观锁）',
    INDEX idx_question_id (question_id),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='投票选项表';

CREATE TABLE IF NOT EXISTS poll_vote_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '投票记录ID',
    survey_id BIGINT NOT NULL COMMENT '所属问卷ID',
    question_id BIGINT NOT NULL COMMENT '所属问题ID',
    option_id BIGINT NOT NULL COMMENT '选中的选项ID',
    voter_id VARCHAR(64) COMMENT '投票者标识（匿名用户用设备ID）',
    voter_ip VARCHAR(64) COMMENT '投票者IP',
    vote_time BIGINT NOT NULL COMMENT '投票时间（毫秒时间戳）',
    create_time BIGINT NULL COMMENT '创建时间（毫秒时间戳）',
    update_time BIGINT NULL COMMENT '更新时间（毫秒时间戳）',
    deleted TINYINT DEFAULT 0 NOT NULL COMMENT '逻辑删除（0-未删，1-已删）',
    version BIGINT DEFAULT 1 NOT NULL COMMENT '版本号（用于乐观锁）',
    INDEX idx_survey_id (survey_id),
    INDEX idx_question_id (question_id),
    INDEX idx_voter_id (voter_id),
    INDEX idx_vote_time (vote_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='投票记录表';