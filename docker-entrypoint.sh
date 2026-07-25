#!/bin/bash
set -e

echo "🚀 Starting Android Emulator with VNC..."

# Create supervisor log directory
mkdir -p /var/log/emulator
mkdir -p /var/run/supervisor

# Start supervisor
exec supervisord -c /etc/supervisor/supervisord.conf