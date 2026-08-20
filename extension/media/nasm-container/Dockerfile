# Multi-architecture manifest digest recorded 2026-08-20.
FROM debian:bookworm-slim@sha256:abd67ffcfa541b485a3dff59865ab629aa048a6c613e639d36e7456b0b229241

RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
       binutils gdb nasm qemu-user \
    && rm -rf /var/lib/apt/lists/*

COPY debug-nasm.sh /opt/systemstudio/debug-nasm.sh
RUN chmod 0555 /opt/systemstudio/debug-nasm.sh

LABEL org.opencontainers.image.title="SystemStudio CIS 310 NASM/ELF32 Workbench" \
      org.opencontainers.image.description="NASM, GNU ld, GDB, and QEMU-i386 for isolated CIS 310 labs" \
      edu.umich.dearborn.course="CIS 310 Fall 2026"

WORKDIR /work
