-- ============================================================
-- Triggers and Views for: ai_prompt_optimization_system
-- ============================================================

USE ai_prompt_optimization_system;

-- ────────────────────────────────────────────────────────────
-- TRIGGERS
-- ────────────────────────────────────────────────────────────

DELIMITER //

-- TRIGGER 1: update_avg_rating
-- Recalculates the average rating on a prompt after a new rating is inserted
CREATE TRIGGER update_avg_rating
AFTER INSERT ON ratings
FOR EACH ROW
BEGIN
    UPDATE prompts
    SET average_rating = (
        SELECT AVG(rating_value)
        FROM ratings
        WHERE prompt_id = NEW.prompt_id
    )
    WHERE prompt_id = NEW.prompt_id;
END;
//

-- TRIGGER 2: check_rating
-- Validates that rating_value is between 1 and 5 before insertion
CREATE TRIGGER check_rating
BEFORE INSERT ON ratings
FOR EACH ROW
BEGIN
    IF NEW.rating_value < 1 OR NEW.rating_value > 5 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid rating value';
    END IF;
END;
//

-- TRIGGER 3: increase_reputation
-- Awards 10 reputation points to a user when they create a new prompt
CREATE TRIGGER increase_reputation
AFTER INSERT ON prompts
FOR EACH ROW
BEGIN
    UPDATE users
    SET reputation_score = reputation_score + 10
    WHERE user_id = NEW.user_id;
END;
//

DELIMITER ;

-- ────────────────────────────────────────────────────────────
-- VIEWS
-- ────────────────────────────────────────────────────────────

-- VIEW 1: Prompt_User_View
-- Shows each prompt title alongside its author's username
CREATE VIEW Prompt_User_View AS
SELECT p.title, u.username
FROM prompts p
JOIN users u ON p.user_id = u.user_id;

-- VIEW 2: High_Rated_Prompts
-- Lists prompts with an average rating of 4 or above
CREATE VIEW High_Rated_Prompts AS
SELECT prompt_id, average_rating
FROM prompts
WHERE average_rating >= 4;

-- VIEW 3: Full_Details_View
-- Combines username, prompt title, and individual rating value
CREATE VIEW Full_Details_View AS
SELECT u.username, p.title, r.rating_value
FROM ratings r
JOIN users u ON r.user_id = u.user_id
JOIN prompts p ON r.prompt_id = p.prompt_id;
