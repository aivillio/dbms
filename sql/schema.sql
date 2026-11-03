-- Smart Campus Event & Resource Booking System
-- Database Schema (DDL)
-- Database: smart_campus

CREATE DATABASE IF NOT EXISTS smart_campus;
USE smart_campus;

-- Drop existing tables in foreign key safe mode to ensure clean recreation
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS APPROVAL_LOGS;
DROP TABLE IF EXISTS BOOKING_RESOURCES;
DROP TABLE IF EXISTS BOOKINGS;
DROP TABLE IF EXISTS RESOURCES;
DROP TABLE IF EXISTS VENUES;
DROP TABLE IF EXISTS USERS;
DROP TABLE IF EXISTS DEPARTMENTS;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. DEPARTMENTS TABLE
CREATE TABLE DEPARTMENTS (
    dept_id INT AUTO_INCREMENT PRIMARY KEY,
    dept_name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- 2. USERS TABLE
CREATE TABLE USERS (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    dept_id INT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('STUDENT', 'FACULTY', 'FACULTY_ORGANIZER', 'DEPT_ADMIN', 'SUPER_ADMIN') NOT NULL,
    CONSTRAINT fk_users_dept FOREIGN KEY (dept_id) REFERENCES DEPARTMENTS(dept_id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 3. VENUES TABLE
CREATE TABLE VENUES (
    venue_id INT AUTO_INCREMENT PRIMARY KEY,
    dept_id INT NULL,
    name VARCHAR(100) NOT NULL UNIQUE,
    location VARCHAR(200) NOT NULL,
    capacity INT NOT NULL,
    requires_approval BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_venue_capacity CHECK (capacity > 0),
    CONSTRAINT fk_venues_dept FOREIGN KEY (dept_id) REFERENCES DEPARTMENTS(dept_id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 4. RESOURCES TABLE
CREATE TABLE RESOURCES (
    resource_id INT AUTO_INCREMENT PRIMARY KEY,
    resource_name VARCHAR(100) NOT NULL UNIQUE,
    total_quantity INT NOT NULL,
    CONSTRAINT chk_total_quantity CHECK (total_quantity >= 0)
) ENGINE=InnoDB;

-- 5. BOOKINGS TABLE
CREATE TABLE BOOKINGS (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    venue_id INT NOT NULL,
    dept_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    CONSTRAINT chk_booking_times CHECK (end_time > start_time),
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES USERS(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_bookings_venue FOREIGN KEY (venue_id) REFERENCES VENUES(venue_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_bookings_dept FOREIGN KEY (dept_id) REFERENCES DEPARTMENTS(dept_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 6. BOOKING_RESOURCES TABLE (Associative Junction Table)
CREATE TABLE BOOKING_RESOURCES (
    booking_id INT NOT NULL,
    resource_id INT NOT NULL,
    quantity_allocated INT NOT NULL,
    PRIMARY KEY (booking_id, resource_id),
    CONSTRAINT chk_qty_allocated CHECK (quantity_allocated > 0),
    CONSTRAINT fk_br_booking FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_br_resource FOREIGN KEY (resource_id) REFERENCES RESOURCES(resource_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 7. APPROVAL_LOGS TABLE
CREATE TABLE APPROVAL_LOGS (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    approver_id INT NOT NULL,
    action_status ENUM('APPROVED', 'REJECTED') NOT NULL,
    comments TEXT NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_logs_booking FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_logs_approver FOREIGN KEY (approver_id) REFERENCES USERS(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 8. VIEW: Active Venue Schedules
-- Demonstrates SQL Views for hydrated operational lookups
CREATE OR REPLACE VIEW vw_active_venue_schedules AS
SELECT 
    b.booking_id,
    v.venue_id,
    v.name AS venue_name,
    v.location,
    v.capacity,
    u.full_name AS requester_name,
    u.role AS requester_role,
    d.dept_name,
    d.code AS dept_code,
    b.start_time,
    b.end_time,
    b.status
FROM BOOKINGS b
JOIN VENUES v ON b.venue_id = v.venue_id
JOIN USERS u ON b.user_id = u.user_id
JOIN DEPARTMENTS d ON b.dept_id = d.dept_id
WHERE b.status IN ('APPROVED', 'PENDING');

