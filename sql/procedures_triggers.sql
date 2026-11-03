-- Smart Campus Event & Resource Booking System
-- Stored Procedures and Triggers (Chapter 8)
-- Database: smart_campus

USE smart_campus;

DROP PROCEDURE IF EXISTS sp_create_booking_atomic;
DROP TRIGGER IF EXISTS trg_after_booking_status_update;

DELIMITER //

-- 8.1 Atomic Stored Procedure with Pessimistic Locking
CREATE PROCEDURE sp_create_booking_atomic(
    IN p_user_id INT,
    IN p_venue_id INT,
    IN p_dept_id INT,
    IN p_start DATETIME,
    IN p_end DATETIME,
    IN p_resource_id INT,
    IN p_resource_qty INT,
    OUT p_booking_id INT,
    OUT p_result_code VARCHAR(50)
)
BEGIN
    DECLARE v_venue_conflict INT DEFAULT 0;
    DECLARE v_avail_res INT DEFAULT 0;
    DECLARE v_requires_appr BOOLEAN;

    -- Rollback on SQLEXCEPTION
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_result_code = 'TRANSACTION_ERROR_ROLLEDBACK';
        SET p_booking_id = -1;
    END;

    START TRANSACTION;

    -- 1. Check for overlapping reservations on the venue
    SELECT COUNT(*) INTO v_venue_conflict
    FROM BOOKINGS
    WHERE venue_id = p_venue_id
      AND status IN ('APPROVED', 'PENDING')
      AND (start_time < p_end AND end_time > p_start)
    FOR UPDATE;

    IF v_venue_conflict > 0 THEN
        ROLLBACK;
        SET p_result_code = 'VENUE_ALREADY_RESERVED';
        SET p_booking_id = -1;
    ELSE
        -- 2. Verify shared hardware inventory if requested
        IF p_resource_id IS NOT NULL AND p_resource_qty > 0 THEN
            SELECT (r.total_quantity - COALESCE(SUM(br.quantity_allocated), 0))
            INTO v_avail_res
            FROM RESOURCES r
            LEFT JOIN BOOKING_RESOURCES br ON r.resource_id = br.resource_id
            LEFT JOIN BOOKINGS b ON br.booking_id = b.booking_id 
                AND b.status IN ('APPROVED', 'PENDING')
                AND (b.start_time < p_end AND b.end_time > p_start)
            WHERE r.resource_id = p_resource_id
            GROUP BY r.resource_id, r.total_quantity
            FOR UPDATE;

            IF v_avail_res < p_resource_qty THEN
                ROLLBACK;
                SET p_result_code = 'INSUFFICIENT_RESOURCE_INVENTORY';
                SET p_booking_id = -1;
            END IF;
        END IF;

        IF p_booking_id != -1 THEN
            -- 3. Determine if approval is needed based on venue policy
            SELECT requires_approval INTO v_requires_appr 
            FROM VENUES 
            WHERE venue_id = p_venue_id;

            -- 4. Create Master Booking record
            INSERT INTO BOOKINGS (user_id, venue_id, dept_id, start_time, end_time, status)
            VALUES (
                p_user_id, 
                p_venue_id, 
                p_dept_id, 
                p_start, 
                p_end, 
                IF(v_requires_appr, 'PENDING', 'APPROVED')
            );
            SET p_booking_id = LAST_INSERT_ID();

            -- 5. Allocate Composite Resource
            IF p_resource_id IS NOT NULL AND p_resource_qty > 0 THEN
                INSERT INTO BOOKING_RESOURCES (booking_id, resource_id, quantity_allocated)
                VALUES (p_booking_id, p_resource_id, p_resource_qty);
            END IF;

            COMMIT;
            SET p_result_code = 'BOOKING_SUCCESSFULLY_COMMITTED';
        END IF;
    END IF;
END //

-- 8.2 Database Trigger: Automated Audit Trail Insertion
CREATE TRIGGER trg_after_booking_status_update
AFTER UPDATE ON BOOKINGS
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status AND NEW.status IN ('APPROVED', 'REJECTED') THEN
        INSERT INTO APPROVAL_LOGS (
            booking_id, 
            approver_id, 
            action_status, 
            comments, 
            timestamp
        )
        VALUES (
            NEW.booking_id,
            NEW.user_id,
            NEW.status,
            CONCAT('Status migrated from ', OLD.status, ' to ', NEW.status),
            NOW()
        );
    END IF;
END //

DELIMITER ;
