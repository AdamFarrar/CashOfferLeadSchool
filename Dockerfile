# ── Stage 1: Install dependencies ──
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/auth/package.json ./packages/auth/package.json
COPY packages/database/package.json ./packages/database/package.json
COPY packages/services/package.json ./packages/services/package.json
COPY packages/analytics/package.json ./packages/analytics/package.json
COPY packages/experiments/package.json ./packages/experiments/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/email/package.json ./packages/email/package.json
COPY packages/automation/package.json ./packages/automation/package.json
COPY packages/events/package.json ./packages/events/package.json
COPY packages/ai/package.json ./packages/ai/package.json

RUN pnpm install --frozen-lockfile

# ── Stage 2: Build ──
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

# Copy everything including source
COPY . .

# Full install with all source present — ensures workspace symlinks resolve
RUN pnpm install --frozen-lockfile

# Declare build args so Dokploy can inject NEXT_PUBLIC_ vars at build time
ARG NEXT_PUBLIC_POSTHOG_KEY
ARG NEXT_PUBLIC_POSTHOG_HOST
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY

# Expose them as ENV for the Next.js build process
ENV NEXT_PUBLIC_POSTHOG_KEY=$NEXT_PUBLIC_POSTHOG_KEY
ENV NEXT_PUBLIC_POSTHOG_HOST=$NEXT_PUBLIC_POSTHOG_HOST
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY

ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build --filter=@cols/web

# ── Stage 3: Production runtime ──
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
