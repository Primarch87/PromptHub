-- ============================================================
-- Database: ai_prompt_optimization_system
-- Engine:   InnoDB (all tables)
-- Schema-only — no sample data
-- ============================================================

DROP DATABASE IF EXISTS ai_prompt_optimization_system;
CREATE DATABASE ai_prompt_optimization_system;
USE ai_prompt_optimization_system;

-- 1. users
CREATE TABLE users (
    user_id           INT AUTO_INCREMENT PRIMARY KEY,
    username          VARCHAR(100) UNIQUE NOT NULL,
    email             VARCHAR(150) UNIQUE NOT NULL,
    password_hash     VARCHAR(255) NOT NULL,
    registration_date DATETIME NOT NULL,
    reputation_score  INT DEFAULT 0,
    bio               TEXT,
    is_verified       BOOLEAN DEFAULT FALSE
) ENGINE=InnoDB;

-- 2. category
CREATE TABLE category (
    category_id   INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    description   TEXT,
    is_active     BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

-- 3. prompts
CREATE TABLE prompts (
    prompt_id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id            INT NOT NULL,
    category_id        INT NOT NULL,
    title              VARCHAR(200) NOT NULL,
    prompt_text        TEXT NOT NULL,
    description        TEXT,
    average_rating     DECIMAL(3,2) DEFAULT 0,
    created_date       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_public          BOOLEAN DEFAULT TRUE,
    INDEX idx_user_id (user_id),
    INDEX idx_category_id (category_id),
    FOREIGN KEY (user_id)     REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (category_id) REFERENCES category(category_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 4. prompt_version
CREATE TABLE prompt_version (
    version_id         INT AUTO_INCREMENT PRIMARY KEY,
    prompt_id          INT NOT NULL,
    version_number     INT NOT NULL,
    prompt_text        TEXT NOT NULL,
    created_by         INT NOT NULL,
    created_date       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    change_description TEXT,
    UNIQUE (prompt_id, version_number),
    FOREIGN KEY (prompt_id)  REFERENCES prompts(prompt_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 5. ratings
CREATE TABLE ratings (
    rating_id    INT AUTO_INCREMENT PRIMARY KEY,
    prompt_id    INT NOT NULL,
    user_id      INT NOT NULL,
    rating_value TINYINT NOT NULL,
    rated_date   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, prompt_id),
    INDEX idx_ratings_user (user_id),
    INDEX idx_ratings_prompt (prompt_id),
    FOREIGN KEY (prompt_id) REFERENCES prompts(prompt_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (user_id)   REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 6. comments
CREATE TABLE comments (
    comment_id        INT AUTO_INCREMENT PRIMARY KEY,
    prompt_id         INT NOT NULL,
    user_id           INT NOT NULL,
    comment_text      TEXT NOT NULL,
    created_date      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    parent_comment_id INT,
    upvotes           INT DEFAULT 0,
    downvotes         INT DEFAULT 0,
    INDEX idx_comments_prompt (prompt_id),
    FOREIGN KEY (prompt_id)         REFERENCES prompts(prompt_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (user_id)           REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES comments(comment_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 7. tags
CREATE TABLE tags (
    tag_id      INT AUTO_INCREMENT PRIMARY KEY,
    tag_name    VARCHAR(100) UNIQUE NOT NULL,
    usage_count INT DEFAULT 0
) ENGINE=InnoDB;

-- 8. prompt_tag
CREATE TABLE prompt_tag (
    prompt_id INT NOT NULL,
    tag_id    INT NOT NULL,
    PRIMARY KEY (prompt_id, tag_id),
    FOREIGN KEY (prompt_id) REFERENCES prompts(prompt_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (tag_id)    REFERENCES tags(tag_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 9. bookmarks
CREATE TABLE bookmarks (
    bookmark_id     INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    prompt_id       INT NOT NULL,
    bookmarked_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes           TEXT,
    FOREIGN KEY (user_id)   REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (prompt_id) REFERENCES prompts(prompt_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 10. ai_outputs
CREATE TABLE ai_outputs (
    output_id        INT AUTO_INCREMENT PRIMARY KEY,
    prompt_id        INT NOT NULL,
    version_id       INT NOT NULL,
    ai_model_used    VARCHAR(100) NOT NULL,
    output_text      TEXT NOT NULL,
    quality_rating   DECIMAL(3,2),
    execution_date   DATETIME NOT NULL,
    response_time_ms INT,
    FOREIGN KEY (prompt_id)  REFERENCES prompts(prompt_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (version_id) REFERENCES prompt_version(version_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;
