-- bhima test databse
-- these  values are inserted under the testing database bhima_test

USE bhima_test;

-- create a user with the username + password 'bhima-test-user'
INSERT INTO user (id, username, password, first, last, email) VALUES
(1, 'SuperUser', PASSWORD('SuperUser'), 'Super', 'User', 'SuperUser@test.org'),
(2, 'RegularUser', PASSWORD('RegularUser'), 'Regular', 'User', 'RegUser@test.org'),
(3, 'NoUserPermissions', PASSWORD('NoUserPermissions'), 'No', 'Permissions', 'Invalid@test.org');

INSERT INTO permission (unit_id, user_id) VALUES (1, 1),
(2, 1),
(4, 1),
(5, 1),
(6, 1),
(7, 1),
(8, 1),
(9, 1),
(10, 1),
(11, 1),
(12, 1),
(13, 1),
(14, 1),
(15, 1),
(16, 1),
(17, 1),
(18, 1),
(19, 1),
(20, 1),
(21, 1),
(22, 1),
(23, 1),
(24, 1),
(25, 1),
(26, 1),
(27, 1),
(28, 1),
(29, 1),
(30, 1),
(31, 1),
(32, 1),
(34, 1),
(35, 1),
(36, 1),
(37, 1),
(38, 1),
(1, 1),
(40, 1),
(41, 1),
(42, 1),
(43, 1),
(44, 1),
(45, 1),
(46, 1),
(48, 1),
(49, 1),
(50, 1),
(51, 1),
(53, 1),
(54, 1),
(55, 1),
(56, 1),
(57, 1),
(58, 1),
(59, 1),
(60, 1),
(61, 1),
(62, 1),
(63, 1),
(64, 1),
(65, 1),
(66, 1),
(67, 1),
(68, 1),
(69, 1),
(70, 1),
(71, 1),
(72, 1),
(73, 1),
(74, 1),
(75, 1),
(76, 1),
(77, 1),
(78, 1),
(79, 1),
(80, 1),
(81, 1),
(82, 1),
(83, 1),
(84, 1),
(85, 1),
(86, 1),
(87, 1),
(88, 1),
(89, 1),
(90, 1),
(92, 1),
(92, 1),
(93, 1),
(97, 1),
(98, 1),
(99, 1),
(100, 1),
(101, 1),
(102, 1),
(103, 1),
(105, 1),
(106, 1),
(107, 1),
(108, 1),
(109, 1),
(110, 1),
(111, 1),
(112, 1),
(113, 1),
(114, 1);

-- give bhima-test-user permission to both projects
INSERT INTO project_permission (project_id, user_id) VALUES
(1, 1),
(2, 1);