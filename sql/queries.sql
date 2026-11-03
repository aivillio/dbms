-- Smart Campus Event & Resource Booking System
-- Required Academic SQL Queries (Chapter 7)
-- Database: smart_campus

USE smart_campus;

-- 7.1 Simple Query with GROUP BY and Aggregate Functions
-- Calculates total venues, aggregate seating capacity, and total bookings received per department
SELECT 
    d.dept_name,
    d.code,
    COUNT(DISTINCT v.venue_id) AS total_venues,
    COALESCE(SUM(v.capacity), 0) AS total_seating_capacity,
    COUNT(b.booking_id) AS total_bookings_received
FROM DEPARTMENTS d
LEFT JOIN VENUES v ON d.dept_id = v.dept_id
LEFT JOIN BOOKINGS b ON d.dept_id = b.dept_id
GROUP BY d.dept_id, d.dept_name, d.code
ORDER BY total_bookings_received DESC;

-- 7.2 Update Operation
-- Cancels a specific reservation and sets its status to 'CANCELLED'
UPDATE BOOKINGS 
SET status = 'CANCELLED' 
WHERE booking_id = 2 AND status = 'PENDING';

-- 7.3 Delete Operation
-- Purges old cancelled reservations that have expired
DELETE FROM BOOKINGS 
WHERE status = 'CANCELLED' 
  AND end_time < NOW();

-- 7.4 Correlated Query
-- Selects users who have submitted more bookings than the average number of bookings submitted by users in their own department
SELECT u.user_id, u.full_name, u.role, u.dept_id
FROM USERS u
WHERE (
    SELECT COUNT(*) 
    FROM BOOKINGS b 
    WHERE b.user_id = u.user_id
) > (
    SELECT AVG(user_booking_count)
    FROM (
        SELECT COUNT(b2.booking_id) AS user_booking_count
        FROM USERS u2
        LEFT JOIN BOOKINGS b2 ON u2.user_id = b2.user_id
        WHERE u2.dept_id = u.dept_id
        GROUP BY u2.user_id
    ) AS dept_averages
);

-- 7.5 Nested Query
-- Retrieves venues that have never had a booking rejected
SELECT v.venue_id, v.name, v.location, v.capacity
FROM VENUES v
WHERE v.venue_id NOT IN (
    SELECT DISTINCT b.venue_id 
    FROM BOOKINGS b 
    WHERE b.status = 'REJECTED'
);

-- 7.6 Query Demonstrating JOIN, GROUP BY, HAVING, ORDER BY, and Aggregate Functions
-- Filters departments that have allocated at least 1 approved booking
SELECT 
    d.dept_name,
    d.code,
    COUNT(b.booking_id) AS total_approved_bookings,
    COUNT(DISTINCT v.venue_id) AS venues_utilized
FROM DEPARTMENTS d
JOIN VENUES v ON d.dept_id = v.dept_id
JOIN BOOKINGS b ON v.venue_id = b.venue_id
WHERE b.status = 'APPROVED'
GROUP BY d.dept_id, d.dept_name, d.code
HAVING COUNT(b.booking_id) >= 1
ORDER BY total_approved_bookings DESC;

-- 7.7 Querying from the SQL VIEW (vw_active_venue_schedules)
-- Demonstrates query execution against an operational database View
SELECT 
    booking_id,
    venue_name,
    location,
    requester_name,
    requester_role,
    dept_name,
    start_time,
    end_time,
    status
FROM vw_active_venue_schedules
ORDER BY start_time ASC;

