-- ============================================
-- 塔防游戏数据库建表脚本
-- 数据库: slackjar_trick_three
-- 创建日期: 2026-05-02
-- ============================================

-- ============================================
-- 1. 地图配置表
-- ============================================
DROP TABLE IF EXISTS `td_map`;
CREATE TABLE `td_map` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `name` VARCHAR(100) NOT NULL DEFAULT '' COMMENT '地图名称',
    `description` VARCHAR(500) DEFAULT '' COMMENT '地图描述',
    `map_width` INT(11) NOT NULL DEFAULT 20 COMMENT '地图宽度（格子数）',
    `map_height` INT(11) NOT NULL DEFAULT 15 COMMENT '地图高度（格子数）',
    `tile_size` INT(11) NOT NULL DEFAULT 40 COMMENT '每个格子的像素大小',
    `grid_data` TEXT COMMENT '网格数据（JSON数组）',
    `path_data` TEXT COMMENT '路径数据（JSON数组）',
    `start_gold` INT(11) NOT NULL DEFAULT 100 COMMENT '初始金币',
    `player_hp` INT(11) NOT NULL DEFAULT 20 COMMENT '玩家生命值',
    `total_waves` INT(11) NOT NULL DEFAULT 10 COMMENT '总波次数',
    `status` INT(11) NOT NULL DEFAULT 1 COMMENT '状态（0-禁用，1-启用）',
    `create_time` BIGINT(20) DEFAULT NULL COMMENT '创建时间（毫秒时间戳）',
    `update_time` BIGINT(20) DEFAULT NULL COMMENT '更新时间（毫秒时间戳）',
    `deleted` INT(11) NOT NULL DEFAULT 0 COMMENT '逻辑删除（0-未删，1-已删）',
    `version` BIGINT(20) NOT NULL DEFAULT 1 COMMENT '版本号（乐观锁）',
    PRIMARY KEY (`id`),
    KEY `idx_status` (`status`),
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='塔防地图配置表';

-- ============================================
-- 2. 塔配置表
-- ============================================
DROP TABLE IF EXISTS `td_tower`;
CREATE TABLE `td_tower` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `name` VARCHAR(100) NOT NULL DEFAULT '' COMMENT '塔名称',
    `tower_type` INT(11) NOT NULL DEFAULT 1 COMMENT '塔类型（1-箭塔，2-炮塔，3-魔法塔，4-激光塔，5-冰冻塔）',
    `description` VARCHAR(500) DEFAULT '' COMMENT '塔描述',
    `base_cost` INT(11) NOT NULL DEFAULT 50 COMMENT '基础费用',
    `base_damage` INT(11) NOT NULL DEFAULT 10 COMMENT '基础伤害',
    `base_attack_speed` DOUBLE(10,2) NOT NULL DEFAULT 1.00 COMMENT '基础攻速（次/秒）',
    `base_range` INT(11) NOT NULL DEFAULT 3 COMMENT '基础射程（格子数）',
    `upgrade_cost` INT(11) NOT NULL DEFAULT 30 COMMENT '升级费用',
    `damage_upgrade_rate` DOUBLE(10,2) NOT NULL DEFAULT 1.30 COMMENT '伤害升级倍率',
    `attack_speed_upgrade_rate` DOUBLE(10,2) NOT NULL DEFAULT 1.10 COMMENT '攻速升级倍率',
    `range_upgrade` INT(11) NOT NULL DEFAULT 0 COMMENT '射程升级增加量（格子数）',
    `icon` VARCHAR(255) DEFAULT '' COMMENT '图标URL',
    `color` VARCHAR(20) DEFAULT '#4a9eff' COMMENT '显示颜色（HEX）',
    `special_effect` VARCHAR(255) DEFAULT '' COMMENT '特殊效果描述',
    `unlock_wave` INT(11) DEFAULT 0 COMMENT '解锁波数（0表示始终可用）',
    `status` INT(11) NOT NULL DEFAULT 1 COMMENT '状态（0-禁用，1-启用）',
    `create_time` BIGINT(20) DEFAULT NULL COMMENT '创建时间（毫秒时间戳）',
    `update_time` BIGINT(20) DEFAULT NULL COMMENT '更新时间（毫秒时间戳）',
    `deleted` INT(11) NOT NULL DEFAULT 0 COMMENT '逻辑删除（0-未删，1-已删）',
    `version` BIGINT(20) NOT NULL DEFAULT 1 COMMENT '版本号（乐观锁）',
    PRIMARY KEY (`id`),
    KEY `idx_tower_type` (`tower_type`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='塔配置表';

-- ============================================
-- 3. 敌人配置表
-- ============================================
DROP TABLE IF EXISTS `td_enemy`;
CREATE TABLE `td_enemy` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `name` VARCHAR(100) NOT NULL DEFAULT '' COMMENT '敌人名称',
    `enemy_type` INT(11) NOT NULL DEFAULT 1 COMMENT '敌人类型（1-普通兵，2-快速兵，3-重甲兵，4-BOSS，5-治疗兵）',
    `description` VARCHAR(500) DEFAULT '' COMMENT '敌人描述',
    `base_hp` INT(11) NOT NULL DEFAULT 100 COMMENT '基础血量',
    `base_speed` INT(11) NOT NULL DEFAULT 2 COMMENT '基础移动速度（格子/秒）',
    `speed_multiplier` DOUBLE(10,2) NOT NULL DEFAULT 1.00 COMMENT '速度倍率',
    `reward` INT(11) NOT NULL DEFAULT 10 COMMENT '击杀奖励金币',
    `icon` VARCHAR(255) DEFAULT '' COMMENT '图标URL',
    `color` VARCHAR(20) DEFAULT '#ff6b6b' COMMENT '显示颜色（HEX）',
    `armor` INT(11) DEFAULT 0 COMMENT '护甲值（减少物理伤害）',
    `magic_resistance` DOUBLE(10,2) DEFAULT 0.00 COMMENT '魔抗（百分比，0-1）',
    `special_ability` VARCHAR(255) DEFAULT '' COMMENT '特殊能力描述',
    `status` INT(11) NOT NULL DEFAULT 1 COMMENT '状态（0-禁用，1-启用）',
    `create_time` BIGINT(20) DEFAULT NULL COMMENT '创建时间（毫秒时间戳）',
    `update_time` BIGINT(20) DEFAULT NULL COMMENT '更新时间（毫秒时间戳）',
    `deleted` INT(11) NOT NULL DEFAULT 0 COMMENT '逻辑删除（0-未删，1-已删）',
    `version` BIGINT(20) NOT NULL DEFAULT 1 COMMENT '版本号（乐观锁）',
    PRIMARY KEY (`id`),
    KEY `idx_enemy_type` (`enemy_type`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='敌人配置表';

-- ============================================
-- 4. 波次配置表
-- ============================================
DROP TABLE IF EXISTS `td_wave`;
CREATE TABLE `td_wave` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `map_id` BIGINT(20) NOT NULL COMMENT '关联地图ID',
    `wave_number` INT(11) NOT NULL DEFAULT 1 COMMENT '波次序号',
    `name` VARCHAR(100) DEFAULT '' COMMENT '波次名称',
    `total_enemies` INT(11) NOT NULL DEFAULT 10 COMMENT '总敌人数',
    `spawn_interval` BIGINT(20) NOT NULL DEFAULT 1000 COMMENT '敌人生成间隔（毫秒）',
    `difficulty_multiplier` DOUBLE(10,2) NOT NULL DEFAULT 1.00 COMMENT '难度倍率',
    `bonus_gold` INT(11) NOT NULL DEFAULT 0 COMMENT '通关奖励金币',
    `status` INT(11) NOT NULL DEFAULT 1 COMMENT '状态（0-禁用，1-启用）',
    `create_time` BIGINT(20) DEFAULT NULL COMMENT '创建时间（毫秒时间戳）',
    `update_time` BIGINT(20) DEFAULT NULL COMMENT '更新时间（毫秒时间戳）',
    `deleted` INT(11) NOT NULL DEFAULT 0 COMMENT '逻辑删除（0-未删，1-已删）',
    `version` BIGINT(20) NOT NULL DEFAULT 1 COMMENT '版本号（乐观锁）',
    PRIMARY KEY (`id`),
    KEY `idx_map_id` (`map_id`),
    KEY `idx_wave_number` (`wave_number`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='波次配置表';

-- ============================================
-- 5. 波次敌人配置表
-- ============================================
DROP TABLE IF EXISTS `td_wave_enemy`;
CREATE TABLE `td_wave_enemy` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `wave_id` BIGINT(20) NOT NULL COMMENT '关联波次ID',
    `enemy_id` BIGINT(20) NOT NULL COMMENT '关联敌人ID',
    `count` INT(11) NOT NULL DEFAULT 1 COMMENT '该类型敌人数量',
    `hp_multiplier` DOUBLE(10,2) NOT NULL DEFAULT 1.00 COMMENT '血量倍率',
    `speed_multiplier` DOUBLE(10,2) NOT NULL DEFAULT 1.00 COMMENT '速度倍率',
    `spawn_order` INT(11) NOT NULL DEFAULT 0 COMMENT '生成顺序（越小越先生成）',
    `status` INT(11) NOT NULL DEFAULT 1 COMMENT '状态（0-禁用，1-启用）',
    `create_time` BIGINT(20) DEFAULT NULL COMMENT '创建时间（毫秒时间戳）',
    `update_time` BIGINT(20) DEFAULT NULL COMMENT '更新时间（毫秒时间戳）',
    `deleted` INT(11) NOT NULL DEFAULT 0 COMMENT '逻辑删除（0-未删，1-已删）',
    `version` BIGINT(20) NOT NULL DEFAULT 1 COMMENT '版本号（乐观锁）',
    PRIMARY KEY (`id`),
    KEY `idx_wave_id` (`wave_id`),
    KEY `idx_enemy_id` (`enemy_id`),
    KEY `idx_spawn_order` (`spawn_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='波次敌人配置表';

-- ============================================
-- 6. 游戏记录表
-- ============================================
DROP TABLE IF EXISTS `td_game_record`;
CREATE TABLE `td_game_record` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `user_id` BIGINT(20) NOT NULL COMMENT '玩家用户ID',
    `map_id` BIGINT(20) NOT NULL COMMENT '使用的地图ID',
    `max_wave_reached` INT(11) NOT NULL DEFAULT 0 COMMENT '最高到达波数',
    `total_gold_earned` INT(11) NOT NULL DEFAULT 0 COMMENT '总获得金币',
    `total_damage_dealt` INT(11) NOT NULL DEFAULT 0 COMMENT '总造成伤害',
    `enemies_killed` INT(11) NOT NULL DEFAULT 0 COMMENT '击杀敌人数量',
    `towers_built` INT(11) NOT NULL DEFAULT 0 COMMENT '建造塔数量',
    `game_status` INT(11) NOT NULL DEFAULT 0 COMMENT '游戏状态（1-进行中，4-胜利，5-失败）',
    `play_time` BIGINT(20) NOT NULL DEFAULT 0 COMMENT '游戏时长（毫秒）',
    `status` INT(11) NOT NULL DEFAULT 1 COMMENT '状态（0-禁用，1-启用）',
    `create_time` BIGINT(20) DEFAULT NULL COMMENT '创建时间（毫秒时间戳）',
    `update_time` BIGINT(20) DEFAULT NULL COMMENT '更新时间（毫秒时间戳）',
    `deleted` INT(11) NOT NULL DEFAULT 0 COMMENT '逻辑删除（0-未删，1-已删）',
    `version` BIGINT(20) NOT NULL DEFAULT 1 COMMENT '版本号（乐观锁）',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_map_id` (`map_id`),
    KEY `idx_max_wave` (`max_wave_reached`),
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='游戏记录表';

-- ============================================
-- 7. 防御布局表
-- ============================================
DROP TABLE IF EXISTS `td_layout`;
CREATE TABLE `td_layout` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `user_id` BIGINT(20) NOT NULL COMMENT '布局所属用户ID',
    `map_id` BIGINT(20) NOT NULL COMMENT '关联地图ID',
    `name` VARCHAR(100) NOT NULL DEFAULT '' COMMENT '布局名称',
    `layout_data` LONGTEXT COMMENT '布局数据（JSON数组，存储塔位置和等级）',
    `share_code` VARCHAR(20) DEFAULT NULL COMMENT '分享码（唯一，用于导入）',
    `download_count` INT(11) NOT NULL DEFAULT 0 COMMENT '下载/使用次数',
    `is_public` INT(11) NOT NULL DEFAULT 0 COMMENT '是否公开（0-私有，1-公开）',
    `status` INT(11) NOT NULL DEFAULT 1 COMMENT '状态（0-禁用，1-启用）',
    `create_time` BIGINT(20) DEFAULT NULL COMMENT '创建时间（毫秒时间戳）',
    `update_time` BIGINT(20) DEFAULT NULL COMMENT '更新时间（毫秒时间戳）',
    `deleted` INT(11) NOT NULL DEFAULT 0 COMMENT '逻辑删除（0-未删，1-已删）',
    `version` BIGINT(20) NOT NULL DEFAULT 1 COMMENT '版本号（乐观锁）',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_share_code` (`share_code`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_map_id` (`map_id`),
    KEY `idx_is_public` (`is_public`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='防御布局表';

-- ============================================
-- 初始化数据
-- ============================================

-- 初始化塔数据
INSERT INTO `td_tower` (`id`, `name`, `tower_type`, `description`, `base_cost`, `base_damage`, `base_attack_speed`, `base_range`, `upgrade_cost`, `damage_upgrade_rate`, `attack_speed_upgrade_rate`, `range_upgrade`, `color`, `special_effect`, `unlock_wave`, `status`, `create_time`, `update_time`, `deleted`, `version`) VALUES
(1, '箭塔', 1, '基础塔，攻击速度快，伤害中等', 50, 15, 2.00, 3, 30, 1.30, 1.15, 0, '#4a9eff', '快速攻击单个敌人', 0, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1),
(2, '炮塔', 2, '高伤害，低攻速，范围伤害', 80, 40, 0.80, 2, 50, 1.40, 1.10, 0, '#ff9500', '爆炸伤害周围敌人', 0, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1),
(3, '魔法塔', 3, '魔法伤害，无视护甲', 100, 25, 1.20, 4, 60, 1.35, 1.10, 1, '#9c27b0', '魔法攻击，无视护甲', 2, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1),
(4, '激光塔', 4, '超高攻速，持续伤害', 150, 8, 5.00, 3, 80, 1.25, 1.20, 0, '#00bcd4', '持续激光攻击', 4, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1),
(5, '冰冻塔', 5, '减速敌人，降低移动速度', 120, 10, 1.50, 3, 70, 1.20, 1.10, 0, '#2196f3', '攻击附带减速效果', 3, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1);

-- 初始化敌人数据
INSERT INTO `td_enemy` (`id`, `name`, `enemy_type`, `description`, `base_hp`, `base_speed`, `speed_multiplier`, `reward`, `color`, `armor`, `magic_resistance`, `special_ability`, `status`, `create_time`, `update_time`, `deleted`, `version`) VALUES
(1, '小兵', 1, '普通敌人，各项属性均衡', 80, 2, 1.00, 10, '#ff6b6b', 0, 0.00, '无特殊能力', 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1),
(2, '斥候', 2, '移动速度快，但血量较低', 50, 4, 1.00, 15, '#4ecdc4', 0, 0.00, '高机动性', 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1),
(3, '重甲兵', 3, '高血量高护甲，移动缓慢', 200, 1, 1.00, 25, '#95a5a6', 10, 0.00, '高护甲减免物理伤害', 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1),
(4, 'BOSS', 4, '强大的BOSS敌人', 500, 1, 1.00, 100, '#e74c3c', 20, 0.30, '高血量高护甲', 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1),
(5, '治疗兵', 5, '可以治疗周围友军', 100, 2, 1.00, 30, '#2ecc71', 0, 0.00, '定期治疗周围敌人', 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1);

-- 初始化默认地图（一个简单的20x15地图，S形路径）
INSERT INTO `td_map` (`id`, `name`, `description`, `map_width`, `map_height`, `tile_size`, `grid_data`, `path_data`, `start_gold`, `player_hp`, `total_waves`, `status`, `create_time`, `update_time`, `deleted`, `version`) VALUES
(1, '新手训练场', '适合新手入门的简单地图，路径呈S形', 20, 15, 40, 
'[2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,
3,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,2,
2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,2,
2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,2,
2,0,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,2,
2,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,2,
2,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,2,
2,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,2,
2,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,2,
2,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,
2,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,
2,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,
2,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,2,
2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,
2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]',
'[{"x":0,"y":1},{"x":1,"y":1},{"x":2,"y":1},{"x":3,"y":1},{"x":4,"y":1},{"x":5,"y":1},{"x":6,"y":1},{"x":7,"y":1},{"x":8,"y":1},
{"x":8,"y":2},{"x":8,"y":3},{"x":8,"y":4},
{"x":9,"y":4},{"x":10,"y":4},{"x":11,"y":4},{"x":12,"y":4},{"x":13,"y":4},{"x":14,"y":4},
{"x":14,"y":5},{"x":14,"y":6},{"x":14,"y":7},{"x":14,"y":8},
{"x":13,"y":8},{"x":12,"y":8},{"x":11,"y":8},{"x":10,"y":8},{"x":9,"y":8},{"x":8,"y":8},{"x":7,"y":8},{"x":6,"y":8},{"x":5,"y":8},{"x":4,"y":8},
{"x":4,"y":9},{"x":4,"y":10},{"x":4,"y":11},{"x":4,"y":12},
{"x":5,"y":12},{"x":6,"y":12},{"x":7,"y":12},{"x":8,"y":12},{"x":9,"y":12},{"x":10,"y":12},{"x":11,"y":12},{"x":12,"y":12},{"x":13,"y":12},{"x":14,"y":12},{"x":15,"y":12},{"x":16,"y":12},{"x":17,"y":12},{"x":18,"y":12}]',
100, 20, 10, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1);

-- 初始化波次数据（10波）
INSERT INTO `td_wave` (`id`, `map_id`, `wave_number`, `name`, `total_enemies`, `spawn_interval`, `difficulty_multiplier`, `bonus_gold`, `status`, `create_time`, `update_time`, `deleted`, `version`) VALUES
(1, 1, 1, '第一波：小兵来袭', 5, 1500, 1.00, 0, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1),
(2, 1, 2, '第二波：更多小兵', 8, 1200, 1.10, 10, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1),
(3, 1, 3, '第三波：斥候出现', 6, 1000, 1.20, 15, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1),
(4, 1, 4, '第四波：混合部队', 10, 1000, 1.30, 20, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1),
(5, 1, 5, '第五波：重甲兵', 4, 1500, 1.40, 30, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1),
(6, 1, 6, '第六波：大军压境', 12, 800, 1.50, 40, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1),
(7, 1, 7, '第七波：治疗兵登场', 8, 1000, 1.60, 50, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1),
(8, 1, 8, '第八波：精锐部队', 10, 900, 1.70, 60, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1),
(9, 1, 9, '第九波：BOSS前哨', 15, 700, 1.80, 80, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1),
(10, 1, 10, '第十波：BOSS来袭！', 3, 2000, 2.00, 200, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1);

-- 初始化波次敌人数据
INSERT INTO `td_wave_enemy` (`id`, `wave_id`, `enemy_id`, `count`, `hp_multiplier`, `speed_multiplier`, `spawn_order`, `status`, `create_time`, `update_time`, `deleted`, `version`) VALUES
(1, 1, 1, 5, 1.00, 1.00, 1, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1),
(2, 2, 1, 8, 1.10, 1.00, 1, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1),
(3, 3, 1, 4, 1.20, 1.00, 1, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1),
(4, 3, 2, 2, 1.00, 1.20, 2, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1),
(5, 4, 1, 6, 1.30, 1.00, 1, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1),
(6, 4, 2, 4, 1.10, 1.30, 2, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1),
(7, 5, 3, 4, 1.40, 1.00, 1, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1),
(8, 6, 1, 8, 1.50, 1.00, 1, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1),
(9, 6, 2, 4, 1.30, 1.40, 2, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1),
(10, 7, 1, 5, 1.60, 1.00, 1, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1),
(11, 7, 5, 3, 1.00, 1.00, 2, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1),
(12, 8, 1, 5, 1.70, 1.00, 1, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1),
(13, 8, 2, 3, 1.50, 1.50, 2, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1),
(14, 8, 3, 2, 1.80, 1.00, 3, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1),
(15, 9, 1, 8, 1.80, 1.00, 1, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1),
(16, 9, 2, 5, 1.60, 1.60, 2, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1),
(17, 9, 3, 2, 2.00, 1.00, 3, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1),
(18, 10, 4, 1, 2.50, 1.00, 1, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1),
(19, 10, 1, 2, 2.00, 1.00, 2, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000, 0, 1);
