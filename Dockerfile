FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV PATH=$PATH:$ANDROID_SDK_ROOT/cmdline-tools/bin:$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/emulator
ENV NODE_ENV=production
ENV DISPLAY=:99

# Install dependencies
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    wget \
    unzip \
    curl \
    git \
    x11vnc \
    xvfb \
    fluxbox \
    screen \
    dbus \
    libgl1-mesa-dev \
    libpulse0 \
    qemu-kvm \
    libvirt-daemon-system \
    adb \
    fastboot \
    python3 \
    supervisor \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Install Android SDK
RUN mkdir -p $ANDROID_SDK_ROOT && \
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-10406996_latest.zip -O cmdline-tools.zip && \
    unzip cmdline-tools.zip -d $ANDROID_SDK_ROOT && \
    rm cmdline-tools.zip

# Accept licenses and install components
RUN yes | $ANDROID_SDK_ROOT/cmdline-tools/bin/sdkmanager --sdk_root=$ANDROID_SDK_ROOT --licenses

RUN $ANDROID_SDK_ROOT/cmdline-tools/bin/sdkmanager --sdk_root=$ANDROID_SDK_ROOT \
    "platform-tools" \
    "emulator" \
    "platforms;android-34" \
    "system-images;android-34;google_apis;x86_64"

# Create AVD
RUN echo "no" | $ANDROID_SDK_ROOT/cmdline-tools/bin/avdmanager create avd \
    -n custom_rom_avd \
    -k "system-images;android-34;google_apis;x86_64" \
    -d "pixel_5" \
    --force

# Install noVNC
RUN apt-get update && apt-get install -y novnc websockify && \
    mkdir -p /usr/share/novnc && \
    rm -rf /var/lib/apt/lists/*

# Setup Node.js app
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY src ./src
COPY scripts ./scripts

# Create necessary directories
RUN mkdir -p /data /var/log/emulator /var/run/supervisor

# Copy supervisor config
COPY supervisor/supervisord.conf /etc/supervisor/supervisord.conf
COPY supervisor/emulator.conf /etc/supervisor/conf.d/emulator.conf
COPY supervisor/vnc.conf /etc/supervisor/conf.d/vnc.conf
COPY supervisor/xvfb.conf /etc/supervisor/conf.d/xvfb.conf
COPY supervisor/backend.conf /etc/supervisor/conf.d/backend.conf
COPY supervisor/novnc.conf /etc/supervisor/conf.d/novnc.conf

# Copy startup script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000 5555 5554 5900 6080

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["supervisord", "-c", "/etc/supervisor/supervisord.conf"]