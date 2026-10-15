# Runs the compiled app in a container, the same way on any machine with
# Docker (docs/plataforma/infraestrutura.md). Previews and production stay on
# Vercel, and this image is never pushed to a registry.

FROM node:24-slim AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-slim AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
# Built without environment variables: .dockerignore keeps .env* out, and the
# container only receives them at run time (compose.yaml).
ENV NODE_ENV=production
RUN npm run build

FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# Docker sets HOSTNAME to the container id, and server.js listens on it.
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/public ./public

# The server writes its cache under .next, so the folder belongs to the
# unprivileged node user that ships with the official image.
RUN mkdir .next && chown node:node .next

# The standalone output has server.js and the traced node_modules, but not
# public/ or .next/static/, which are copied on their own.
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000
CMD ["node", "server.js"]
