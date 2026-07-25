# Docker Security

## Best Practices

### 1. Never commit .env files
- Always use `.env.example`
- Add `.env` to `.gitignore`
- Change all secrets before deployment

### 2. Image Security
- Run `docker scan` before pushing
- Keep base image updated
- Remove unnecessary tools
- Use multi-stage builds

### 3. Container Security
- Run with least privileges
- Limit resource allocation
- Use read-only filesystems when possible
- Don't run as root

### 4. Network Security
- Use firewall rules
- Restrict port exposure
- Use HTTPS for remote access
- Change default passwords

### 5. Data Security
- Encrypt sensitive data
- Secure database connections
- Use secrets management
- Regular backups

## Pre-Deployment Checklist

- [ ] Change `JWT_SECRET` in `.env`
- [ ] Change VNC password in `supervisor/vnc.conf`
- [ ] Update firewall rules
- [ ] Enable HTTPS
- [ ] Review API rate limiting
- [ ] Set up monitoring/alerts
- [ ] Test disaster recovery
- [ ] Review access logs

## Monitoring

```bash
# Check container health
docker ps --format "{{.Names}}\t{{.Status}}"

# View resource usage
docker stats

# Check for vulnerabilities
docker scan android-emulator

# Review logs
docker logs -f android-emulator-vnc
```

## Security Headers

The backend uses Helmet.js to set security headers:
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- Window: 15 minutes
- Max requests: 100 per window
- Adjust in `.env` if needed

## Input Validation

All API inputs are validated:
- File paths checked
- Command injection prevention
- Length limits on inputs
- Type validation

## Emergency Procedures

### Reset to Factory
```bash
docker-compose down -v
docker-compose up -d
```

### Restore from Backup
```bash
cp backup/emulator.db ./data/emulator.db
docker-compose restart
```

### Recover Lost Data
- Snapshots stored in `/data/`
- Regular automated backups recommended
- Test recovery procedures regularly
