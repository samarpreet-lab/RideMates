# Database Setup Instructions

## Overview

This folder contains SQL scripts to set up the RideMates database. All tables are defined according to the blueprint with proper foreign keys, indexes, and constraints.

## Files in This Directory

| File | Purpose | Order |
|------|---------|-------|
| `00_init_all_tables.sql` | **Start here!** Creates all 4 tables in correct order | 1 |
| `01_create_rides_table.sql` | Creates rides table (individual file) | 2 |
| `02_create_bookings_table.sql` | Creates bookings table (individual file) | 3 |
| `03_create_fuel_rates_table.sql` | Creates fuel_rates + sample data | 4 |

## How to Set Up Your Database

### Option A: Run All Tables at Once (RECOMMENDED)

1. Open your database client (Aiven MySQL or local MySQL)
2. Open the file: `00_init_all_tables.sql`
3. **Execute the entire script**
4. ✅ All 4 tables will be created in the correct order

**Why this is best:** It handles dependencies automatically (users → rides → bookings)

### Option B: Run Tables Individually (If Something Breaks)

Only do this if `00_init_all_tables.sql` has an error:

1. Run `01_create_rides_table.sql` (rides depends on users, so users must exist first)
2. Run `02_create_bookings_table.sql` (bookings depends on both users and rides)
3. Run `03_create_fuel_rates_table.sql` (standalone reference table)

## Table Schema Summary

### `users` Table
- Stores every verified university member
- Foreign key constraint: NONE (independent table)

### `rides` Table
- Stores every ride posted by drivers
- **Foreign key:** `driver_id` → `users.id`
- **Key feature:** `available_seats` will decrement as passengers book

### `bookings` Table
- Stores every seat reservation
- **Foreign keys:** `ride_id` → `rides.id`, `passenger_id` → `users.id`
- **Key feature:** `UNIQUE KEY (ride_id, passenger_id)` prevents double-booking

### `fuel_rates` Table
- Stores current fuel prices (₹/liter in India)
- Used by the pricing algorithm to calculate base costs
- Contains sample data for petrol, diesel, CNG

## Important Notes

### Timezone ⏰
- All `departure_time` values are stored in **UTC** (MySQL default)
- On the frontend, use `dayjs` to convert UTC → local timezone for display
- See Section 14.1 of the blueprint for the timezone trap

### Concurrency Control 🔒
- The `bookings` table has `UNIQUE (ride_id, passenger_id)` to prevent one user booking the same ride twice
- The backend uses `SELECT ... FOR UPDATE` transaction locking for seat decrements
- See Section 14.2 of the blueprint for the double-booking trap

### Cascading Deletes 🗑️
- If a user is deleted from `users`, all their rides and bookings are automatically deleted
- If a ride is deleted from `rides`, all related bookings are automatically deleted
- This ensures referential integrity

## Testing the Setup

After running the SQL scripts, verify the tables were created:

```sql
-- Show all tables
SHOW TABLES;

-- View rides table structure
DESCRIBE rides;

-- View bookings table structure  
DESCRIBE bookings;

-- Check fuel rates
SELECT * FROM fuel_rates;
```

You should see:
```
+----------+
| Tables   |
+----------+
| users    |
| rides    |
| bookings |
| fuel_rates|
+----------+
```

## Next Steps

After creating the tables:

1. ✅ Test database connection in `config/db.js`
2. 🔨 Create controllers (`authController.js`, `rideController.js`, `bookController.js`)
3. 📍 Create routes (`authRoutes.js`, `rideRoutes.js`, `bookRoutes.js`)
4. 🚀 Test API endpoints with Postman or Thunder Client

## Troubleshooting

### Error: "Table 'rides' references invalid column 'driver_id'"
→ The `users` table doesn't exist yet. Run `00_init_all_tables.sql` to create all at once.

### Error: "Duplicate entry" on fuel_rates insert
→ Fuel rates may already exist. Using `INSERT IGNORE` prevents this.

### Error: "Column 'id' doesn't exist"
→ Make sure you're running the SQL against the correct database

## Blueprint Reference

For more details on table design, see:
- **Blueprint Section 4:** Database Schema
- **Blueprint Section 5.3:** Booking with concurrency control
- **Blueprint Section 14.1:** Timezone trap solution
- **Blueprint Section 14.2:** Double-booking prevention

---

Created: February 27, 2026  
RideMates Backend Database Setup
