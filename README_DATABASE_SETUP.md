# Database Setup Guide

This guide explains how to set up the Supabase database for the Blog, Merchant, and Booking pages.

## 1. Run Migration Scripts

Open your Supabase SQL Editor and run the following scripts in order:

1.  **`database-schema.sql`** (if you haven't already, to create users/profiles tables)
2.  **`create-blog-posts-table.sql`**
    *   Creates `blog_posts` table.
    *   Seeds it with the initial blog articles.
3.  **`ensure-tables.sql`**
    *   Creates `transactions` and `railway_bookings` tables.
    *   Sets up Row Level Security (RLS) policies.
4.  **`create-routes-table.sql`**
    *   Creates `routes` table for the railway booking system.
    *   Seeds it with mock routes (Nairobi to Mombasa).
5.  **`seed-transactions.sql`**
    *   **Important:** This script requires at least one user to exist in `public.users`.
    *   It inserts mock transactions for the first found user so you can see data in the Merchant Dashboard.

## 2. Application Changes

The following pages have been connected to the database:

*   **Blog (`/blog`)**: Fetches articles from `blog_posts`.
*   **Blog Post (`/blog/:id`)**: Fetches single article and related posts from `blog_posts`.
*   **Merchant Dashboard**: Fetches transactions from `transactions` table.
    *   *Note:* You must be logged in to see your transactions due to RLS policies.
*   **Railway Booking**:
    *   Fetches available routes from `routes` table.
    *   Saves bookings to `railway_bookings` table (requires login).

## 3. Troubleshooting

*   **No data in Merchant Dashboard?**
    *   Ensure you are logged in.
    *   Ensure you ran `seed-transactions.sql` *after* creating a user.
    *   Check RLS policies if you are using a different user than the one seeded.

*   **Booking fails?**
    *   Ensure you are logged in (Supabase Auth).
    *   Check console logs for specific error messages.
