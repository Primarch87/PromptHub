-- ============================================================
-- Sample Data for: ai_prompt_optimization_system
-- Insert order strictly follows foreign key dependencies
-- Explicit IDs used consistently for deterministic FK references
-- Columns with DEFAULT CURRENT_TIMESTAMP rely on the default
-- ============================================================

USE ai_prompt_optimization_system;

-- ────────────────────────────────────────────────────────────
-- 1. USERS
-- ────────────────────────────────────────────────────────────
INSERT INTO users (user_id, username, email, password_hash, registration_date, reputation_score, bio, is_verified) VALUES
(1, 'shresth',        'shresth@gmail.com',   'hashed_pw_1', CURRENT_TIMESTAMP, 120, NULL, TRUE),
(2, 'ai_dev',         'aidev@gmail.com',     'hashed_pw_2', CURRENT_TIMESTAMP,  85, NULL, FALSE),
(3, 'ananya_writer',  'ananya@gmail.com',    'hashed_pw_3', CURRENT_TIMESTAMP, 100, NULL, TRUE),
(4, 'tech_guru',      'techguru@gmail.com',  'hashed_pw_4', CURRENT_TIMESTAMP, 155, NULL, TRUE),
(5, 'student123',     'student@gmail.com',   'hashed_pw_5', CURRENT_TIMESTAMP,  25, NULL, FALSE);

-- ────────────────────────────────────────────────────────────
-- 2. CATEGORY
-- ────────────────────────────────────────────────────────────
INSERT INTO category (category_id, category_name, description, is_active) VALUES
(1, 'Coding',           'Programming prompts',              TRUE),
(2, 'Marketing',        'Ad content prompts',               TRUE),
(3, 'Content Writing',  'Blog and article prompts',         TRUE),
(4, 'Email Writing',    'Professional email prompts',       TRUE),
(5, 'Interview Prep',   'Interview preparation prompts',    TRUE),
(6, 'Productivity',     'Planning and productivity prompts', TRUE);

-- ────────────────────────────────────────────────────────────
-- 3. PROMPTS
--    created_date and last_modified_date use DEFAULT CURRENT_TIMESTAMP
-- ────────────────────────────────────────────────────────────
INSERT INTO prompts (prompt_id, user_id, category_id, title, prompt_text, description, average_rating, is_public) VALUES
(1, 1, 3, 'Blog Generator',        'Write a detailed blog on the given topic with an introduction, body, and conclusion.', 'Generates blog content',                          4.50, TRUE),
(2, 2, 1, 'Code Explainer',        'Explain this code line by line in simple terms.',                                      'Helps understand code',                           4.20, TRUE),
(3, 3, 2, 'Ad Copy Creator',       'Create a compelling ad copy for a product launch targeting young professionals.',       'Generates marketing ad copies',                   3.80, TRUE),
(4, 4, 4, 'Follow-Up Email',       'Write a professional follow-up email after a job interview.',                          'Creates polished follow-up emails',               4.70, TRUE),
(5, 1, 5, 'Mock Interview Q&A',    'Generate 10 common interview questions with ideal answers for a software engineer.',   'Prepares candidates for tech interviews',         4.30, TRUE),
(6, 5, 6, 'Weekly Planner',        'Create a structured weekly planner with time blocks for study and breaks.',            'Helps students plan their week',                  3.90, FALSE),
(7, 4, 1, 'SQL Query Builder',     'Generate an optimized SQL query for the described requirement.',                       'Builds SQL queries from natural language',        4.60, TRUE),
(8, 2, 3, 'LinkedIn Post Writer',  'Draft a professional LinkedIn post announcing a new project or achievement.',         'Creates engaging LinkedIn content',               4.10, TRUE);

-- ────────────────────────────────────────────────────────────
-- 4. TAGS
-- ────────────────────────────────────────────────────────────
INSERT INTO tags (tag_id, tag_name, usage_count) VALUES
( 1, 'AI',             12),
( 2, 'blogging',        8),
( 3, 'python',         15),
( 4, 'marketing',       6),
( 5, 'email',           9),
( 6, 'interview',       7),
( 7, 'productivity',    5),
( 8, 'sql',            10),
( 9, 'linkedin',        4),
(10, 'career',          3);

-- ────────────────────────────────────────────────────────────
-- 5. PROMPT_TAG  (composite PK — no AUTO_INCREMENT)
-- ────────────────────────────────────────────────────────────
INSERT INTO prompt_tag (prompt_id, tag_id) VALUES
(1,  1),   -- Blog Generator        → AI
(1,  2),   -- Blog Generator        → blogging
(2,  1),   -- Code Explainer        → AI
(2,  3),   -- Code Explainer        → python
(3,  4),   -- Ad Copy Creator       → marketing
(4,  5),   -- Follow-Up Email       → email
(4, 10),   -- Follow-Up Email       → career
(5,  6),   -- Mock Interview Q&A    → interview
(5, 10),   -- Mock Interview Q&A    → career
(6,  7),   -- Weekly Planner        → productivity
(7,  8),   -- SQL Query Builder     → sql
(7,  1),   -- SQL Query Builder     → AI
(8,  9),   -- LinkedIn Post Writer  → linkedin
(8,  2);   -- LinkedIn Post Writer  → blogging

-- ────────────────────────────────────────────────────────────
-- 6. PROMPT_VERSION
--    created_date uses DEFAULT CURRENT_TIMESTAMP
-- ────────────────────────────────────────────────────────────
INSERT INTO prompt_version (version_id, prompt_id, version_number, prompt_text, created_by, change_description) VALUES
( 1, 1, 1, 'Write a detailed blog on the given topic.',                                                                 1, 'Initial version'),
( 2, 1, 2, 'Write a detailed blog on the given topic with an introduction, body, and conclusion.',                      1, 'Added structure guidance'),
( 3, 2, 1, 'Explain this code.',                                                                                        2, 'Initial version'),
( 4, 2, 2, 'Explain this code line by line in simple terms.',                                                           2, 'Improved clarity'),
( 5, 3, 1, 'Create an ad copy for a product.',                                                                          3, 'Initial version'),
( 6, 3, 2, 'Create a compelling ad copy for a product launch targeting young professionals.',                           3, 'Added target audience'),
( 7, 4, 1, 'Write a follow-up email after an interview.',                                                               4, 'Initial version'),
( 8, 4, 2, 'Write a professional follow-up email after a job interview.',                                               4, 'Made tone more professional'),
( 9, 5, 1, 'Generate interview questions for a software engineer.',                                                     1, 'Initial version'),
(10, 5, 2, 'Generate 10 common interview questions with ideal answers for a software engineer.',                        1, 'Added answer expectations'),
(11, 6, 1, 'Create a weekly planner with time blocks for study and breaks.',                                            5, 'Initial version'),
(12, 7, 1, 'Generate an SQL query for the described requirement.',                                                      4, 'Initial version'),
(13, 7, 2, 'Generate an optimized SQL query for the described requirement.',                                            4, 'Emphasised optimization'),
(14, 8, 1, 'Draft a LinkedIn post announcing a new project or achievement.',                                            2, 'Initial version');

-- ────────────────────────────────────────────────────────────
-- 7. RATINGS
--    rated_date uses DEFAULT CURRENT_TIMESTAMP
-- ────────────────────────────────────────────────────────────
INSERT INTO ratings (rating_id, prompt_id, user_id, rating_value) VALUES
( 1, 1, 2, 5),
( 2, 1, 3, 4),
( 3, 1, 4, 5),
( 4, 2, 1, 4),
( 5, 2, 5, 4),
( 6, 3, 1, 3),
( 7, 3, 4, 4),
( 8, 4, 2, 5),
( 9, 4, 3, 5),
(10, 5, 3, 4),
(11, 5, 4, 5),
(12, 6, 1, 4),
(13, 7, 1, 5),
(14, 7, 2, 4),
(15, 8, 4, 4);

-- ────────────────────────────────────────────────────────────
-- 8. COMMENTS
--    created_date uses DEFAULT CURRENT_TIMESTAMP
--    Explicit comment_id required for parent_comment_id references
-- ────────────────────────────────────────────────────────────
INSERT INTO comments (comment_id, prompt_id, user_id, comment_text, parent_comment_id, upvotes, downvotes) VALUES
( 1, 1, 2, 'This blog prompt is super helpful!',                        NULL, 10, 0),
( 2, 1, 3, 'I agree, saved me a lot of time.',                          1,    5,  0),
( 3, 2, 1, 'Great for beginners learning Python.',                      NULL,  8, 1),
( 4, 2, 5, 'Would be nice if it also generated diagrams.',              3,    3,  0),
( 5, 3, 4, 'The ad copy tone could be more persuasive.',                NULL,  6, 2),
( 6, 4, 3, 'Used this after my interview — got the job!',               NULL, 15, 0),
( 7, 4, 1, 'Congrats! The prompt really nails the professional tone.',  6,    7,  0),
( 8, 5, 4, 'Good set of questions, covers DSA and system design.',      NULL,  9, 1),
( 9, 7, 2, 'This generated a perfect JOIN query for me.',               NULL, 12, 0),
(10, 7, 5, 'Can it handle subqueries and CTEs too?',                    9,    4,  1);

-- ────────────────────────────────────────────────────────────
-- 9. BOOKMARKS
--    bookmarked_date uses DEFAULT CURRENT_TIMESTAMP
-- ────────────────────────────────────────────────────────────
INSERT INTO bookmarks (bookmark_id, user_id, prompt_id, notes) VALUES
(1, 1, 2, 'Useful for quick code reviews'),
(2, 1, 4, 'Keep for next interview cycle'),
(3, 2, 1, 'Great blog prompt to reuse'),
(4, 3, 5, 'Share with classmates'),
(5, 3, 7, 'Handy for database assignments'),
(6, 4, 1, NULL),
(7, 4, 8, 'Use for monthly LinkedIn posts'),
(8, 5, 6, 'My weekly planning tool');

-- ────────────────────────────────────────────────────────────
-- 10. AI_OUTPUTS
-- ────────────────────────────────────────────────────────────
INSERT INTO ai_outputs (output_id, prompt_id, version_id, ai_model_used, output_text, quality_rating, execution_date, response_time_ms) VALUES
( 1, 1,  2, 'GPT-4',          'Here is a structured blog post on Artificial Intelligence trends in 2025...',           4.50, CURRENT_TIMESTAMP,  320),
( 2, 1,  2, 'Claude 3',       'Blog: The Rise of AI — An in-depth look at how AI is reshaping industries...',          4.30, CURRENT_TIMESTAMP,  280),
( 3, 2,  4, 'GPT-4',          'Line 1: This imports the os module... Line 2: This defines a function...',              4.20, CURRENT_TIMESTAMP,  150),
( 4, 2,  4, 'Gemini Pro',     'The code starts by importing necessary libraries and then defines a helper...',         3.90, CURRENT_TIMESTAMP,  200),
( 5, 3,  6, 'GPT-4',          'Introducing [Product] — the smarter way to work. Built for ambitious professionals.',   4.00, CURRENT_TIMESTAMP,  180),
( 6, 4,  8, 'Claude 3',       'Subject: Thank you for the opportunity. Dear Hiring Manager, I wanted to follow up...', 4.80, CURRENT_TIMESTAMP,  120),
( 7, 5, 10, 'GPT-4',          '1. Tell me about yourself... 2. Explain OOP concepts... 3. What is system design?...',  4.40, CURRENT_TIMESTAMP,  350),
( 8, 7, 13, 'Gemini Pro',     'SELECT u.username, COUNT(o.order_id) FROM users u JOIN orders o ON u.id = o.user_id...', 4.60, CURRENT_TIMESTAMP,  90),
( 9, 7, 13, 'GPT-4',          'SELECT users.name, orders.total FROM users INNER JOIN orders ON users.id = ...',         4.50, CURRENT_TIMESTAMP,  110),
(10, 8, 14, 'Claude 3',       'Excited to share that I just launched my latest project — a full-stack AI dashboard!',  4.10, CURRENT_TIMESTAMP,  140);
