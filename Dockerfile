FROM alpine:latest

ARG PB_VERSION=0.28.4

RUN apk add --no-cache \
    unzip \
    ca-certificates \
    wget

# Download and unzip PocketBase into /pb
RUN PB_ARCH="amd64" && \
    if [ "${TARGETARCH}" = "arm64" ]; then \
        PB_ARCH="arm64"; \
    fi && \
    wget -O /tmp/pb.zip "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_${PB_ARCH}.zip" && \
    unzip /tmp/pb.zip -d /pb/

# Set the working directory
WORKDIR /pb

# Copy only the migrations. The hooks will be mounted as a volume.
COPY ./pb_migrations /pb/pb_migrations

# Copy the hooks directory
COPY ./pb_hooks /pb/pb_hooks

EXPOSE 8080

# Start PocketBase
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8080"]