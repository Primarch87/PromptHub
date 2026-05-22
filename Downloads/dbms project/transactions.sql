-- ============================================================
-- Transaction Scripts for: ai_prompt_optimization_system
-- Demonstrates: START TRANSACTION, SAVEPOINT, COMMIT, ROLLBACK
-- ============================================================

USE ai_prompt_optimization_system;

-- =========================
-- TRANSACTION 1: Create New Prompt with Version History
-- =========================

START TRANSACTION;

-- Step 1: Insert a new prompt
INSERT INTO prompts (user_id, category_id, title, prompt_text, description, is_public)
VALUES (1, 1, 'Summarize Research Paper', 'Summarize the following research paper...', 'Academic summarization', TRUE);

SAVEPOINT after_prompt_insert;

-- Step 2: Create initial version history for the new prompt
INSERT INTO prompt_version (prompt_id, version_number, prompt_text, created_by, created_date, change_description)
VALUES (LAST_INSERT_ID(), 1, 'Summarize the following research paper...', 1, NOW(), 'Initial version');

SAVEPOINT after_version_insert;

-- Step 3: Reward the author with reputation points
UPDATE users
SET reputation_score = reputation_score + 10
WHERE user_id = 1;

COMMIT;

-- =========================
-- TRANSACTION 2: Submit Rating and Handle Duplicate
-- =========================

START TRANSACTION;

-- Step 1: Insert a valid new rating (user 5 has not rated prompt 1 yet)
INSERT INTO ratings (prompt_id, user_id, rating_value, rated_date)
VALUES (1, 5, 5, NOW());

SAVEPOINT after_rating_insert;

-- Step 2: Attempt duplicate rating (same user_id + prompt_id → UNIQUE violation)
-- This statement will fail; we roll back to the savepoint
INSERT INTO ratings (prompt_id, user_id, rating_value, rated_date)
VALUES (1, 5, 4, NOW());

ROLLBACK TO after_rating_insert;

-- Step 3: Recalculate the average rating for the prompt
UPDATE prompts
SET average_rating = (
    SELECT AVG(rating_value)
    FROM ratings
    WHERE prompt_id = 1
)
WHERE prompt_id = 1;

COMMIT;

-- =========================
-- TRANSACTION 3: Post Comment and Reply
-- =========================

START TRANSACTION;

-- Step 1: Post a new top-level comment
INSERT INTO comments (prompt_id, user_id, comment_text, created_date)
VALUES (2, 1, 'This is a great prompt!', NOW());

SAVEPOINT after_comment_insert;

-- Step 2: Post a reply to the comment above
INSERT INTO comments (prompt_id, user_id, comment_text, created_date, parent_comment_id)
VALUES (2, 2, 'I agree with this!', NOW(), LAST_INSERT_ID());

SAVEPOINT after_reply_insert;

-- Step 3: Attempt an invalid comment (prompt_id 999 does not exist → FK violation)
-- This statement will fail; we roll back to the savepoint
INSERT INTO comments (prompt_id, user_id, comment_text, created_date)
VALUES (999, 1, 'Invalid comment', NOW());

ROLLBACK TO after_reply_insert;

COMMIT;

-- =========================
-- TRANSACTION 4: Update Version and AI Output
-- =========================

START TRANSACTION;

-- Step 1: Add a new version for prompt 1
INSERT INTO prompt_version (prompt_id, version_number, prompt_text, created_by, created_date, change_description)
VALUES (1, 3, 'Improved summarization prompt...', 1, NOW(), 'Enhanced version');

SAVEPOINT after_version_update;

-- Step 2: Record AI output linked to the new version
INSERT INTO ai_outputs (prompt_id, version_id, ai_model_used, output_text, execution_date)
VALUES (1, LAST_INSERT_ID(), 'GPT-4', 'Sample output...', NOW());

SAVEPOINT after_output_insert;

-- Step 3: Attempt an invalid AI output (version_id 9999 does not exist → FK violation)
-- This statement will fail; we roll back to the savepoint
INSERT INTO ai_outputs (prompt_id, version_id, ai_model_used, output_text, execution_date)
VALUES (1, 9999, 'GPT-4', 'Invalid output...', NOW());

ROLLBACK TO after_output_insert;

COMMIT;

-- =========================
-- TRANSACTION 5: Bulk Tag Reset with Rollback
-- =========================

START TRANSACTION;

-- Step 1: View current tag usage counts
SELECT tag_id, tag_name, usage_count FROM tags;

-- Step 2: Reset all usage counts to zero
UPDATE tags SET usage_count = 0;

-- Step 3: Verify the reset
SELECT tag_id, tag_name, usage_count FROM tags;

-- Step 4: Roll back — undo the reset and restore original counts
ROLLBACK;

-- Step 5: Confirm original data is restored
SELECT tag_id, tag_name, usage_count FROM tags;
