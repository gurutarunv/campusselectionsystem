# Deployment Guide: Campus Placement Assistance

## 1. Containerized Deployment with Docker & Docker Compose

The repository includes multi-stage Dockerfiles and a `docker-compose.yml` to orchestrate MySQL 8.0, the Spring Boot API, and the React frontend.

### Running with Docker Compose:
```bash
docker compose up --build -d
```

### Services Started:
1. **`mysql-db`**: MySQL 8.0 instance running on port `3306` with persistent volume mount.
2. **`backend-api`**: Multi-stage Java 21 build running Spring Boot on port `8080`.
3. **`frontend-app`**: Nginx Alpine container serving optimized React build on port `80` (or mapped to port `3000`).

---

## 2. Standalone Cloud Deployment (Render, AWS, Railway, Heroku)

### Backend Deployment (e.g., Render / Railway / AWS Elastic Beanstalk):
1. **Build Command:** `./mvnw clean package -DskipTests`
2. **Start Command:** `java -jar target/campus-placement-assistance-0.0.1-SNAPSHOT.jar`
3. **Environment Variables:**
   - `SPRING_PROFILES_ACTIVE=prod`
   - `DB_HOST=<cloud_mysql_host>`
   - `DB_PORT=3306`
   - `DB_NAME=campus_placement_db`
   - `DB_USERNAME=<cloud_mysql_user>`
   - `DB_PASSWORD=<cloud_mysql_password>`
   - `JWT_SECRET=<64_char_secure_random_key>`

### Frontend Deployment (e.g., Vercel / Netlify / Cloudflare Pages):
1. **Build Command:** `npm run build`
2. **Publish Directory:** `dist`
3. **Environment Variable:**
   - `VITE_API_BASE_URL=https://your-backend-api.onrender.com/api/v1`
