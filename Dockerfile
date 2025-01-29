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

    # Create non-root user and group FIRST
    RUN addgroup -g 1001 -S nodejs \
    && adduser -S -u 1001 nodejs -h /home/nodejs

    # Ensure /app is owned by nodejs (before WORKDIR)
    RUN mkdir -p /app && chown nodejs:nodejs /app
    
    WORKDIR /app
    
    ARG PORT
    ENV PORT=$PORT
    EXPOSE $PORT
    
   # Copy files with ownership set to nodejs:nodejs
    COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
    COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
    COPY --from=builder --chown=nodejs:nodejs /app/package.json ./
    COPY --from=builder --chown=nodejs:nodejs /app/assets ./assets
    COPY --from=builder --chown=nodejs:nodejs /app/.env ./
    
    # 1. Setup corepack AS ROOT
    RUN corepack enable && \
        corepack prepare pnpm@latest --activate
    
    # 2. Switch to non-root user
    USER nodejs
    ENV PNPM_HOME=/home/nodejs/.pnpm-global
    ENV PATH="$PNPM_HOME/bin:$PATH"
    
    # 3. Create user's pnpm directories and configure
    RUN mkdir -p $PNPM_HOME/bin && \
        pnpm config set global-bin-dir $PNPM_HOME/bin
    
    # 4. Install PM2 globally in user space
    RUN pnpm install pm2 -g
    
    # Final command remains the same
    CMD ["pm2-runtime", "start", "dist/app.js", "--cron", "0 */12 * * *"]