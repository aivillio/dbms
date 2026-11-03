# Smart Campus Event & Resource Booking System

**UE23CS351A – DBMS Project | PES University (AUG – DEC 2026)**  
**Guided by:** Dr. Shilpa S, Assistant Professor, Dept. of CSE  

---

### Team Members & Responsibilities

| Student Name | SRN | Role & Primary Responsibilities |
| :--- | :--- | :--- |
| **Angelo** | **PES2UG24CS062** | **Core Logistics & Booking Engine**<br>• Relational Schema (`BOOKINGS`, `VENUES`, `RESOURCES`, `BOOKING_RESOURCES`)<br>• Non-overlap algorithm, primary index tuning, concurrency locking (`FOR UPDATE`) |
| **Aditya** | **PES2UG24CS031** | **Identity, Approvals & Audit Logging**<br>• Access & Security Schema (`USERS`, `DEPARTMENTS`, `APPROVAL_LOGS`)<br>• RBAC middleware, approval pipeline, MongoDB unstructured telemetry |

---

## 1. Project Overview & Architecture

The **Smart Campus Event & Resource Booking System** is an enterprise-level platform architected to manage campus venue allocations and shared hardware resources across departments.

### Hybrid Polyglot Database Design
1. **Relational Core (MySQL 8.0 / InnoDB)**:
   - 7 normalized tables: `DEPARTMENTS`, `USERS`, `VENUES`, `RESOURCES`, `BOOKINGS`, `BOOKING_RESOURCES`, and `APPROVAL_LOGS`.
   - Strict referential integrity (`ON DELETE CASCADE / SET NULL`), `CHECK` constraints, composite keys.
   - ACID-compliant atomic transactions with row-level locks preventing double-booking conflicts.
2. **NoSQL & Vector Engine (MongoDB Vector Search)**:
   - 768-dimensional dense vector embeddings generated from venue attributes and amenities.
   - HNSW (Hierarchical Navigable Small World) index for fast natural-language semantic discovery (e.g., *"Find me a quiet hall with a projector for 40 students"*).
   - Semi-structured telemetry documents capturing runtime collisions and policy overrides.
3. **Application Layer (Next.js 14 App Router)**:
   - Server-Side Rendering (SSR), Server Actions, TypeScript, Tailwind CSS.

---

## 2. Directory Structure

```text
dbms/
├── DBMS_Mini_Project_Report.docx       # Complete PES University Project Report
├── package.json                        # Dependencies and build scripts
├── tsconfig.json                       # TypeScript compiler options
├── tailwind.config.ts                  # Tailwind theme and design tokens
├── next.config.mjs                     # Next.js configuration
├── .env.example                        # Environment variables template
├── .gitignore                          # Exclusions for node_modules, .next, .env
├── sql/
│   ├── schema.sql                      # Complete MySQL DDL statements
│   ├── seed.sql                        # Complete MySQL sample data
│   ├── queries.sql                     # Chapter 7 Academic SQL Queries
│   └── procedures_triggers.sql         # Stored procedure & Audit trigger
├── mongo/
│   ├── vector_index.json               # Atlas Search HNSW index definition
│   └── seed_embeddings.js              # MongoDB seeding & embedding generator
└── src/
    ├── app/                            # Next.js App Router hierarchy
    │   ├── page.tsx                    # Landing page
    │   ├── layout.tsx                  # Global navbar & layout
    │   ├── (dashboard)/
    │   │   ├── dashboard/page.tsx      # Metrics and recent reservations
    │   │   ├── search/page.tsx         # Natural language vector search & booking
    │   │   ├── bookings/page.tsx       # Live reservations ledger
    │   │   └── admin/approvals/page.tsx# Administrative review & audit log
    │   └── api/
    │       ├── bookings/route.ts
    │       └── venues/search/route.ts
    ├── actions/
    │   ├── booking.ts                  # Atomic booking Server Action with locks
    │   └── approvals.ts                # Administrative status change action
    ├── components/
    │   └── layout/navbar.tsx           # Global header
    ├── lib/
    │   ├── db-mysql.ts                 # MySQL connection pool
    │   ├── db-mongo.ts                 # MongoDB client singleton
    │   └── embeddings.ts               # Vector embedding generator
    └── types/
        └── db.ts                       # TypeScript interfaces
```

---

## 3. Setup and Installation Guide

### Step 1: Clone Repository
```bash
git clone https://github.com/aivillio/dbms.git
cd dbms
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Set Up MySQL Database
1. Open MySQL CLI or MySQL Workbench:
```sql
CREATE DATABASE smart_campus;
USE smart_campus;
```
2. Execute the schema:
```bash
mysql -u root -p smart_campus < sql/schema.sql
mysql -u root -p smart_campus < sql/seed.sql
mysql -u root -p smart_campus < sql/procedures_triggers.sql
```

### Step 4: Set Up MongoDB & Vector Embeddings
Ensure MongoDB is running locally on port 27017 or provide your MongoDB Atlas URI in `.env.local`:
```bash
npm run seed:mongo
```

### Step 5: Configure `.env.local`
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your database credentials:
```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=smart_campus

MONGODB_URI=mongodb://localhost:27017/smart_campus_nosql
```

### Step 6: Start the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 4. Key Academic Queries Implemented (`sql/queries.sql`)

1. **Simple Query with GROUP BY & Aggregation**: Computes total seating capacity and booking volume per department.
2. **Update Operation**: Releases reserved equipment and transitions status to `CANCELLED`.
3. **Delete Operation**: Safely purges obsolete cancelled reservations past expiration.
4. **Correlated Query**: Identifies departmental power users booking more than their departmental average.
5. **Nested Query**: Evaluates top-performing venues with zero conflict rejections.

---

## 5. Verification & Testing

- **Atomic Booking Engine**: Test double-booking by submitting the same time window for `Auditorium 1` in two separate browser tabs. The second request is rejected with:  
  `"Venue is already booked during this time window. Collision prevented."`
- **Audit Logging**: Change any booking status to see instant, immutable insertion into `APPROVAL_LOGS` via the trigger `trg_after_booking_status_update`.
