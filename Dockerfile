FROM alpine:latest

ARG PB_VERSION=0.28.4

RUN apk add --no-cache \
    unzip \
    ca-certificates \
    wget # Add wget to download the correct binary

# download and unzip PocketBase
# Dynamically select the binary based on the build architecture.
# This allows the same Dockerfile to work on local ARM (Apple Silicon) and production AMD64.
RUN PB_ARCH="amd64" && \
    if [ "${TARGETARCH}" = "arm64" ]; then \
        PB_ARCH="arm64"; \
    fi && \
    wget -O /tmp/pb.zip "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_${PB_ARCH}.zip" && \
    unzip /tmp/pb.zip -d /pb/

# Copy local migrations. This is crucial for applying schema changes during deployment.
COPY ./pb_migrations /pb/pb_migrations

# copy the local pb_hooks dir into the image
COPY ./pb_hooks /pb/pb_hooks

EXPOSE 8080

# start PocketBase
# The --http flag tells PocketBase to listen on port 8080 on all available network interfaces inside the container.
# This address (0.0.0.0) is NOT the address you use in your browser.
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8080"]
