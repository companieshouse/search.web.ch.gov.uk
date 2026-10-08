#!/bin/bash
# Start script for search-web-ch-gov-uk

PORT=3000
export NODE_PORT=${PORT}
exec node -r /opt/otel.js /opt/bin/www.js -- ${PORT}
