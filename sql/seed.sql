-- Smart Campus Event & Resource Booking System
-- Database Seed Data (DML)
-- Database: smart_campus

USE smart_campus;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE APPROVAL_LOGS;
TRUNCATE TABLE BOOKING_RESOURCES;
TRUNCATE TABLE BOOKINGS;
TRUNCATE TABLE RESOURCES;
TRUNCATE TABLE VENUES;
TRUNCATE TABLE USERS;
TRUNCATE TABLE DEPARTMENTS;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Populate DEPARTMENTS
INSERT INTO DEPARTMENTS (dept_id, dept_name, code) VALUES
(1, 'Computer Science & Engineering', 'CSE'),
(2, 'Electronics & Communication', 'ECE'),
(3, 'Mechanical Engineering', 'MECH'),
(4, 'Campus Administration', 'ADMIN');

-- 2. Populate USERS
-- Password hash for 'password123'
INSERT INTO USERS (user_id, dept_id, email, password_hash, full_name, role) VALUES
(1, 1, 'angelo.cs@pes.edu', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQxGWCaeekCw6x9NTqCtu', 'Angelo CS062', 'STUDENT'),
(2, 1, 'aditya.cs@pes.edu', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQxGWCaeekCw6x9NTqCtu', 'Aditya CS031', 'FACULTY'),
(3, 1, 'hod.cs@pes.edu', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQxGWCaeekCw6x9NTqCtu', 'Dr. CS HOD', 'DEPT_ADMIN'),
(4, 4, 'superadmin@pes.edu', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQxGWCaeekCw6x9NTqCtu', 'Campus Director', 'SUPER_ADMIN');

-- 3. Populate VENUES
INSERT INTO VENUES (venue_id, dept_id, name, location, capacity, requires_approval) VALUES
(1, 1, 'Auditorium 1', 'CS Block Floor 2', 250, TRUE),
(2, 1, 'Seminar Hall B', 'CS Block Floor 1', 80, FALSE),
(3, 2, 'EC Seminar Hall', 'EC Block Floor 3', 120, TRUE),
(4, 4, 'Open Amphitheatre', 'Campus Central Square', 600, TRUE);

-- 4. Populate RESOURCES
INSERT INTO RESOURCES (resource_id, resource_name, total_quantity) VALUES
(1, '4K Projector', 15),
(2, 'PA Audio System & Wireless Mics', 10),
(3, 'Stage Lighting Kit', 4),
(4, 'High-Density Wi-Fi Access Point', 20);

-- 5. Populate Initial BOOKINGS
INSERT INTO BOOKINGS (booking_id, user_id, venue_id, dept_id, start_time, end_time, status) VALUES
(1, 1, 1, 1, '2026-11-05 10:00:00', '2026-11-05 13:00:00', 'APPROVED'),
(2, 2, 2, 1, '2026-11-05 14:00:00', '2026-11-05 16:00:00', 'PENDING'),
(3, 2, 3, 2, '2026-11-06 09:00:00', '2026-11-06 11:30:00', 'PENDING');

-- 6. Populate BOOKING_RESOURCES
INSERT INTO BOOKING_RESOURCES (booking_id, resource_id, quantity_allocated) VALUES
(1, 1, 1),
(1, 2, 2),
(2, 1, 1);

-- 7. Populate APPROVAL_LOGS
INSERT INTO APPROVAL_LOGS (log_id, booking_id, approver_id, action_status, comments, timestamp) VALUES
(1, 1, 3, 'APPROVED', 'Approved for National AI Symposium. Equipment must be returned by 13:30.', '2026-11-01 10:15:00');
