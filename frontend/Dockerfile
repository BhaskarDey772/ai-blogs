### Serve stage
FROM public.ecr.aws/nginx/nginx:stable-alpine

RUN apk add --no-cache gettext bash

# Copy custom nginx config → THIS WAS MISSING
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built frontend files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy runtime environment loader
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

EXPOSE 80
