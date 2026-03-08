
# Environment Setup

Required services:

Supabase
Dokploy
GitHub

---

# Environment Variables

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DB_URL

BETTER_AUTH_SECRET
APP_BASE_URL

---

# Docker Deployment

Dockerfile:

FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

EXPOSE 3000

CMD ["npm","start"]
