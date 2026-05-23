# syntax = docker/dockerfile:1

FROM node:20-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable && corepack prepare pnpm@10.0.0 --activate

WORKDIR /app

# Install dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json apps/web/
COPY packages/types/package.json packages/types/
RUN pnpm install --no-frozen-lockfile

# Copy source
COPY . .

# Build
RUN pnpm --filter @atlasnexus/ai2work-types build
RUN pnpm --filter @atlasnexus/ai2work-web build

# Standalone output
RUN cp -r apps/web/.next/standalone ./standalone && \
    cp -r apps/web/.next/static ./standalone/apps/web/.next/static && \
    cp -r apps/web/public ./standalone/apps/web/public 2>/dev/null || true

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=0 /app/standalone ./
EXPOSE 3000
CMD ["node", "server.js"]
