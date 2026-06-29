# syntax=docker/dockerfile:1

FROM nginx:1.28-alpine

RUN rm -rf /etc/nginx/conf.d/*

COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/conf.d/ /etc/nginx/conf.d/

EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]