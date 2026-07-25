# Quick Start Guide

## Prerequisites
- Docker & Docker Compose installed
- 4+ GB RAM available
- Linux host (recommended for KVM support)
- VNC Viewer or browser for remote access

## Installation

```bash
# Clone the repository
git clone https://github.com/flomop404-jpg/Android-Emulator-
cd Android-Emulator-

# Copy environment file
cp .env.example .env

# Build Docker image
docker-compose build

# Start services
docker-compose up -d

# Wait for emulator to boot (60 seconds)
sleep 60

# Verify all services are running
docker-compose ps
```

## Access Methods

### 1. VNC Viewer (Desktop Client)
```bash
# Connect with VNC Viewer to:
Server: localhost:5900
Password: secret

# Or use command line (Linux/Mac):
vncviewer localhost:5900
```

### 2. Browser (noVNC - No Installation Required)
```
Open: http://localhost:6080
```

### 3. ADB Command Line
```bash
# Connect
adb connect localhost:5555

# Check devices
adb devices

# Open shell
adb shell
```

### 4. Backend API
```bash
# Check health
curl http://localhost:3000/api/health

# Get status
curl http://localhost:3000/api/emulator/status
```

## Common Tasks

### View Logs
```bash
docker-compose logs -f android-emulator-vnc
```

### Flash ROM
```bash
# Copy ROM to roms/ directory
cp my_rom.img ./roms/

# Flash via API
curl -X POST http://localhost:3000/api/rom/flash \
  -H "Content-Type: application/json" \
  -d '{"rom_path": "/opt/roms/my_rom.img", "partition": "boot"}'
```

### Install APK
```bash
curl -X POST http://localhost:3000/api/app/install \
  -H "Content-Type: application/json" \
  -d '{"apk_path": "/opt/apps/myapp.apk"}'
```

### Execute Shell Command
```bash
curl -X POST http://localhost:3000/api/shell \
  -H "Content-Type: application/json" \
  -d '{"command": "am start -n com.example/.MainActivity"}'
```

### Monitor Services
```bash
# Check supervisor status
docker exec android-emulator-vnc supervisorctl status

# Restart specific service
docker exec android-emulator-vnc supervisorctl restart emulator

# Monitor resources
docker stats android-emulator-vnc
```

## Troubleshooting

### VNC Black Screen
- Wait 60+ seconds for full boot
- Check logs: `docker-compose logs android-emulator-vnc | grep emulator`
- Restart VNC: `docker exec android-emulator-vnc supervisorctl restart vnc`

### Can't Connect to Emulator
- Verify container is running: `docker-compose ps`
- Check ADB: `adb connect localhost:5555`
- Review logs: `docker-compose logs android-emulator-vnc`

### Slow Performance
- Increase Docker RAM allocation
- Ensure KVM is available: `grep -o 'vmx\|svm' /proc/cpuinfo`
- Check host resources: `docker stats`

## Production Deployment

### On Remote Server

```bash
# SSH to server
ssh user@your-server

# Clone and setup
git clone https://github.com/flomop404-jpg/Android-Emulator-
cd Android-Emulator-
cp .env.example .env

# Edit environment
nano .env
# Change JWT_SECRET and other sensitive values

# Start
docker-compose up -d

# Access
# VNC: your-server-ip:5900
# Browser: http://your-server-ip:6080
# API: http://your-server-ip:3000
```

### Security Tips
- Change VNC password in `supervisor/vnc.conf`
- Set strong `JWT_SECRET` in `.env`
- Use firewall to restrict access
- Enable HTTPS for remote access
- Use VPN for sensitive operations

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Review README.md for detailed API docs
3. Create issue on GitHub

**Happy emulating! 🚀**
