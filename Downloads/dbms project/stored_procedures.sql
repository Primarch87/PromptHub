-- ============================================================
-- Stored Procedures (with Cursors) for: ai_prompt_optimization_system
-- ============================================================

USE ai_prompt_optimization_system;

-- ────────────────────────────────────────────────────────────
-- PROCEDURE 1: show_users
-- Iterates through all users and selects each username
-- ────────────────────────────────────────────────────────────
DROP PROCEDURE IF EXISTS show_users;

DELIMITER //

CREATE PROCEDURE show_users()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE uname VARCHAR(100);

    DECLARE user_cursor CURSOR FOR
        SELECT username FROM users;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN user_cursor;

    read_loop: LOOP
        FETCH user_cursor INTO uname;
        IF done THEN
            LEAVE read_loop;
        END IF;

        SELECT uname AS username;

    END LOOP;

    CLOSE user_cursor;
END;
//

DELIMITER ;

-- ────────────────────────────────────────────────────────────
-- PROCEDURE 2: update_reputation
-- Adds 5 reputation points to every user using a cursor
-- ────────────────────────────────────────────────────────────
DROP PROCEDURE IF EXISTS update_reputation;

DELIMITER //

CREATE PROCEDURE update_reputation()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE uid INT;

    DECLARE user_cursor CURSOR FOR
        SELECT user_id FROM users;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN user_cursor;

    read_loop: LOOP
        FETCH user_cursor INTO uid;
        IF done THEN
            LEAVE read_loop;
        END IF;

        UPDATE users
        SET reputation_score = reputation_score + 5
        WHERE user_id = uid;

    END LOOP;

    CLOSE user_cursor;
END;
//

DELIMITER ;

-- ────────────────────────────────────────────────────────────
-- PROCEDURE 3: count_ratings
-- Counts total ratings using a cursor and returns the count
-- ────────────────────────────────────────────────────────────
DROP PROCEDURE IF EXISTS count_ratings;

DELIMITER //

CREATE PROCEDURE count_ratings()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE rid INT;
    DECLARE total INT DEFAULT 0;

    DECLARE rating_cursor CURSOR FOR
        SELECT rating_id FROM ratings;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN rating_cursor;

    read_loop: LOOP
        FETCH rating_cursor INTO rid;
        IF done THEN
            LEAVE read_loop;
        END IF;

        SET total = total + 1;

    END LOOP;

    CLOSE rating_cursor;

    SELECT total AS total_ratings;
END;
//

DELIMITER ;
