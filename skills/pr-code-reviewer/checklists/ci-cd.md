# CI/CD Checklist

Comprehensive review checklist for CI/CD, Docker, and deployment-related changes.

---

## 1. Dockerfile Security

### CRITICAL - Must Check

| Check | Pattern | Why |
|-------|---------|-----|
| No secrets in Dockerfile | `ARG`/`ENV` with secrets | Secrets in image layers |
| Non-root user | `USER node` | Security best practice |
| Specific base image tag | `node:18.19.0-alpine` | Reproducibility |
| Multi-stage build | `FROM ... AS builder` | Smaller final image |

### Detection Patterns

```dockerfile
# CRITICAL: Secret in Dockerfile
ENV API_KEY=sk-1234567890  # Exposed in image layers!
ARG DATABASE_PASSWORD=secret  # Also exposed!

# SECURE: Use runtime secrets
# Pass via docker run -e or docker-compose

# CRITICAL: Running as root
FROM node:18
WORKDIR /app
# No USER directive = runs as root!

# SECURE: Non-root user
FROM node:18
WORKDIR /app
RUN chown -R node:node /app
USER node

# WARNING: Floating tag
FROM node:18  # Could change unexpectedly

# SECURE: Pinned version
FROM node:18.19.0-alpine3.19

# WARNING: Large image (no multi-stage)
FROM node:18
COPY . .
RUN npm install
RUN npm run build
# Final image includes devDependencies!

# SECURE: Multi-stage build
FROM node:18 AS builder
COPY . .
RUN npm ci && npm run build

FROM node:18-alpine
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
```

---

## 2. Docker Compose

### CRITICAL - Must Check

| Check | Pattern | Why |
|-------|---------|-----|
| No hardcoded secrets | Use `.env` file | Security |
| Health checks defined | `healthcheck:` | Orchestration |
| Resource limits | `deploy.resources.limits` | Stability |
| Restart policy | `restart: unless-stopped` | Availability |

### Detection Patterns

```yaml
# CRITICAL: Hardcoded secrets
services:
  app:
    environment:
      - DATABASE_PASSWORD=secret123  # Exposed in repo!

# SECURE: Use .env file
services:
  app:
    env_file:
      - .env

# WARNING: No health check
services:
  app:
    image: myapp

# SECURE: With health check
services:
  app:
    image: myapp
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

# WARNING: No resource limits
services:
  app:
    image: myapp
    # Can consume unlimited resources!

# SECURE: With limits
services:
  app:
    image: myapp
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
```

---

## 3. CircleCI Configuration

### CRITICAL - Must Check

| Check | Pattern | Why |
|-------|---------|-----|
| Secrets in context | `context: secrets` | Not in config |
| Cache keys versioned | `v1-deps-{{ checksum }}` | Cache invalidation |
| Parallelism for tests | `parallelism: 4` | Speed |
| Approval for prod | `type: approval` | Safety |

### Detection Patterns

```yaml
# CRITICAL: Secret in config
jobs:
  deploy:
    steps:
      - run: |
          export API_KEY=sk-12345  # Exposed in repo!

# SECURE: Use context
jobs:
  deploy:
    context: production-secrets
    steps:
      - run: echo $API_KEY  # From context

# WARNING: No cache versioning
- restore_cache:
    keys:
      - deps-{{ checksum "package-lock.json" }}

# SECURE: Versioned cache key
- restore_cache:
    keys:
      - v2-deps-{{ checksum "package-lock.json" }}
      - v2-deps-

# WARNING: No approval for production
workflows:
  deploy:
    jobs:
      - build
      - deploy-prod  # Deploys automatically!

# SECURE: Require approval
workflows:
  deploy:
    jobs:
      - build
      - hold:
          type: approval
          requires:
            - build
      - deploy-prod:
          requires:
            - hold
```

---

## 4. Environment Variables

### CRITICAL - Must Check

| Check | Pattern | Why |
|-------|---------|-----|
| No secrets in code | Check for API keys | Security |
| .env in .gitignore | `.env` not committed | Security |
| .env.example exists | Template for devs | Onboarding |
| dotenv-vault for secrets | `.env.vault` | Encrypted secrets |

### Detection Patterns

```javascript
// CRITICAL: Hardcoded secret
const API_KEY = 'sk-1234567890abcdef'

// SECURE: From environment
const API_KEY = process.env.API_KEY

// WARNING: .env committed
// Check .gitignore includes:
.env
.env.local
.env.*.local

// SECURE: Use dotenv-vault
// .env.vault is encrypted, safe to commit
// Decrypt with DOTENV_KEY at runtime
```

---

## 5. Build & Deploy Scripts

### CRITICAL - Must Check

| Check | Pattern | Why |
|-------|---------|-----|
| npm ci not npm install | `npm ci` | Reproducible builds |
| Lock file committed | `package-lock.json` | Version pinning |
| Build fails on error | `set -e` in scripts | Catch failures |
| No force push to main | `--force` blocked | History protection |

### Detection Patterns

```bash
# WARNING: npm install in CI
npm install  # Can install different versions!

# SECURE: npm ci
npm ci  # Uses exact versions from lock file

# WARNING: Script continues on error
#!/bin/bash
npm run build
npm run test  # Runs even if build failed!

# SECURE: Exit on error
#!/bin/bash
set -e
npm run build
npm run test

# CRITICAL: Force push in script
git push --force origin main  # Destroys history!

# SECURE: Never force push main
# Add branch protection rules
```

---

## 6. Dependency Management

### CRITICAL - Must Check

| Check | Pattern | Why |
|-------|---------|-----|
| No vulnerable deps | `npm audit` | Security |
| Lock file updated | `package-lock.json` | Consistency |
| Major version bumps reviewed | `^1.0.0` → `^2.0.0` | Breaking changes |
| Unused deps removed | `depcheck` | Bundle size |

### Detection Patterns

```json
// WARNING: Floating versions
{
  "dependencies": {
    "express": "*",        // Any version!
    "lodash": "latest"     // Unpredictable!
  }
}

// SECURE: Pinned versions
{
  "dependencies": {
    "express": "^4.18.2",  // Minor updates only
    "lodash": "4.17.21"    // Exact version
  }
}

// Check for vulnerabilities
npm audit
npm audit fix

// Check for unused dependencies
npx depcheck
```

---

## 7. Deployment Safety

### CRITICAL - Must Check

| Check | Pattern | Why |
|-------|---------|-----|
| Health check endpoint | `/health` or `/api/health` | Load balancer |
| Graceful shutdown | `SIGTERM` handler | Zero downtime |
| Database migrations first | Run before deploy | Data ready |
| Rollback plan | Previous version tagged | Recovery |

### Detection Patterns

```javascript
// WARNING: No health check endpoint
// Add to Express app:
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

// WARNING: No graceful shutdown
// Process killed immediately, requests dropped!

// SECURE: Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('HTTP server closed')
    // Close database connections
    mysql.end()
    redis.quit()
    process.exit(0)
  })
  
  // Force exit after timeout
  setTimeout(() => {
    console.error('Forced shutdown after timeout')
    process.exit(1)
  }, 30000)
})
```

---

## 8. Monitoring & Logging

### WARNING - Should Check

| Check | Pattern | Why |
|-------|---------|-----|
| Structured logging | JSON format | Parsing |
| Log levels appropriate | `info`, `error`, `debug` | Filtering |
| No sensitive data logged | Mask passwords | Security |
| Error tracking configured | Sentry, etc. | Alerting |

### Detection Patterns

```javascript
// WARNING: Unstructured logging
console.log('User logged in: ' + userId)

// SECURE: Structured logging
logger.info('User logged in', { userId, timestamp: Date.now() })

// CRITICAL: Logging sensitive data
logger.info('Login attempt', { email, password })  // Password exposed!

// SECURE: Mask sensitive fields
logger.info('Login attempt', { email, password: '***' })
```

---

## 9. Breaking Changes in CI/CD

### Auto-Flag These Changes

| Signal | Severity | Action |
|--------|----------|--------|
| Node version changed | WARNING | Test all services |
| Base image changed | WARNING | Verify compatibility |
| Environment variable renamed | CRITICAL | Update all deployments |
| Port changed | CRITICAL | Update load balancer |
| Health check path changed | CRITICAL | Update orchestration |

---

## Quick Checklist

Copy this for PR reviews:

```markdown
## CI/CD Review

### Dockerfile
- [ ] No secrets in Dockerfile
- [ ] Non-root user configured
- [ ] Base image tag pinned
- [ ] Multi-stage build (if applicable)

### Docker Compose
- [ ] Secrets in .env file (not hardcoded)
- [ ] Health checks defined
- [ ] Resource limits set

### CircleCI
- [ ] Secrets in context (not config)
- [ ] Cache keys versioned
- [ ] Approval required for production

### Environment
- [ ] No secrets in code
- [ ] .env in .gitignore
- [ ] .env.example exists

### Build
- [ ] npm ci used (not npm install)
- [ ] Lock file committed
- [ ] Scripts exit on error

### Deployment
- [ ] Health check endpoint exists
- [ ] Graceful shutdown handler
- [ ] Rollback plan documented

### Breaking Changes
- [ ] Node version change tested
- [ ] Environment variable renames communicated
- [ ] Port changes updated in infrastructure
```
