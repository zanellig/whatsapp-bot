# ---- BUILD STAGE ----
    FROM node:21-alpine3.18 AS builder
    WORKDIR /app
    
    # Copy only dependency files first for caching
    COPY package.json pnpm-lock.yaml ./
    RUN corepack enable && corepack prepare pnpm@latest --activate
    
    # Install base build dependencies
    RUN apk add --no-cache --virtual .gyp-build-deps \
          python3 \
          make \
          g++ \
       && apk add --no-cache git
    
    # Install packages (including devDependencies for building)
    RUN pnpm install
    
    # Now copy rest of source
    COPY . .

    # Build the project
    RUN pnpm run build
    
    # Remove dev deps and prune to production-only
    RUN pnpm prune --prod
    
    # Optional: clean up caches
    RUN pnpm store prune && rm -rf /root/.npm
    
    # ---- DEPLOY STAGE ----
    FROM node:21-alpine3.18 AS deploy
    WORKDIR /app
    
    ARG PORT
    ENV PORT=$PORT
    EXPOSE $PORT
    
    # Copy only what's needed to run
    COPY --from=builder /app/dist ./dist
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/package.json ./
    COPY --from=builder /app/assets ./assets
    
    # Install PM2 globally
    RUN corepack enable && corepack prepare pnpm@latest --activate && pnpm install pm2 -g

    # Add non-root user
    RUN addgroup -g 1001 -S nodejs \
        && adduser -S -u 1001 nodejs \
        && chown -R nodejs:nodejs /app
    
    USER nodejs

    # Start the application using PM2 runtime with a cron restart every 12 hours
    CMD ["pm2-runtime", "start", "dist/app.js", "--cron", "0 */12 * * *"]