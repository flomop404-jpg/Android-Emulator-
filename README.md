# Android Emulator with VNC & Backend API

A production-ready Docker setup for running Android emulator with:
- ✅ VNC remote desktop access (port 5900)
- ✅ noVNC browser access (port 6080)
- ✅ Express.js backend API for emulator control
- ✅ ROM flashing capabilities
- ✅ Job queue system (Bull + Redis)
- ✅ Structured logging (Winston)
- ✅ Health checks & monitoring
- ✅ Rate limiting & input validation
- ✅ ADB integration

## Quick Start

### Prerequisites
- Docker & Docker Compose
- 4+ GB RAM
- Linux host (recommended for KVM acceleration)

### Start Services

```bash
# Clone and navigate
git clone https://github.com/flomop404-jpg/Android-Emulator-
cd Android-Emulator-

# Build and start
docker-compose up -d --build

# Wait for emulator to boot (60 seconds)
sleep 60

# Check services
docker-compose ps
```

## Access Methods

### 1. **VNC Viewer (Desktop)**
- **Host:** `localhost`
- **Port:** `5900`
- **Password:** `secret`

Install VNC viewer:
```bash
# macOS
brew install vnc-viewer

# Ubuntu/Debian
sudo apt-get install tigervnc-viewer

# Then connect
vncviewer localhost:5900
```

### 2. **Browser (noVNC)**
Open your browser and go to:
```
http://localhost:6080
```

### 3. **ADB Command Line**
```bash
adb connect localhost:5555
adb devices
adb shell
```

### 4. **Backend API**
```bash
# Check health
curl http://localhost:3000/api/health

# Get emulator status
curl http://localhost:3000/api/emulator/status

# Flash ROM
curl -X POST http://localhost:3000/api/rom/flash \
  -H "Content-Type: application/json" \
  -d '{
    "rom_path": "/opt/roms/boot.img",
    "partition": "boot"
  }'

# Install APK
curl -X POST http://localhost:3000/api/app/install \
  -H "Content-Type: application/json" \
  -d '{"apk_path": "/opt/apps/myapp.apk"}'

# Execute shell command
curl -X POST http://localhost:3000/api/shell \
  -H "Content-Type: application/json" \
  -d '{"command": "am start -n com.example/.MainActivity"}'
```

## Directory Structure

```
Android-Emulator-/
├── Dockerfile                 # Main Docker image
├── docker-compose.yml         # Multi-service setup
├── docker-entrypoint.sh       # Container startup script
├── package.json               # Node.js dependencies
├── .env                       # Environment variables
├── .env.example               # Example env file
├── README.md                  # This file
│
├── src/
│   ├── server.js              # Express backend
│   ├── utils/
│   │   ├── logger.js          # Winston logger
│   │   └── adb.js             # ADB utilities
│   ├── db/
│   │   └── database.js        # SQLite setup
│   ├── queue/
│   │   └── jobs.js            # Bull job queue
│   └── routes/
│       └── vnc.js             # VNC API routes
│
├── supervisor/
│   ├── supervisord.conf       # Supervisor main config
│   ├── xvfb.conf              # Virtual frame buffer
│   ├── vnc.conf               # VNC server
│   ├── emulator.conf          # Android emulator
│   ├── backend.conf           # Node.js backend
│   └── novnc.conf             # noVNC web server
│
├── scripts/
│   ├── health-check.js        # Health check script
│   ├── flash-rom.js           # ROM flashing script
│   └── monitor-emulator.js    # Monitoring script
│
├── roms/                      # Custom ROMs (mount point)
├── data/                      # Persistent data
└── logs/                      # Log files
```

## Configuration

### Environment Variables (`.env`)

```env
# Server
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Android SDK
ANDROID_SDK_ROOT=/opt/android-sdk

# Redis
REDIS_URL=redis://redis:6379

# Database
DATABASE_URL=sqlite:///data/emulator.db

# JWT
JWT_SECRET=your-secret-key-change-this

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Timeouts (ms)
ADB_TIMEOUT=30000
BOOT_TIMEOUT=60000
FLASH_TIMEOUT=120000
```

## API Documentation

### Health & Status

#### GET `/api/health`
Check server health status.

**Response:**
```json
{
  "status": "healthy",
  "uptime": 123.45,
  "emulator": "connected",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### GET `/api/emulator/status`
Get emulator connection status.

**Response:**
```json
{
  "status": "connected",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Emulator Control

#### POST `/api/emulator/boot`
Boot the emulator.

#### POST `/api/emulator/reboot`
Reboot the emulator.

### ROM Flashing

#### POST `/api/rom/flash`
Queue a ROM flash job.

**Body:**
```json
{
  "rom_path": "/opt/roms/boot.img",
  "partition": "boot"
}
```

**Response:**
```json
{
  "job_id": "abc-123",
  "status": "queued",
  "rom_path": "/opt/roms/boot.img",
  "partition": "boot"
}
```

#### GET `/api/rom/flash/:job_id`
Get flash job status.

### Shell Commands

#### POST `/api/shell`
Execute shell command on emulator.

**Body:**
```json
{
  "command": "getprop ro.build.version.release"
}
```

**Response:**
```json
{
  "command": "getprop ro.build.version.release",
  "output": "14"
}
```

### App Management

#### POST `/api/app/install`
Install APK file.

**Body:**
```json
{
  "apk_path": "/opt/apps/myapp.apk"
}
```

#### POST `/api/app/uninstall`
Uninstall app.

**Body:**
```json
{
  "package_name": "com.example.app"
}
```

### File Transfer

#### POST `/api/files/push`
Push file to emulator.

**Body:**
```json
{
  "local_path": "/host/path/file.txt",
  "remote_path": "/sdcard/file.txt"
}
```

#### GET `/api/files/pull`
Pull file from emulator.

**Query:**
```
?remote_path=/sdcard/file.txt&local_path=/host/path/file.txt
```

### VNC Status

#### GET `/api/vnc/status`
Get VNC server status.

**Response:**
```json
{
  "vnc_running": true,
  "ports": {
    "vnc": 5900,
    "novnc": 6080
  },
  "access": {
    "vnc_viewer": "localhost:5900",
    "browser": "http://localhost:6080"
  }
}
```

#### POST `/api/vnc/restart`
Restart VNC server.

#### GET `/api/vnc/resolution`
Get screen resolution.

## Useful Commands

```bash
# View logs
docker-compose logs -f android-emulator-vnc

# Connect via ADB
adb connect localhost:5555
adb shell

# Push ROM file
adb push my_rom.img /opt/roms/

# Check supervisor status
docker exec android-emulator-vnc supervisorctl status

# Restart emulator
docker exec android-emulator-vnc supervisorctl restart emulator

# Restart VNC
docker exec android-emulator-vnc supervisorctl restart vnc

# Monitor resources
docker stats android-emulator-vnc

# Access container shell
docker exec -it android-emulator-vnc bash
```

## Troubleshooting

### VNC won't connect
```bash
# Check if VNC is running
docker exec android-emulator-vnc supervisorctl status vnc

# View VNC logs
docker exec android-emulator-vnc tail -f /var/log/emulator/vnc.log

# Restart VNC
docker exec android-emulator-vnc supervisorctl restart vnc
```

### Black screen in VNC
- Wait 60+ seconds for emulator to fully boot
- Check emulator logs: `docker logs -f android-emulator-vnc | grep emulator`

### Emulator won't boot
```bash
# Check logs
docker-compose logs android-emulator-vnc

# Ensure KVM is available
grep -o 'vmx\|svm' /proc/cpuinfo

# Check permissions
docker exec android-emulator-vnc ls -la /dev/kvm
```

### Slow performance
- Increase Docker CPU & RAM allocation
- Use `-qemu -enable-kvm` flag (already enabled)
- Reduce screen resolution in VNC

## Production Deployment

### On Remote Server

1. **Push to server:**
```bash
git clone https://github.com/flomop404-jpg/Android-Emulator-
cd Android-Emulator-
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with production values
nano .env
```

3. **Start services:**
```bash
docker-compose up -d --build
```

4. **Access remotely:**
```bash
# VNC
vncviewer your-server-ip:5900

# Browser
http://your-server-ip:6080

# API
curl http://your-server-ip:3000/api/health
```

### Docker Registry

```bash
# Build image
docker build -t flomop404-jpg/android-emulator:latest .

# Push to registry
docker push flomop404-jpg/android-emulator:latest

# Pull and run
docker run -d \
  --privileged \
  -p 5900:5900 \
  -p 6080:6080 \
  -p 3000:3000 \
  flomop404-jpg/android-emulator:latest
```

## Security Considerations

- ⚠️ Change `JWT_SECRET` in production
- ⚠️ Use VNC password (update in supervisor config)
- ⚠️ Enable authentication on backend API
- ⚠️ Use HTTPS/TLS for remote connections
- ⚠️ Restrict file operations to safe directories
- ⚠️ Run with least privilege (non-root if possible)

## Performance Tips

- Use KVM acceleration (Linux only): already enabled
- Allocate 4+ GB RAM to Docker
- 2+ CPU cores recommended
- SSD for better I/O
- Disable animations in Android settings

## Support & Issues

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Review troubleshooting section above
3. Create an issue on GitHub

## License

MIT

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

**Happy emulating! 🚀**
