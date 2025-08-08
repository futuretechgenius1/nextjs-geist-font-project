```markdown
# Comprehensive Implementation Plan for Critical Company Data Management Application

This plan outlines the step-by-step changes across backend and frontend files, error handling, security best practices, and deployment procedures for managing company applications, config servers, AD groups, Confluence pages, and database details.

---

## 1. Backend Implementation (Node.js with Express and SQLite3)

### Project Structure (New Directory: /backend)
- **backend/package.json**  
  - Create a new package.json with dependencies: express, sqlite3, jsonwebtoken, bcrypt, cors, and nodemon as a devDependency.
  - Example script entries:  
    - `"dev": "nodemon server.js"`
    - `"start": "node server.js"`

- **backend/server.js**  
  - Initialize an Express app with global middlewares (body-parser/json, cors).
  - Import the database connection from `/backend/database/db.js` and initialize tables if not existent.
  - Mount API routes under `/api`, e.g., `/api/auth`, `/api/applications`, `/api/config-servers`, `/api/ad-groups`, `/api/confluence-pages`, and `/api/db-details`.
  - Include a global error handler (try/catch in async routes and error middleware).

- **backend/database/db.js**  
  - Set up a SQLite3 connection (database file: `data.db`).
  - Run SQL queries during startup to create tables:
    - `users` (id, username, email, password_hash, role)
    - `applications`
    - `config_servers`
    - `ad_groups`
    - `confluence_pages`
    - `db_details`
  - Export the database connection for use in models/routes.

- **backend/middleware/authMiddleware.js**  
  - Create a middleware to extract and verify JWT tokens from the Authorization header.
  - On invalid or missing tokens, return a 401 Unauthorized response.
  
- **Backend Routes (Folder: /backend/routes)**
  - **auth.js**
    - POST `/api/auth/register`: Hash passwords with bcrypt, store new user in SQLite.
    - POST `/api/auth/login`: Verify user credentials, generate a JWT (with secret from `process.env.JWT_SECRET`) and return it.
    - Ensure proper error handling and status codes.
  - **applications.js, configServers.js, adGroups.js, confluencePages.js, dbDetails.js**
    - For each module, implement standard CRUD endpoints:
      - GET `/` to list all items.
      - GET `/:id` to fetch a single record.
      - POST `/` to add a new record.
      - PUT `/:id` to update an item.
      - DELETE `/:id` to remove an item.
    - Secure all routes with the JWT authentication middleware.
    - Validate request bodies and return appropriate error messages.

---

## 2. Frontend Implementation (React/Next.js with Material UI)

### Project Structure Modifications (Within /src)

- **Install Material UI Dependencies**
  - Add `@mui/material`, `@emotion/react`, and `@emotion/styled` as dependencies (update package.json accordingly).

- **Pages**
  - **src/pages/login.tsx**
    - Create a modern login form using Material UI’s TextField and Button.
    - Include form validation and error alert (e.g., using Material UI’s Alert component).
    - On submit, perform a POST request to `http://localhost:5000/api/auth/login`, handle error responses, and on success, store the JWT (in localStorage or context) and navigate to the dashboard.
  
  - **src/pages/dashboard.tsx**
    - Develop a responsive dashboard with Material UI Grid and Card components.
    - Display summary cards for each data type (applications, config servers, AD groups, Confluence pages, db details).
    - Implement a search TextField at the top to allow dynamic filtering of data.
    - Use a clean layout with plenty of spacing and modern typography.
  
  - **Module Management Pages**
    - Create pages like **src/pages/applications.tsx**, **configServers.tsx**, **adGroups.tsx**, **confluencePages.tsx**, and **dbDetails.tsx**.
    - Each page uses a Material UI DataGrid or Table to list items.
    - Provide “Add New”, “Edit”, and “Delete” options. Use Material UI Dialog components to show forms for create/update.
    - Validate input fields with inline error messages.

- **State Management**
  - **src/context/AuthContext.tsx**
    - Implement a React Context to manage the authenticated user’s state (JWT token, user info, role).
    - Wrap the custom provider in **src/pages/_app.tsx** so all pages are protected.
    - Use this context to conditionally render content based on user roles (admin vs. employee).

- **Error Handling and UI Alerts**
  - Add error boundaries and utilize Material UI Alert/ Snackbar components to display error or success notifications for actions like login failures, data fetch errors, or submission validations.

- **Modern UI Considerations**
  - Use a consistent color scheme defined in Tailwind globals or Material UI theme.
  - For images (if needed on landing pages only), use the `<img>` tag with a placeholder source such as:  
    ```html
    <div class="card-image">
      <img src="https://placehold.co/1920x1080?text=Modern+minimalist+dashboard+interface+with+responsive+layout" alt="Modern minimalist dashboard interface showcasing responsive layout and attention to typography" onerror="this.style.display='none'" />
    </div>
    ```
  - Ensure spacing, typography, and layout follow Material UI best practices.

---

## 3. Security and Role-Based Access Controls

- Use `bcrypt` for password hashing in registration and authentication routes.
- JWT tokens must include user role in the payload (e.g., “admin”, “employee”).
- Protect sensitive API endpoints with the authMiddleware.
- On the frontend, restrict access to admin-only pages via checking the role from AuthContext.
- Store sensitive environment variables (JWT secret) in a secure `.env` file in the backend root.

---

## 4. Deployment and Dockerization

- **Dockerfile (Root)**
  - Create a multi-stage Dockerfile that builds both the frontend (Next.js) and the backend (Express) separately.
  - Use separate containers if necessary or use docker-compose to orchestrate them.

- **docker-compose.yml (Root)**
  - Define services for the backend (Node.js Express with SQLite volume) and frontend (Next.js).
  - Ensure environment variables (e.g., JWT_SECRET) are passed securely into containers.

- **Testing with curl**
  - For critical API endpoints (authentication, CRUD ops), set up curl commands as specified:
    ```bash
    curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email": "test@example.com", "password": "pass"}'
    ```
  - Verify HTTP status codes, error handling, and JSON responses.

---

## 5. Documentation and README Updates

- Update the root **README.md** with:
  - Instructions on setting up the backend, frontend, and Docker deployment.
  - Descriptions for environment variables and error handling strategies.
  - API endpoint summaries for developers.

---

## Summary
- Create a new backend in `/backend` using Express, SQLite3, JWT, and bcrypt, with complete CRUD endpoints and secured routes via middleware.
- Enhance the existing Next.js project by adding Material UI-based pages (Login, Dashboard, CRUD screens) and a React Context for authentication state.
- Implement robust error handling, input validation, and role-based access controls.
- Dockerize the application with a multi-container setup and include thorough testing using curl commands.
- Update documentation to guide developers on deploying and maintaining the system.
