# Engine server image (Google Cloud Run / Fly.io / Azure / any VM).
# Weights are NOT in git. They are downloaded at BUILD time from pinned,
# checksum-verified Hugging Face URLs (scripts/fetch-models.mjs), so cold
# starts don't re-download ~350 MB.
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && ENGINE_MODEL_DIR=/app/models node scripts/fetch-models.mjs
FROM node:20-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production ENGINE_MODEL_DIR=/app/models PORT=8080 HOSTNAME=0.0.0.0 ENGINE_MATTING=on
COPY --from=build --chown=node:node /app /app
USER node
EXPOSE 8080
# fetch-models is a no-op when files are present (re-verifies checksums).
CMD ["sh", "-c", "node scripts/fetch-models.mjs && npx next start -H 0.0.0.0 -p ${PORT}"]
