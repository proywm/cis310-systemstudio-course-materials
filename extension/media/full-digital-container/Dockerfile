FROM eclipse-temurin:17.0.16_8-jre-jammy

RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
      fonts-dejavu-core \
      libxext6 \
      libxi6 \
      libxrender1 \
      x11vnc \
      xvfb \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --home-dir /home/digital --uid 10001 digital

COPY entrypoint.sh /usr/local/bin/systemstudio-full-digital
RUN chmod 0555 /usr/local/bin/systemstudio-full-digital

USER digital
WORKDIR /workspace
EXPOSE 5900
ENTRYPOINT ["/usr/local/bin/systemstudio-full-digital"]
