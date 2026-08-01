# Ecommerce Admin Dashboard API - Trends Bird Limited

This is the backend implementation for the Trends Bird Limited Backend Developer Intern assignment. It provides a RESTful API to manage an e-commerce platform's administrative dashboard, featuring a robust, granular Role-Based Access Control (RBAC) system.

**Node.js Version:** v20.x.x LTS

---

## 🛠️ Setup & Run Instructions

### 1. Install Dependencies
```bash
npm install
```
# 2. Environment Variables
## Server
PORT=5000

## Database
DATABASE_URL="postgresql://<user>:<password>@<host>:5432/postgres"

## Authentication Secrets
JWT_ACCESS_SECRET="your_access_secret_here"
JWT_REFRESH_SECRET="your_refresh_secret_here"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

### Supabase Storage (Media Module)
SUPABASE_URL="[https://your-project.supabase.co](https://your-project.supabase.co)"
SUPABASE_KEY="your_anon_key"

# 3. Database Setup (Migrate & Seed)
## Apply database migrations to create all tables
npx prisma migrate deploy

## Run the seed script to populate permissions, roles, and default users
npx prisma db seed
## Development mode
npm run start:dev

## Production mode
npm run build

npm run start:prod

# 🔐 Seeded Account Credentials
The database seed script generates two users for testing access control.

1. Super Administrator (Holds a role with all permissions)

   Email: superadmin@example.com

   Password: SuperAdmin123!

2. Catalog Manager (Deliberately limited user: catalog access only, no permission/role/user management)

   Email: catalog@example.com

   Password: CatalogUser123!

(Note: If you change these in your seed.ts, please update them here).

# 🏗️ Technical Architecture & Design Decisions
Token Strategy
Strategy: Authorization: Bearer Header.

Implementation: The API issues a short-lived Access Token (15 minutes) and a long-lived Refresh Token (7 days) upon successful login. The frontend must pass the Access Token in the Authorization: Bearer <token> header for all authenticated routes.

Logout & Refresh: The Refresh Token is stored securely in the database so it can be successfully revoked server-side upon logout. An inactive user cannot refresh their session.

Notable Design Decisions
Access Control Guard: Permissions are enforced via a global NestJS guard. It intercepts every request, checks the required @RequirePermissions('module:action') metadata against the authenticated user's role, and returns 403 Forbidden if unauthorized.

Media Module: Multer handles multipart file uploads in memory, and the files are uploaded directly to Supabase Storage. The URL is then saved to PostgreSQL, ensuring the local filesystem is bypassed (making the app deployment ready).

Database Transactions: Multi-table writes (such as creating a Variable Product with its nested Attributes and Variants) are wrapped in Prisma Transactions to ensure atomicity.

# 📊 Module Status List
1. Authentication: Complete

2. Permission: Complete

3. Role: Complete

4. User: Complete

5. Media: Complete

6. Category: Complete

7. Brand: Complete

8. Attribute: Complete

9. Product: Complete

⚠️ Known Issues
No major issues identified. All core assignment requirements have been met.

# 🧪 API Testing (Postman)
A complete Postman collection is included in the project root to test all routes:

File: trends-bird-admin-dashboard.postman_collection

Instructions:

Import the collection into Postman.

Run the POST /auth/login route first using one of the seeded credentials.

Copy the returned accessToken and set it as the Bearer Token for subsequent requests.