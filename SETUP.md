# Setup and Deployment Guide

## 1. Local Development (Zero-Configuration)
To run this application locally, you do **not** need to install or configure any database. It is configured to run using an in-memory **H2 Database** by default.

### Prerequisites
- **Java 17** or higher
- **Maven** (bundled or installed)

### Steps to Run
1. Open your terminal in the project root directory.
2. Run the application:
   ```bash
   mvn spring-boot:run
   ```
3. Open your browser and go to: **[http://localhost:8080](http://localhost:8080)**
4. To view the local database tables directly, access the H2 Console at **[http://localhost:8080/h2-console](http://localhost:8080/h2-console)** using:
   - **JDBC URL**: `jdbc:h2:mem:tolldb`
   - **Username**: `sa`
   - **Password**: `password`

---

## 2. Production Deployment on Render (Free + Neon.tech Persistent Database)
To deploy this application to Render with a persistent database that is free forever, follow these simple steps:

### Step 1: Create a Database on Neon.tech
1. Sign up for a free account at **[Neon.tech](https://neon.tech/)**.
2. Create a new project (select PostgreSQL 15 or 16).
3. Copy your connection details. You will need:
   - The connection string (e.g., `postgresql://alex:password@ep-cool-shadow-12345.us-east-2.aws.neon.tech/neondb?sslmode=require`)
   - Prepend `jdbc:` to the connection string to convert it to a JDBC URL, like so:
     `jdbc:postgresql://alex:password@ep-cool-shadow-12345.us-east-2.aws.neon.tech/neondb?sslmode=require`
   - Database User (e.g., `alex`)
   - Database Password (e.g., `password`)

### Step 2: Push Your Code to GitHub
1. Create a repository on GitHub.
2. Commit all your local code and push it to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit with toll and fuel monitor"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

### Step 3: Deploy on Render
1. Sign up at **[Render.com](https://render.com/)** and connect your GitHub account.
2. Click **New** -> **Web Service**.
3. Choose your repository.
4. Set the following details:
   - **Language**: `Docker` (Render will automatically detect our `Dockerfile` and build it)
   - **Instance Type**: `Free`
5. Click **Advanced** to add the following **Environment Variables**:
   - `SPRING_DATASOURCE_URL` = (Your Neon JDBC connection string from Step 1, e.g., `jdbc:postgresql://...`)
   - `SPRING_DATASOURCE_USERNAME` = (Your Neon database username)
   - `SPRING_DATASOURCE_PASSWORD` = (Your Neon database password)
6. Click **Deploy Web Service**.

Your app is now live! The Neon database is persistent and will never delete your data, while the Spring Boot app runs on Render's free tier.
