FROM --platform=linux/amd64 debian:bookworm-slim@sha256:abd67ffcfa541b485a3dff59865ab629aa048a6c613e639d36e7456b0b229241

RUN apt-get update \
    && apt-get install -y --no-install-recommends binutils gdb make nasm \
    && rm -rf /var/lib/apt/lists/*

COPY systemstudio-asm /usr/local/bin/systemstudio-asm
RUN chmod 0755 /usr/local/bin/systemstudio-asm

WORKDIR /workspace
ENTRYPOINT ["/usr/local/bin/systemstudio-asm"]
