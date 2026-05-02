CREATE TABLE `iot_device` (
    `id` bigint AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `device_name` varchar(100) NOT NULL COMMENT '设备名称',
    `device_type` int NOT NULL COMMENT '设备类型(1-灯光,2-空调,3-窗帘,4-插座,5-传感器,6-门锁)',
    `device_code` varchar(50) UNIQUE NOT NULL COMMENT '设备编码',
    `status` int DEFAULT 0 COMMENT '设备状态(0-离线,1-在线)',
    `power_status` int DEFAULT 0 COMMENT '电源状态(0-关闭,1-开启)',
    `brightness` int DEFAULT 100 COMMENT '亮度(0-100)',
    `temperature` decimal(5,2) DEFAULT 25.00 COMMENT '温度',
    `humidity` decimal(5,2) DEFAULT 50.00 COMMENT '湿度',
    `position` varchar(200) COMMENT '设备位置',
    `room_id` bigint COMMENT '所属房间ID',
    `create_time` bigint NULL COMMENT '创建时间',
    `update_time` bigint NULL COMMENT '更新时间',
    `deleted` tinyint DEFAULT 0 NOT NULL COMMENT '逻辑删除',
    `version` bigint DEFAULT 1 NOT NULL COMMENT '版本号',
    INDEX `idx_device_type` (`device_type`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='物联网设备表';

CREATE TABLE `room` (
    `id` bigint AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `room_name` varchar(100) NOT NULL COMMENT '房间名称',
    `room_type` int DEFAULT 1 COMMENT '房间类型(1-客厅,2-卧室,3-厨房,4-卫生间,5-书房)',
    `floor` int DEFAULT 1 COMMENT '楼层',
    `create_time` bigint NULL COMMENT '创建时间',
    `update_time` bigint NULL COMMENT '更新时间',
    `deleted` tinyint DEFAULT 0 NOT NULL COMMENT '逻辑删除',
    `version` bigint DEFAULT 1 NOT NULL COMMENT '版本号'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='房间表';

CREATE TABLE `scene` (
    `id` bigint AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `scene_name` varchar(100) NOT NULL COMMENT '场景名称',
    `description` varchar(500) COMMENT '场景描述',
    `icon` varchar(200) COMMENT '场景图标',
    `status` int DEFAULT 1 COMMENT '场景状态(0-禁用,1-启用)',
    `is_default` int DEFAULT 0 COMMENT '是否默认场景(0-否,1-是)',
    `create_time` bigint NULL COMMENT '创建时间',
    `update_time` bigint NULL COMMENT '更新时间',
    `deleted` tinyint DEFAULT 0 NOT NULL COMMENT '逻辑删除',
    `version` bigint DEFAULT 1 NOT NULL COMMENT '版本号'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='场景表';

CREATE TABLE `scene_trigger` (
    `id` bigint AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `scene_id` bigint NOT NULL COMMENT '场景ID',
    `trigger_type` int NOT NULL COMMENT '触发类型(1-定时,2-设备状态变化,3-传感器触发,4-手动触发)',
    `trigger_condition` text COMMENT '触发条件(JSON格式)',
    `trigger_order` int DEFAULT 0 COMMENT '触发顺序',
    `create_time` bigint NULL COMMENT '创建时间',
    `update_time` bigint NULL COMMENT '更新时间',
    `deleted` tinyint DEFAULT 0 NOT NULL COMMENT '逻辑删除',
    `version` bigint DEFAULT 1 NOT NULL COMMENT '版本号',
    INDEX `idx_scene_id` (`scene_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='场景触发器表';

CREATE TABLE `scene_action` (
    `id` bigint AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `scene_id` bigint NOT NULL COMMENT '场景ID',
    `action_type` int NOT NULL COMMENT '动作类型(1-设备控制,2-发送通知,3-执行脚本)',
    `target_device_id` bigint COMMENT '目标设备ID',
    `action_params` text COMMENT '动作参数(JSON格式)',
    `action_delay` int DEFAULT 0 COMMENT '延迟执行时间(毫秒)',
    `action_order` int DEFAULT 0 COMMENT '动作顺序',
    `create_time` bigint NULL COMMENT '创建时间',
    `update_time` bigint NULL COMMENT '更新时间',
    `deleted` tinyint DEFAULT 0 NOT NULL COMMENT '逻辑删除',
    `version` bigint DEFAULT 1 NOT NULL COMMENT '版本号',
    INDEX `idx_scene_id` (`scene_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='场景动作表';

CREATE TABLE `schedule_task` (
    `id` bigint AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `task_name` varchar(100) NOT NULL COMMENT '任务名称',
    `task_type` int NOT NULL COMMENT '任务类型(1-定时执行,2-循环执行,3-倒计时)',
    `cron_expression` varchar(100) COMMENT 'Cron表达式',
    `start_time` bigint COMMENT '开始时间',
    `end_time` bigint COMMENT '结束时间',
    `repeat_interval` int COMMENT '重复间隔(秒)',
    `repeat_count` int COMMENT '重复次数',
    `target_scene_id` bigint COMMENT '关联场景ID',
    `status` int DEFAULT 1 COMMENT '任务状态(0-禁用,1-启用)',
    `last_run_time` bigint COMMENT '最后执行时间',
    `next_run_time` bigint COMMENT '下次执行时间',
    `create_time` bigint NULL COMMENT '创建时间',
    `update_time` bigint NULL COMMENT '更新时间',
    `deleted` tinyint DEFAULT 0 NOT NULL COMMENT '逻辑删除',
    `version` bigint DEFAULT 1 NOT NULL COMMENT '版本号',
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='定时任务表';

CREATE TABLE `linkage_rule` (
    `id` bigint AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `rule_name` varchar(100) NOT NULL COMMENT '规则名称',
    `rule_description` varchar(500) COMMENT '规则描述',
    `trigger_device_id` bigint NOT NULL COMMENT '触发设备ID',
    `trigger_condition` text COMMENT '触发条件(JSON格式)',
    `action_device_id` bigint NOT NULL COMMENT '动作设备ID',
    `action_params` text COMMENT '动作参数(JSON格式)',
    `status` int DEFAULT 1 COMMENT '规则状态(0-禁用,1-启用)',
    `priority` int DEFAULT 5 COMMENT '优先级(1-最高,10-最低)',
    `create_time` bigint NULL COMMENT '创建时间',
    `update_time` bigint NULL COMMENT '更新时间',
    `deleted` tinyint DEFAULT 0 NOT NULL COMMENT '逻辑删除',
    `version` bigint DEFAULT 1 NOT NULL COMMENT '版本号',
    INDEX `idx_trigger_device` (`trigger_device_id`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='联动规则表';

CREATE TABLE `energy_record` (
    `id` bigint AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `device_id` bigint NOT NULL COMMENT '设备ID',
    `energy_consumed` decimal(10,4) NOT NULL COMMENT '消耗电量(度)',
    `record_time` bigint NOT NULL COMMENT '记录时间',
    `create_time` bigint NULL COMMENT '创建时间',
    `update_time` bigint NULL COMMENT '更新时间',
    `deleted` tinyint DEFAULT 0 NOT NULL COMMENT '逻辑删除',
    `version` bigint DEFAULT 1 NOT NULL COMMENT '版本号',
    INDEX `idx_device_id` (`device_id`),
    INDEX `idx_record_time` (`record_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='能耗记录表';

CREATE TABLE `alert_record` (
    `id` bigint AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `device_id` bigint NOT NULL COMMENT '设备ID',
    `alert_type` int NOT NULL COMMENT '告警类型(1-设备离线,2-设备故障,3-电量异常,4-温湿度异常,5-安全告警)',
    `alert_level` int DEFAULT 2 COMMENT '告警级别(1-紧急,2-重要,3-普通)',
    `alert_message` varchar(500) NOT NULL COMMENT '告警消息',
    `alert_time` bigint NOT NULL COMMENT '告警时间',
    `status` int DEFAULT 0 COMMENT '处理状态(0-未处理,1-已处理,2-已忽略)',
    `create_time` bigint NULL COMMENT '创建时间',
    `update_time` bigint NULL COMMENT '更新时间',
    `deleted` tinyint DEFAULT 0 NOT NULL COMMENT '逻辑删除',
    `version` bigint DEFAULT 1 NOT NULL COMMENT '版本号',
    INDEX `idx_device_id` (`device_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_alert_level` (`alert_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='告警记录表';