CREATE DATABASE IF NOT EXISTS pixelcraft CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pixelcraft;

CREATE TABLE IF NOT EXISTS templates (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(120) NOT NULL,
    category VARCHAR(64) NOT NULL,
    cover_url VARCHAR(255) NOT NULL,
    description VARCHAR(500) NOT NULL,
    required_image_count INT NOT NULL,
    accepted_mime_types VARCHAR(255) NOT NULL,
    max_file_size_bytes BIGINT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_templates_category (category, sort_order)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS assets (
    id CHAR(36) PRIMARY KEY,
    user_id VARCHAR(80) NOT NULL,
    template_id VARCHAR(64) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(80) NOT NULL,
    size_bytes BIGINT NOT NULL,
    storage_path VARCHAR(600) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assets_template FOREIGN KEY (template_id) REFERENCES templates(id),
    INDEX idx_assets_user_created (user_id, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS creation_tasks (
    id CHAR(36) PRIMARY KEY,
    user_id VARCHAR(80) NOT NULL,
    template_id VARCHAR(64) NOT NULL,
    status VARCHAR(24) NOT NULL,
    stage VARCHAR(24) NOT NULL,
    progress INT NOT NULL DEFAULT 0,
    failure_stage VARCHAR(24) NULL,
    failure_reason VARCHAR(500) NULL,
    result_url VARCHAR(600) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tasks_template FOREIGN KEY (template_id) REFERENCES templates(id),
    INDEX idx_tasks_user_created (user_id, created_at),
    INDEX idx_tasks_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS task_assets (
    task_id CHAR(36) NOT NULL,
    asset_id CHAR(36) NOT NULL,
    slot_index INT NOT NULL,
    PRIMARY KEY (task_id, asset_id),
    UNIQUE KEY uk_task_slot (task_id, slot_index),
    CONSTRAINT fk_task_assets_task FOREIGN KEY (task_id) REFERENCES creation_tasks(id),
    CONSTRAINT fk_task_assets_asset FOREIGN KEY (asset_id) REFERENCES assets(id)
) ENGINE=InnoDB;

