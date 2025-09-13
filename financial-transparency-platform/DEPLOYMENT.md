# Deployment Guide - Financial Transparency Platform

## Quick Start

### Option 1: Docker Compose (Recommended)

1. **Prerequisites**
   - Docker Desktop installed and running
   - Git (to clone the repository)

2. **Setup**
   ```bash
   # Clone the repository
   git clone <repository-url>
   cd financial-transparency-platform
   
   # Configure environment
   cp backend/.env.example backend/.env
   # Edit backend/.env with your settings
   
   # Start all services
   docker-compose up -d
   ```

3. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Public Dashboard: http://localhost:3000/public

### Option 2: Manual Setup

1. **Prerequisites**
   - Node.js 18+ and npm
   - PostgreSQL 12+
   - Git

2. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb financial_transparency
   ```

3. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database credentials
   npm run migrate  # Run database migrations
   npm start
   ```

4. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## Environment Configuration

### Backend (.env)
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=financial_transparency
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Blockchain Configuration
BLOCKCHAIN_DIFFICULTY=4
BLOCKCHAIN_VALIDATOR=system

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@yourdomain.com
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## Production Deployment

### Docker Production Setup

1. **Create production docker-compose file**
   ```yaml
   # docker-compose.prod.yml
   version: '3.8'
   services:
     db:
       image: postgres:13
       environment:
         POSTGRES_DB: financial_transparency
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: ${DB_PASSWORD}
       volumes:
         - postgres_data:/var/lib/postgresql/data
       restart: unless-stopped

     backend:
       build: 
         context: ./backend
         dockerfile: Dockerfile
       environment:
         NODE_ENV: production
         DB_HOST: db
         DB_PASSWORD: ${DB_PASSWORD}
         JWT_SECRET: ${JWT_SECRET}
       depends_on:
         - db
       restart: unless-stopped

     frontend:
       build:
         context: ./frontend
         dockerfile: Dockerfile
       ports:
         - "80:80"
         - "443:443"
       depends_on:
         - backend
       restart: unless-stopped

   volumes:
     postgres_data:
   ```

2. **Deploy**
   ```bash
   # Set environment variables
   export DB_PASSWORD=your_secure_password
   export JWT_SECRET=your_secure_jwt_secret
   
   # Deploy
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Cloud Deployment Options

#### AWS Deployment
- **ECS/Fargate**: Container orchestration
- **RDS**: Managed PostgreSQL
- **CloudFront**: CDN for frontend
- **ALB**: Load balancing

#### Google Cloud Platform
- **Cloud Run**: Serverless containers
- **Cloud SQL**: Managed database
- **Cloud CDN**: Content delivery
- **Cloud Load Balancing**: Traffic distribution

#### Azure Deployment
- **Container Instances**: Container hosting
- **Azure Database**: PostgreSQL service
- **CDN**: Content delivery network
- **Application Gateway**: Load balancing

## Security Considerations

### Production Security Checklist

- [ ] Use strong, unique JWT secrets
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure proper CORS settings
- [ ] Set up rate limiting
- [ ] Enable database SSL connections
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Regular security updates
- [ ] Backup strategy implementation

### SSL/HTTPS Setup

1. **Obtain SSL Certificate**
   - Let's Encrypt (free)
   - Commercial certificate provider
   - Cloud provider managed certificates

2. **Configure Nginx**
   ```nginx
   server {
       listen 443 ssl http2;
       server_name your-domain.com;
       
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
       
       # Security headers
       add_header Strict-Transport-Security "max-age=31536000" always;
       add_header X-Frame-Options DENY;
       add_header X-Content-Type-Options nosniff;
   }
   ```

## Monitoring and Maintenance

### Health Checks
- Backend: `GET /api/health`
- Database connectivity
- Blockchain integrity verification

### Logging
- Application logs: `backend/logs/`
- Audit logs: Database + file system
- Error tracking: Consider Sentry integration

### Backup Strategy
```bash
# Database backup
pg_dump financial_transparency > backup_$(date +%Y%m%d).sql

# File uploads backup
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz backend/uploads/
```

### Performance Monitoring
- Database query performance
- API response times
- Frontend loading times
- Resource utilization

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL service status
   - Verify credentials in .env
   - Ensure database exists

2. **Frontend Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify environment variables

3. **API Errors**
   - Check backend logs
   - Verify JWT configuration
   - Test database connectivity

4. **Docker Issues**
   - Ensure Docker is running
   - Check port conflicts
   - Verify docker-compose.yml syntax

### Debug Commands
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs backend
docker-compose logs frontend

# Database connection test
docker-compose exec backend npm run db:test

# Restart specific service
docker-compose restart backend
```

## Scaling Considerations

### Horizontal Scaling
- Load balancer configuration
- Database read replicas
- Redis for session management
- CDN for static assets

### Performance Optimization
- Database indexing
- Query optimization
- Caching strategies
- Asset compression

## Support and Maintenance

### Regular Tasks
- [ ] Security updates
- [ ] Database maintenance
- [ ] Log rotation
- [ ] Backup verification
- [ ] Performance monitoring
- [ ] User access review

### Update Process
1. Test in staging environment
2. Create database backup
3. Deploy during maintenance window
4. Verify functionality
5. Monitor for issues

For additional support, refer to the main README.md or contact the development team.
