FROM node:20.11.0-alpine3.18 AS development

WORKDIR /app

COPY --chown=node:node package*.json ./

RUN npm install

COPY --chown=node:node . .

RUN npm run build

FROM node:20.11.0-alpine3.18 AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY --chown=node:node package*.json ./

RUN npm install --omit=dev

COPY --chown=node:node --from=development /app/dist .

USER node

CMD ["node", "./main.js"]