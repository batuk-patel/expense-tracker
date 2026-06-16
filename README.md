# Varshik Toll Monitor

A simple REST API for tracking toll entries with amount and location, along with timestamp.

## Features

- **Create Toll Entries**: POST amount and location, automatically saved with timestamp
- **Retrieve Entries**: Get all entries or filter by location or date range
- **Update Entries**: Modify existing entries
- **Delete Entries**: Remove entries
- **PostgreSQL Database**: Persistent storage
- **Free Deployment**: Deploy to Railway for free

## API Endpoints

### Create Entry
```bash
POST /api/toll-entries
Content-Type: application/json

{
  "amount": 100.50,
  "location": "Highway Toll Gate A"
}
```

**Response:**
```json
{
  "id": 1,
  "amount": 100.50,
  "location": "Highway Toll Gate A",
  "entryTime": "2026-04-04T14:30:25"
}
```

### Get All Entries
```bash
GET /api/toll-entries
```

### Get Entry by ID
```bash
GET /api/toll-entries/{id}
```

### Get Entries by Location
```bash
GET /api/toll-entries/location/{location}
```

### Update Entry
```bash
PUT /api/toll-entries/{id}
Content-Type: application/json

{
  "amount": 120.00,
  "location": "Updated Location"
}
```

### Delete Entry
```bash
DELETE /api/toll-entries/{id}
```

## Local Development

### Prerequisites
- Java 17+
- Maven
- PostgreSQL

### Setup Local Database

1. **Install PostgreSQL** (if not already installed)

2. **Create a database:**
   ```bash
   psql -U postgres
   CREATE DATABASE tolldb;
   ```

3. **Update application.properties for local development:**
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/tolldb
   spring.datasource.username=postgres
   spring.datasource.password=your_password
   ```

### Run Locally
```bash
mvn clean install
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`

## Deployment on Render with Free PostgreSQL

This project is already Render-ready:
- `Dockerfile` builds the Spring Boot app
- `src/main/resources/application-prod.properties` reads Postgres settings from environment variables
- The production profile uses `spring.profiles.active=prod` and supports `PORT`, `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD`

### Option A: Use Render Web Service + Neon Free Postgres
Render's free web service tier is a good host for the app, and Neon offers a free persistent Postgres database with no hard time limit.

1. **Create a Neon free database**
   - Sign up at https://neon.tech
   - Create a new free project and database
   - Copy the connection details (host, port, database, username, password)

2. **Deploy the app on Render**
   - Go to https://render.com
   - Click **New** → **Web Service**
   - Connect your GitHub repo and select this project
   - Choose **Docker** if Render asks, or let it use the existing `Dockerfile`

3. **Set environment variables in Render**
   Add these values in the Render service settings:
   - `SPRING_DATASOURCE_URL`: `jdbc:postgresql://<host>:<port>/<database>`
   - `SPRING_DATASOURCE_USERNAME`: `<username>`
   - `SPRING_DATASOURCE_PASSWORD`: `<password>`
   - `PORT`: `8080` (Render usually provides this automatically, but setting it is safe)

4. **Deploy**
   - Trigger a deploy from Render
   - View logs and wait for the service to become healthy
   - Access it at the Render-generated URL

5. **Test the deployed app**
```bash
curl -X POST https://your-app-name.onrender.com/api/toll-entries \
  -H "Content-Type: application/json" \
  -d '{"amount": 100.50, "location": "Toll Gate A"}'

curl https://your-app-name.onrender.com/api/toll-entries
```

### Option B: Use Render Managed Postgres if available
If Render still offers a free Postgres database, use it directly:
1. Create a **PostgreSQL** database service in Render
2. Copy the connection values from the database dashboard
3. Set the same Render environment variables listed above
4. Deploy the web service and connect it to that database

### Why this works
- `application-prod.properties` already supports Postgres environment variables
- `Dockerfile` uses `java -Dserver.port=${PORT:-8080} -Dspring.profiles.active=prod -jar app.jar`
- The app uses Spring Data JPA with Postgres runtime driver included in `pom.xml`

### If you need truly free persistent storage
Render free web hosting + Neon free Postgres is the safest path today. Neon offers a persistent database that is separate from Render, while Render handles the app.

### Notes
- The app uses `spring.jpa.hibernate.ddl-auto=update`, so tables will be created automatically on startup
- If you use an external Postgres like Neon, just make sure it allows connections from Render
- Keep the `SPRING_DATASOURCE_*` values secret

## Development Stack

- **Framework**: Spring Boot 3.2.4
- **Database**: PostgreSQL with Spring Data JPA
- **Language**: Java 17
- **Build**: Maven
- **Deployment**: Railway

## Testing with curl/Postman

### Create Entry
```bash
curl -X POST http://localhost:8080/api/toll-entries \
  -H "Content-Type: application/json" \
  -d '{"amount": 250.75, "location": "Highway Gate B"}'
```

### Get All
```bash
curl http://localhost:8080/api/toll-entries
```

### Get by Location
```bash
curl http://localhost:8080/api/toll-entries/location/Highway%20Gate%20B
```

### Update
```bash
curl -X PUT http://localhost:8080/api/toll-entries/1 \
  -H "Content-Type: application/json" \
  -d '{"amount": 300, "location": "Updated Gate"}'
```

### Delete
```bash
curl -X DELETE http://localhost:8080/api/toll-entries/1
```

## Troubleshooting

**Port already in use:**
```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8081"
```

**Database connection issues:**
- Verify PostgreSQL is running
- Check credentials in `application.properties`
- Ensure database `tolldb` exists

**Build errors:**
```bash
mvn clean install -DskipTests
```

## License

MIT License - Feel free to use and modify!
