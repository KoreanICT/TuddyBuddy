FROM node:22-alpine AS build

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --non-interactive

COPY . .
ARG REACT_APP_BACK_END_URL=/back
ARG REACT_APP_DETECT_API_URL=/detect
ARG REACT_APP_KAKAO_REST_API_KEY
ENV REACT_APP_BACK_END_URL=${REACT_APP_BACK_END_URL} \
    REACT_APP_DETECT_API_URL=${REACT_APP_DETECT_API_URL} \
    REACT_APP_KAKAO_REST_API_KEY=${REACT_APP_KAKAO_REST_API_KEY}
RUN test -n "$REACT_APP_KAKAO_REST_API_KEY" || (echo "Kakao REST API build argument is required" >&2; exit 1); \
    yarn build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
