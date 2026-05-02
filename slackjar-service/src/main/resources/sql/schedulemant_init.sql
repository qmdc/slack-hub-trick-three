-- 日程管理模块数据库初始化脚本
-- 创建时间块表
CREATE TABLE IF NOT EXISTS `schedule_time_block` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `task_id` BIGINT NULL COMMENT '关联任务ID',
    `block_type` INT NOT NULL DEFAULT 0 COMMENT '时间块类型（1-工作，2-学习，3-休息，4-运动，5-社交，0-其他）',
    `title` VARCHAR(100) NOT NULL COMMENT '时间块标题',
    `description` VARCHAR(500) NULL COMMENT '时间块描述',
    `start_time` BIGINT NOT NULL COMMENT '开始时间（毫秒时间戳）',
    `end_time` BIGINT NOT NULL COMMENT '结束时间（毫秒时间戳）',
    `day_of_week` INT NULL COMMENT '星期几（1-7）',
    `color` VARCHAR(20) NULL COMMENT '颜色',
    `priority` INT NULL COMMENT '优先级（1-重要紧急，2-重要不紧急，3-不重要但紧急，4-不重要不紧急）',
    `status` INT NOT NULL DEFAULT 0 COMMENT '状态（0-启用，1-禁用）',
    `remark` VARCHAR(500) NULL COMMENT '备注',
    `create_time` BIGINT NOT NULL COMMENT '创建时间',
    `update_time` BIGINT NOT NULL COMMENT '更新时间',
    `deleted` INT NOT NULL DEFAULT 0 COMMENT '删除标记（0-未删除，1-已删除）',
    `version` INT NOT NULL DEFAULT 0 COMMENT '版本号',
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_start_time` (`start_time`),
    INDEX `idx_end_time` (`end_time`),
    INDEX `idx_block_type` (`block_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='时间块表';

-- 创建任务表
CREATE TABLE IF NOT EXISTS `schedule_task` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `title` VARCHAR(100) NOT NULL COMMENT '任务标题',
    `description` VARCHAR(500) NULL COMMENT '任务描述',
    `priority` INT NULL COMMENT '优先级（1-重要紧急，2-重要不紧急，3-不重要但紧急，4-不重要不紧急）',
    `due_time` BIGINT NULL COMMENT '截止时间（毫秒时间戳）',
    `estimated_minutes` INT NULL COMMENT '预计用时（分钟）',
    `actual_minutes` INT NULL COMMENT '实际用时（分钟）',
    `task_type` INT NULL COMMENT '任务类型',
    `status` INT NOT NULL DEFAULT 0 COMMENT '状态（0-待办，1-进行中，2-已完成）',
    `remark` VARCHAR(500) NULL COMMENT '备注',
    `create_time` BIGINT NOT NULL COMMENT '创建时间',
    `update_time` BIGINT NOT NULL COMMENT '更新时间',
    `deleted` INT NOT NULL DEFAULT 0 COMMENT '删除标记（0-未删除，1-已删除）',
    `version` INT NOT NULL DEFAULT 0 COMMENT '版本号',
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_priority` (`priority`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务表';

-- 创建计划模板表
CREATE TABLE IF NOT EXISTS `schedule_template` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `name` VARCHAR(100) NOT NULL COMMENT '模板名称',
    `description` VARCHAR(500) NULL COMMENT '模板描述',
    `template_type` INT NOT NULL DEFAULT 1 COMMENT '模板类型（1-每日模板，2-每周模板）',
    `template_data` LONGTEXT NULL COMMENT '模板数据（JSON格式）',
    `is_default` INT NOT NULL DEFAULT 0 COMMENT '是否默认（0-否，1-是）',
    `status` INT NOT NULL DEFAULT 0 COMMENT '状态（0-启用，1-禁用）',
    `remark` VARCHAR(500) NULL COMMENT '备注',
    `create_time` BIGINT NOT NULL COMMENT '创建时间',
    `update_time` BIGINT NOT NULL COMMENT '更新时间',
    `deleted` INT NOT NULL DEFAULT 0 COMMENT '删除标记（0-未删除，1-已删除）',
    `version` INT NOT NULL DEFAULT 0 COMMENT '版本号',
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_template_type` (`template_type`),
    INDEX `idx_is_default` (`is_default`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='计划模板表';

-- 创建番茄钟记录表
CREATE TABLE IF NOT EXISTS `pomodoro_record` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `task_id` BIGINT NULL COMMENT '关联任务ID',
    `time_block_id` BIGINT NULL COMMENT '关联时间块ID',
    `planned_minutes` INT NOT NULL COMMENT '计划时长（分钟）',
    `actual_minutes` INT NULL COMMENT '实际时长（分钟）',
    `start_time` BIGINT NOT NULL COMMENT '开始时间（毫秒时间戳）',
    `end_time` BIGINT NULL COMMENT '结束时间（毫秒时间戳）',
    `status` INT NOT NULL DEFAULT 0 COMMENT '状态（0-进行中，1-已完成，2-被打断，3-已放弃）',
    `interrupt_reason` VARCHAR(200) NULL COMMENT '打断原因',
    `remark` VARCHAR(500) NULL COMMENT '备注',
    `create_time` BIGINT NOT NULL COMMENT '创建时间',
    `update_time` BIGINT NOT NULL COMMENT '更新时间',
    `deleted` INT NOT NULL DEFAULT 0 COMMENT '删除标记（0-未删除，1-已删除）',
    `version` INT NOT NULL DEFAULT 0 COMMENT '版本号',
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_start_time` (`start_time`),
    INDEX `idx_end_time` (`end_time`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='番茄钟记录表';
