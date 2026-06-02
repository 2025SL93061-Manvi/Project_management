-- ─────────────────────────────────────────────────────────────
-- Enterprise Project Manager  –  Seed / Initial Data
-- This file runs automatically on startup (Spring Boot picks it up)
-- Tables are created by Hibernate first, then this data is inserted
-- ─────────────────────────────────────────────────────────────

-- Prevent duplicate inserts on every restart
SET NAMES utf8mb4;

-- ─────────────────────────────────────────────
-- 1. USERS
-- Roles: ADMIN, MANAGER, DEVELOPER
-- Password for all users = "password123"
-- ─────────────────────────────────────────────
INSERT IGNORE INTO users (id, name, email, password, role, enabled, created_at)
VALUES
(1, 'Alex Carter',    'admin@epm.com',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN',     true, NOW()),
(2, 'Alice Johnson',   'alice@epm.com',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'MANAGER',   true, NOW()),
(3, 'Mark Spencer',    'mark@epm.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'MANAGER',   true, NOW()),
(4, 'Bob Williams',    'bob@epm.com',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'DEVELOPER', true, NOW()),
(5, 'Sara Patel',      'sara@epm.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'DEVELOPER', true, NOW());

-- ─────────────────────────────────────────────
-- 2. PROJECTS
-- Status: PLANNING, ACTIVE, ON_HOLD, COMPLETED
-- ─────────────────────────────────────────────
INSERT IGNORE INTO projects (id, name, description, status, start_date, end_date, owner_id, created_at)
VALUES
(1, 'Website Redesign',      'Redesign the company public website',          'ACTIVE',    '2024-01-15', '2024-06-30', 2, NOW()),
(2, 'Mobile App v2',         'Build the next version of the mobile app',     'PLANNING',  '2024-03-01', '2024-09-30', 2, NOW()),
(3, 'Data Migration',        'Migrate legacy data to new cloud database',     'ACTIVE',    '2024-02-01', '2024-05-31', 5, NOW()),
(4, 'HR Portal',             'Internal HR self-service portal',               'COMPLETED', '2023-06-01', '2023-12-31', 5, NOW()),
(5, 'Security Audit 2024',   'Annual security review and penetration test',   'PLANNING',  '2024-04-01', '2024-04-30', 2, NOW());

-- ─────────────────────────────────────────────
-- 3. PROJECT MEMBERS  (who is on which project)
-- ─────────────────────────────────────────────
INSERT IGNORE INTO project_members (project_id, user_id)
VALUES
(1, 2), (1, 3), (1, 4),   -- Website Redesign: Alice, Bob, Carol
(2, 2), (2, 3),            -- Mobile App: Alice, Bob
(3, 5), (3, 4),            -- Data Migration: Dave, Carol
(4, 5), (4, 3),            -- HR Portal: Dave, Bob
(5, 2), (5, 4);            -- Security Audit: Alice, Carol

-- ─────────────────────────────────────────────
-- 4. TASKS
-- Status: TODO, IN_PROGRESS, DONE
-- Priority: LOW, MEDIUM, HIGH
-- ─────────────────────────────────────────────
INSERT IGNORE INTO tasks (id, title, description, status, priority, start_date, end_date, project_id, assigned_to_id, created_at)
VALUES
-- Website Redesign tasks
(1,  'Design wireframes',        'Create low-fi wireframes for all pages',   'DONE',        'HIGH',   '2024-01-15', '2024-01-25', 1, 3, NOW()),
(2,  'Build homepage',           'Implement responsive homepage in React',    'IN_PROGRESS', 'HIGH',   '2024-01-26', '2024-02-15', 1, 3, NOW()),
(3,  'Write content',            'Draft copy for About and Services pages',   'TODO',        'MEDIUM', '2024-02-01', '2024-02-20', 1, 4, NOW()),
(4,  'SEO setup',                'Configure meta tags and sitemap',           'TODO',        'LOW',    '2024-02-20', '2024-03-01', 1, 4, NOW()),

-- Mobile App tasks
(5,  'Requirements gathering',   'Collect requirements from stakeholders',    'DONE',        'HIGH',   '2024-03-01', '2024-03-10', 2, 2, NOW()),
(6,  'UI design',                'Design screens in Figma',                   'IN_PROGRESS', 'HIGH',   '2024-03-11', '2024-04-01', 2, 3, NOW()),
(7,  'Backend API',              'Build REST endpoints for mobile app',        'TODO',        'HIGH',   '2024-04-01', '2024-06-01', 2, 3, NOW()),

-- Data Migration tasks
(8,  'Audit existing data',      'Map all legacy tables and columns',         'DONE',        'HIGH',   '2024-02-01', '2024-02-10', 3, 4, NOW()),
(9,  'Write migration scripts',  'SQL scripts to transform and load data',    'IN_PROGRESS', 'HIGH',   '2024-02-11', '2024-03-15', 3, 4, NOW()),
(10, 'Test migration',           'Validate data integrity after migration',   'TODO',        'HIGH',   '2024-03-16', '2024-04-15', 3, 5, NOW());

-- ─────────────────────────────────────────────
-- 5. MILESTONES
-- ─────────────────────────────────────────────
INSERT IGNORE INTO milestones (id, title, due_date, completed, project_id, created_at)
VALUES
(1, 'Design Approval',          '2024-01-28', true,  1, NOW()),
(2, 'Beta Launch',              '2024-03-15', false, 1, NOW()),
(3, 'Go Live',                  '2024-06-30', false, 1, NOW()),
(4, 'App Prototype Ready',      '2024-04-15', false, 2, NOW()),
(5, 'Migration Complete',       '2024-04-30', false, 3, NOW()),
(6, 'Security Report Delivered','2024-04-30', false, 5, NOW());

-- ─────────────────────────────────────────────
-- 6. MEETINGS
-- ─────────────────────────────────────────────
INSERT IGNORE INTO meetings (id, title, description, meeting_date, location, project_id, organizer_id, created_at)
VALUES
(1, 'Kickoff Meeting',          'Project kickoff and intro',           '2024-01-15 10:00:00', 'Conference Room A', 1, 2, NOW()),
(2, 'Design Review',            'Review wireframes with stakeholders', '2024-01-26 14:00:00', 'Zoom',              1, 2, NOW()),
(3, 'Sprint Planning',          'Plan tasks for February sprint',      '2024-02-01 09:00:00', 'Conference Room B', 1, 2, NOW()),
(4, 'App Requirements Review',  'Review collected requirements',       '2024-03-12 11:00:00', 'Teams Call',        2, 2, NOW()),
(5, 'Migration Status Update',  'Weekly data migration check-in',      '2024-02-20 15:00:00', 'Zoom',              3, 5, NOW());

-- ─────────────────────────────────────────────
-- 7. HOLIDAYS  (Work Calendar)
-- ─────────────────────────────────────────────
INSERT IGNORE INTO holidays (id, name, holiday_date)
VALUES
(1,  'New Year''s Day',         '2024-01-01'),
(2,  'Martin Luther King Day',  '2024-01-15'),
(3,  'Presidents'' Day',        '2024-02-19'),
(4,  'Memorial Day',            '2024-05-27'),
(5,  'Independence Day',        '2024-07-04'),
(6,  'Labor Day',               '2024-09-02'),
(7,  'Thanksgiving Day',        '2024-11-28'),
(8,  'Day After Thanksgiving',  '2024-11-29'),
(9,  'Christmas Eve',           '2024-12-24'),
(10, 'Christmas Day',           '2024-12-25'),
(11, 'New Year''s Eve',         '2024-12-31');

-- ─────────────────────────────────────────────
-- 8. COMPLAINTS / INTERACTIONS  (Admin panel)
-- Status: OPEN, IN_REVIEW, RESOLVED
-- Type: COMPLAINT, FEEDBACK, QUERY
-- ─────────────────────────────────────────────
INSERT IGNORE INTO complaints (id, title, description, type, status, raised_by_id, created_at)
VALUES
(1, 'Login page slow',       'The login page takes 5+ seconds to load',  'COMPLAINT', 'OPEN',      3, NOW()),
(2, 'Add dark mode',         'Would be great to have a dark theme',       'FEEDBACK',  'IN_REVIEW', 4, NOW()),
(3, 'Cannot upload PDF',     'Getting error when uploading PDF files',    'COMPLAINT', 'RESOLVED',  3, NOW()),
(4, 'Calendar not loading',  'Work calendar shows blank on Firefox',      'COMPLAINT', 'OPEN',      4, NOW()),
(5, 'How to export report?', 'Where can I find the export button?',       'QUERY',     'RESOLVED',  3, NOW());
