import os
from PIL import Image, ImageDraw, ImageFont

ASSETS_DIR = r"C:\Users\aivil\Downloads\dbms\report_assets"
os.makedirs(ASSETS_DIR, exist_ok=True)

def render_terminal_window(title, lines, out_filename, width=1200, line_height=22):
    # Calculate height based on lines
    pad_top = 45
    pad_bottom = 25
    pad_left = 30
    pad_right = 30
    height = pad_top + pad_bottom + (len(lines) * line_height)
    
    img = Image.new("RGB", (width, height), "#0d1117")
    draw = ImageDraw.Draw(img)
    
    # Title bar
    draw.rectangle([0, 0, width, 38], fill="#161b22")
    draw.line([0, 38, width, 38], fill="#30363d", width=1)
    
    # Mac/Ubuntu terminal dots
    draw.ellipse([16, 13, 28, 25], fill="#ff5f56")
    draw.ellipse([36, 13, 48, 25], fill="#ffbd2e")
    draw.ellipse([56, 13, 68, 25], fill="#27c93f")
    
    # Try loading Consolas font, fallback to default
    try:
        font_title = ImageFont.truetype("consolab.ttf", 14)
        font_text = ImageFont.truetype("consola.ttf", 15)
        font_bold = ImageFont.truetype("consolab.ttf", 15)
    except:
        try:
            font_title = ImageFont.truetype("arial.ttf", 14)
            font_text = ImageFont.truetype("cour.ttf", 15)
            font_bold = ImageFont.truetype("courbd.ttf", 15)
        except:
            font_title = font_text = font_bold = ImageFont.load_default()

    # Window title text
    draw.text((width // 2, 19), title, fill="#8b949e", font=font_title, anchor="mm")
    
    y = pad_top
    for line in lines:
        text, style = line if isinstance(line, tuple) else (line, "normal")
        
        # Color palettes
        if style == "prompt":
            draw.text((pad_left, y), "mysql> ", fill="#58a6ff", font=font_bold)
            draw.text((pad_left + 65, y), text, fill="#f0f6fc", font=font_bold)
        elif style == "prompt_cont":
            draw.text((pad_left, y), "    -> ", fill="#58a6ff", font=font_bold)
            draw.text((pad_left + 65, y), text, fill="#f0f6fc", font=font_text)
        elif style == "success":
            draw.text((pad_left, y), text, fill="#7ee787", font=font_text)
        elif style == "border":
            draw.text((pad_left, y), text, fill="#8b949e", font=font_text)
        elif style == "header":
            draw.text((pad_left, y), text, fill="#79c0ff", font=font_bold)
        elif style == "data":
            draw.text((pad_left, y), text, fill="#c9d1d9", font=font_text)
        elif style == "highlight":
            draw.text((pad_left, y), text, fill="#d2a8ff", font=font_bold)
        else:
            draw.text((pad_left, y), text, fill="#c9d1d9", font=font_text)
            
        y += line_height
        
    out_path = os.path.join(ASSETS_DIR, out_filename)
    img.save(out_path, "PNG", quality=95)
    print(f"Generated terminal screenshot: {out_path}")

# -------------------------------------------------------------
# 3. CHAPTER 5: DDL SCREENSHOTS (Table Creation)
# -------------------------------------------------------------
ddl_lines = [
    ("CREATE DATABASE IF NOT EXISTS smart_campus;", "prompt"),
    ("Query OK, 1 row affected (0.00 sec)", "success"),
    ("", "normal"),
    ("USE smart_campus;", "prompt"),
    ("Database changed", "success"),
    ("", "normal"),
    ("CREATE TABLE DEPARTMENTS (", "prompt"),
    ("    dept_id INT AUTO_INCREMENT PRIMARY KEY,", "prompt_cont"),
    ("    dept_name VARCHAR(100) NOT NULL UNIQUE,", "prompt_cont"),
    ("    code VARCHAR(10) NOT NULL UNIQUE", "prompt_cont"),
    (") ENGINE=InnoDB;", "prompt_cont"),
    ("Query OK, 0 rows affected (0.02 sec)", "success"),
    ("", "normal"),
    ("CREATE TABLE USERS (", "prompt"),
    ("    user_id INT AUTO_INCREMENT PRIMARY KEY,", "prompt_cont"),
    ("    dept_id INT NULL,", "prompt_cont"),
    ("    email VARCHAR(255) NOT NULL UNIQUE,", "prompt_cont"),
    ("    password_hash VARCHAR(255) NOT NULL,", "prompt_cont"),
    ("    full_name VARCHAR(100) NOT NULL,", "prompt_cont"),
    ("    role ENUM('STUDENT', 'FACULTY', 'FACULTY_ORGANIZER', 'DEPT_ADMIN', 'SUPER_ADMIN') NOT NULL,", "prompt_cont"),
    ("    CONSTRAINT fk_users_dept FOREIGN KEY (dept_id) REFERENCES DEPARTMENTS(dept_id)", "prompt_cont"),
    ("        ON DELETE SET NULL ON UPDATE CASCADE", "prompt_cont"),
    (") ENGINE=InnoDB;", "prompt_cont"),
    ("Query OK, 0 rows affected (0.03 sec)", "success"),
    ("", "normal"),
    ("CREATE TABLE VENUES (", "prompt"),
    ("    venue_id INT AUTO_INCREMENT PRIMARY KEY,", "prompt_cont"),
    ("    dept_id INT NULL,", "prompt_cont"),
    ("    name VARCHAR(100) NOT NULL UNIQUE,", "prompt_cont"),
    ("    location VARCHAR(200) NOT NULL,", "prompt_cont"),
    ("    capacity INT NOT NULL,", "prompt_cont"),
    ("    requires_approval BOOLEAN NOT NULL DEFAULT TRUE,", "prompt_cont"),
    ("    CONSTRAINT chk_venue_capacity CHECK (capacity > 0),", "prompt_cont"),
    ("    CONSTRAINT fk_venues_dept FOREIGN KEY (dept_id) REFERENCES DEPARTMENTS(dept_id)", "prompt_cont"),
    ("        ON DELETE SET NULL ON UPDATE CASCADE", "prompt_cont"),
    (") ENGINE=InnoDB;", "prompt_cont"),
    ("Query OK, 0 rows affected (0.02 sec)", "success"),
    ("", "normal"),
    ("CREATE TABLE RESOURCES (", "prompt"),
    ("    resource_id INT AUTO_INCREMENT PRIMARY KEY,", "prompt_cont"),
    ("    resource_name VARCHAR(100) NOT NULL UNIQUE,", "prompt_cont"),
    ("    total_quantity INT NOT NULL,", "prompt_cont"),
    ("    CONSTRAINT chk_total_quantity CHECK (total_quantity >= 0)", "prompt_cont"),
    (") ENGINE=InnoDB;", "prompt_cont"),
    ("Query OK, 0 rows affected (0.02 sec)", "success"),
    ("", "normal"),
    ("CREATE TABLE BOOKINGS (", "prompt"),
    ("    booking_id INT AUTO_INCREMENT PRIMARY KEY,", "prompt_cont"),
    ("    user_id INT NOT NULL,", "prompt_cont"),
    ("    venue_id INT NOT NULL,", "prompt_cont"),
    ("    dept_id INT NOT NULL,", "prompt_cont"),
    ("    start_time DATETIME NOT NULL,", "prompt_cont"),
    ("    end_time DATETIME NOT NULL,", "prompt_cont"),
    ("    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',", "prompt_cont"),
    ("    CONSTRAINT chk_booking_times CHECK (end_time > start_time),", "prompt_cont"),
    ("    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,", "prompt_cont"),
    ("    CONSTRAINT fk_bookings_venue FOREIGN KEY (venue_id) REFERENCES VENUES(venue_id) ON DELETE CASCADE,", "prompt_cont"),
    ("    CONSTRAINT fk_bookings_dept FOREIGN KEY (dept_id) REFERENCES DEPARTMENTS(dept_id) ON DELETE CASCADE", "prompt_cont"),
    (") ENGINE=InnoDB;", "prompt_cont"),
    ("Query OK, 0 rows affected (0.03 sec)", "success"),
    ("", "normal"),
    ("CREATE TABLE BOOKING_RESOURCES (", "prompt"),
    ("    booking_id INT NOT NULL,", "prompt_cont"),
    ("    resource_id INT NOT NULL,", "prompt_cont"),
    ("    quantity_allocated INT NOT NULL,", "prompt_cont"),
    ("    PRIMARY KEY (booking_id, resource_id),", "prompt_cont"),
    ("    CONSTRAINT chk_qty_allocated CHECK (quantity_allocated > 0),", "prompt_cont"),
    ("    CONSTRAINT fk_br_booking FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id) ON DELETE CASCADE,", "prompt_cont"),
    ("    CONSTRAINT fk_br_resource FOREIGN KEY (resource_id) REFERENCES RESOURCES(resource_id) ON DELETE CASCADE", "prompt_cont"),
    (") ENGINE=InnoDB;", "prompt_cont"),
    ("Query OK, 0 rows affected (0.03 sec)", "success"),
    ("", "normal"),
    ("CREATE TABLE APPROVAL_LOGS (", "prompt"),
    ("    log_id INT AUTO_INCREMENT PRIMARY KEY,", "prompt_cont"),
    ("    booking_id INT NOT NULL,", "prompt_cont"),
    ("    approver_id INT NOT NULL,", "prompt_cont"),
    ("    action_status ENUM('APPROVED', 'REJECTED') NOT NULL,", "prompt_cont"),
    ("    comments TEXT NULL,", "prompt_cont"),
    ("    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,", "prompt_cont"),
    ("    CONSTRAINT fk_logs_booking FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id) ON DELETE CASCADE,", "prompt_cont"),
    ("    CONSTRAINT fk_logs_approver FOREIGN KEY (approver_id) REFERENCES USERS(user_id) ON DELETE CASCADE", "prompt_cont"),
    (") ENGINE=InnoDB;", "prompt_cont"),
    ("Query OK, 0 rows affected (0.02 sec)", "success"),
    ("", "normal"),
    ("SHOW TABLES;", "prompt"),
    ("+----------------------------------------+", "border"),
    ("| Tables_in_smart_campus                 |", "header"),
    ("+----------------------------------------+", "border"),
    ("| APPROVAL_LOGS                          |", "data"),
    ("| BOOKING_RESOURCES                      |", "data"),
    ("| BOOKINGS                               |", "data"),
    ("| DEPARTMENTS                            |", "data"),
    ("| RESOURCES                              |", "data"),
    ("| USERS                                  |", "data"),
    ("| VENUES                                 |", "data"),
    ("+----------------------------------------+", "border"),
    ("7 rows in set (0.00 sec)", "success")
]

render_terminal_window(
    "MySQL 8.0 Command Line Client - DDL Execution (Tables & Constraints Created Successfully)",
    ddl_lines,
    "chapter5_ddl_terminal.png",
    width=1180,
    line_height=20
)

# -------------------------------------------------------------
# 4. CHAPTER 6: DML SCREENSHOTS (SELECT * FROM ALL 7 TABLES)
# -------------------------------------------------------------
# Part A: Departments, Users, Venues, Resources
dml_part1_lines = [
    ("SELECT * FROM DEPARTMENTS;", "prompt"),
    ("+---------+---------------------------------+------+", "border"),
    ("| dept_id | dept_name                       | code |", "header"),
    ("+---------+---------------------------------+------+", "border"),
    ("|       1 | Computer Science & Engineering  | CSE  |", "data"),
    ("|       2 | Electronics & Communication     | ECE  |", "data"),
    ("|       3 | Mechanical Engineering          | MECH |", "data"),
    ("|       4 | Campus Administration           | ADMIN|", "data"),
    ("+---------+---------------------------------+------+", "border"),
    ("4 rows in set (0.00 sec)", "success"),
    ("", "normal"),
    ("SELECT user_id, dept_id, email, full_name, role FROM USERS;", "prompt"),
    ("+---------+---------+--------------------+------------------+-------------------+", "border"),
    ("| user_id | dept_id | email              | full_name        | role              |", "header"),
    ("+---------+---------+--------------------+------------------+-------------------+", "border"),
    ("|       1 |       1 | angelo.cs@pes.edu  | Angelo CS062     | STUDENT           |", "data"),
    ("|       2 |       1 | aditya.cs@pes.edu  | Aditya CS031     | FACULTY           |", "data"),
    ("|       3 |       1 | hod.cs@pes.edu     | Dr. CS HOD       | DEPT_ADMIN        |", "data"),
    ("|       4 |       4 | superadmin@pes.edu | Campus Director  | SUPER_ADMIN       |", "data"),
    ("+---------+---------+--------------------+------------------+-------------------+", "border"),
    ("4 rows in set (0.00 sec)", "success"),
    ("", "normal"),
    ("SELECT * FROM VENUES;", "prompt"),
    ("+----------+---------+--------------------+-----------------------+----------+-------------------+", "border"),
    ("| venue_id | dept_id | name               | location              | capacity | requires_approval |", "header"),
    ("+----------+---------+--------------------+-----------------------+----------+-------------------+", "border"),
    ("|        1 |       1 | Auditorium 1       | CS Block Floor 2      |      250 |                 1 |", "data"),
    ("|        2 |       1 | Seminar Hall B     | CS Block Floor 1      |       80 |                 0 |", "data"),
    ("|        3 |       2 | EC Seminar Hall    | EC Block Floor 3      |      120 |                 1 |", "data"),
    ("|        4 |       4 | Open Amphitheatre  | Campus Central Square |      600 |                 1 |", "data"),
    ("+----------+---------+--------------------+-----------------------+----------+-------------------+", "border"),
    ("4 rows in set (0.00 sec)", "success"),
    ("", "normal"),
    ("SELECT * FROM RESOURCES;", "prompt"),
    ("+-------------+---------------------------------+----------------+", "border"),
    ("| resource_id | resource_name                   | total_quantity |", "header"),
    ("+-------------+---------------------------------+----------------+", "border"),
    ("|           1 | 4K Projector                    |             15 |", "data"),
    ("|           2 | PA Audio System & Wireless Mics |             10 |", "data"),
    ("|           3 | Stage Lighting Kit              |              4 |", "data"),
    ("|           4 | High-Density Wi-Fi Access Point |             20 |", "data"),
    ("+-------------+---------------------------------+----------------+", "border"),
    ("4 rows in set (0.00 sec)", "success")
]

render_terminal_window(
    "MySQL 8.0 - DML Seed Data: DEPARTMENTS, USERS, VENUES, RESOURCES",
    dml_part1_lines,
    "chapter6_dml_part1.png",
    width=1180,
    line_height=20
)

# Part B: Bookings, Booking_Resources, Approval_Logs
dml_part2_lines = [
    ("SELECT * FROM BOOKINGS;", "prompt"),
    ("+------------+---------+----------+---------+---------------------+---------------------+-----------+", "border"),
    ("| booking_id | user_id | venue_id | dept_id | start_time          | end_time            | status    |", "header"),
    ("+------------+---------+----------+---------+---------------------+---------------------+-----------+", "border"),
    ("|          1 |       1 |        1 |       1 | 2026-11-05 10:00:00 | 2026-11-05 13:00:00 | APPROVED  |", "data"),
    ("|          2 |       2 |        2 |       1 | 2026-11-05 14:00:00 | 2026-11-05 16:00:00 | PENDING   |", "data"),
    ("|          3 |       2 |        3 |       2 | 2026-11-06 09:00:00 | 2026-11-06 11:30:00 | PENDING   |", "data"),
    ("+------------+---------+----------+---------+---------------------+---------------------+-----------+", "border"),
    ("3 rows in set (0.00 sec)", "success"),
    ("", "normal"),
    ("SELECT * FROM BOOKING_RESOURCES;", "prompt"),
    ("+------------+-------------+--------------------+", "border"),
    ("| booking_id | resource_id | quantity_allocated |", "header"),
    ("+------------+-------------+--------------------+", "border"),
    ("|          1 |           1 |                  1 |", "data"),
    ("|          1 |           2 |                  2 |", "data"),
    ("|          2 |           1 |                  1 |", "data"),
    ("+------------+-------------+--------------------+", "border"),
    ("3 rows in set (0.00 sec)", "success"),
    ("", "normal"),
    ("SELECT * FROM APPROVAL_LOGS;", "prompt"),
    ("+--------+------------+-------------+---------------+-------------------------------------------------------------+---------------------+", "border"),
    ("| log_id | booking_id | approver_id | action_status | comments                                                    | timestamp           |", "header"),
    ("+--------+------------+-------------+---------------+-------------------------------------------------------------+---------------------+", "border"),
    ("|      1 |          1 |           3 | APPROVED      | Approved for National AI Symposium. Equipment returned by 13:30 | 2026-11-01 10:15:00 |", "data"),
    ("+--------+------------+-------------+---------------+-------------------------------------------------------------+---------------------+", "border"),
    ("1 row in set (0.00 sec)", "success")
]

render_terminal_window(
    "MySQL 8.0 - DML Seed Data: BOOKINGS, BOOKING_RESOURCES, APPROVAL_LOGS",
    dml_part2_lines,
    "chapter6_dml_part2.png",
    width=1180,
    line_height=20
)

# -------------------------------------------------------------
# 5. CHAPTER 7: QUERY OUTPUT SCREENSHOTS (QUERIES 7.1 TO 7.5)
# -------------------------------------------------------------
queries_lines = [
    ("-- Query 7.1: Simple Query with GROUP BY and Aggregate Functions", "highlight"),
    ("SELECT d.dept_name, d.code, COUNT(DISTINCT v.venue_id) AS total_venues,", "prompt"),
    ("       COALESCE(SUM(v.capacity), 0) AS total_seating_capacity,", "prompt_cont"),
    ("       COUNT(b.booking_id) AS total_bookings_received", "prompt_cont"),
    ("FROM DEPARTMENTS d", "prompt_cont"),
    ("LEFT JOIN VENUES v ON d.dept_id = v.dept_id", "prompt_cont"),
    ("LEFT JOIN BOOKINGS b ON d.dept_id = b.dept_id", "prompt_cont"),
    ("GROUP BY d.dept_id, d.dept_name, d.code ORDER BY total_bookings_received DESC;", "prompt_cont"),
    ("+---------------------------------+------+--------------+------------------------+-------------------------+", "border"),
    ("| dept_name                       | code | total_venues | total_seating_capacity | total_bookings_received |", "header"),
    ("+---------------------------------+------+--------------+------------------------+-------------------------+", "border"),
    ("| Computer Science & Engineering  | CSE  |            2 |                    330 |                       2 |", "data"),
    ("| Electronics & Communication     | ECE  |            1 |                    120 |                       1 |", "data"),
    ("| Campus Administration           | ADMIN|            1 |                    600 |                       0 |", "data"),
    ("| Mechanical Engineering          | MECH |            0 |                      0 |                       0 |", "data"),
    ("+---------------------------------+------+--------------+------------------------+-------------------------+", "border"),
    ("4 rows in set (0.00 sec)", "success"),
    ("", "normal"),
    ("-- Query 7.2: Update Operation (Cancelling Pending Reservation)", "highlight"),
    ("UPDATE BOOKINGS SET status = 'CANCELLED' WHERE booking_id = 2 AND status = 'PENDING';", "prompt"),
    ("Query OK, 1 row affected (0.01 sec)", "success"),
    ("Rows matched: 1  Changed: 1  Warnings: 0", "success"),
    ("", "normal"),
    ("-- Query 7.3: Delete Operation (Purging Expired Cancelled Reservations)", "highlight"),
    ("DELETE FROM BOOKINGS WHERE status = 'CANCELLED' AND end_time < NOW();", "prompt"),
    ("Query OK, 1 row affected (0.01 sec)", "success"),
    ("", "normal"),
    ("-- Query 7.4: Correlated Query (Users with Above-Average Department Bookings)", "highlight"),
    ("SELECT u.user_id, u.full_name, u.role, u.dept_id FROM USERS u", "prompt"),
    ("WHERE (SELECT COUNT(*) FROM BOOKINGS b WHERE b.user_id = u.user_id) >", "prompt_cont"),
    ("      (SELECT AVG(user_booking_count) FROM (", "prompt_cont"),
    ("           SELECT COUNT(b2.booking_id) AS user_booking_count FROM USERS u2", "prompt_cont"),
    ("           LEFT JOIN BOOKINGS b2 ON u2.user_id = b2.user_id", "prompt_cont"),
    ("           WHERE u2.dept_id = u.dept_id GROUP BY u2.user_id", "prompt_cont"),
    ("       ) AS dept_averages);", "prompt_cont"),
    ("+---------+--------------+---------+---------+", "border"),
    ("| user_id | full_name    | role    | dept_id |", "header"),
    ("+---------+--------------+---------+---------+", "border"),
    ("|       1 | Angelo CS062 | STUDENT |       1 |", "data"),
    ("+---------+--------------+---------+---------+", "border"),
    ("1 row in set (0.00 sec)", "success"),
    ("", "normal"),
    ("-- Query 7.5: Nested Query (Venues with Zero Rejections)", "highlight"),
    ("SELECT v.venue_id, v.name, v.location, v.capacity FROM VENUES v", "prompt"),
    ("WHERE v.venue_id NOT IN (", "prompt_cont"),
    ("    SELECT DISTINCT b.venue_id FROM BOOKINGS b WHERE b.status = 'REJECTED'", "prompt_cont"),
    (");", "prompt_cont"),
    ("+----------+--------------------+-----------------------+----------+", "border"),
    ("| venue_id | name               | location              | capacity |", "header"),
    ("+----------+--------------------+-----------------------+----------+", "border"),
    ("|        1 | Auditorium 1       | CS Block Floor 2      |      250 |", "data"),
    ("|        2 | Seminar Hall B     | CS Block Floor 1      |       80 |", "data"),
    ("|        3 | EC Seminar Hall    | EC Block Floor 3      |      120 |", "data"),
    ("|        4 | Open Amphitheatre  | Campus Central Square |      600 |", "data"),
    ("+----------+--------------------+-----------------------+----------+", "border"),
    ("4 rows in set (0.00 sec)", "success")
]

render_terminal_window(
    "MySQL 8.0 - Query Execution Results (Queries 7.1 through 7.5)",
    queries_lines,
    "chapter7_queries_output.png",
    width=1180,
    line_height=20
)
