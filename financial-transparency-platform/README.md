# Financial Transparency Platform

A comprehensive full-stack web application designed to bring transparency and accountability to institutional finances. This platform enables governments, NGOs, colleges, and schools to track, manage, and publicly display their financial transactions with complete audit trails and blockchain-style immutable records.

## 🌟 Features

### Core Functionality
- **Transparent Budget Management**: Create, approve, and track institutional budgets
- **Transaction Tracking**: Complete transaction lifecycle from creation to completion
- **Real-time Dashboard**: Interactive charts and visualizations for financial data
- **Public Access**: Public-facing dashboard for stakeholders to view financial data
- **Audit Trail**: Complete audit logging with blockchain-style immutable records
- **Role-based Access Control**: Multi-level user permissions (Admin, Auditor, Viewer, Public)

### Security & Trust
- **Blockchain-style Ledger**: Immutable transaction records with hash chains
- **Digital Signatures**: Cryptographic verification of transactions
- **Audit Logging**: Complete activity tracking with user attribution
- **JWT Authentication**: Secure token-based authentication
- **Data Integrity**: Automatic validation and integrity checks

### Reporting & Analytics
- **Interactive Charts**: Budget trends, spending analysis, vendor performance
- **Export Capabilities**: PDF and Excel report generation
- **Real-time Updates**: WebSocket-based live data updates
- **Drill-down Views**: Detailed analysis from budget to transaction level
- **Anomaly Detection**: Suspicious activity monitoring

### User Experience
- **Responsive Design**: Mobile-friendly interface with TailwindCSS
- **Multi-language Support**: Extensible internationalization
- **Accessibility**: WCAG compliant design
- **Progressive Web App**: Offline capabilities and app-like experience

## 🏗️ Architecture

### Backend (Node.js/Express)
- **API Server**: RESTful API with comprehensive endpoints
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT-based with role-based access control
- **Real-time**: Socket.IO for live updates
- **Security**: Helmet, CORS, rate limiting, input validation
- **Logging**: Winston-based structured logging

### Frontend (React)
- **UI Framework**: React 18 with functional components and hooks
- **State Management**: Redux Toolkit for global state
- **Styling**: TailwindCSS with custom design system
- **Charts**: Chart.js for interactive visualizations
- **Forms**: React Hook Form with validation
- **Routing**: React Router for SPA navigation

### Database Schema
- **Users & Institutions**: Multi-tenant user management
- **Budgets & Projects**: Hierarchical budget organization
- **Transactions**: Complete transaction lifecycle
- **Audit Logs**: Comprehensive activity tracking
- **Blockchain Records**: Immutable transaction verification

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 12+
- Docker and Docker Compose (optional)

### Option 1: Docker Deployment (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd financial-transparency-platform
   ```

2. **Configure environment**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Public Dashboard: http://localhost:3000/public

### Option 2: Manual Setup

1. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb financial_transparency
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your .env file
   npm run migrate  # Run database migrations
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## 📊 Usage Guide

### Initial Setup

1. **Create Super Admin Account**
   ```bash
   # Register the first user through the API or frontend
   # First registered user becomes super admin
   ```

2. **Institution Setup**
   - Create your institution profile
   - Add departments and projects
   - Set up vendor information

3. **User Management**
   - Invite team members
   - Assign appropriate roles
   - Configure permissions

### Budget Management

1. **Create Budget**
   - Define fiscal year and total amount
   - Set budget categories and allocations
   - Submit for approval

2. **Budget Approval Workflow**
   - Admin reviews and approves budgets
   - Activate approved budgets
   - Monitor utilization in real-time

### Transaction Processing

1. **Create Transactions**
   - Link to budgets and projects
   - Add vendor information
   - Include supporting documents

2. **Approval Process**
   - Auditor/Admin reviews transactions
   - Approve or reject with reasons
   - Complete approved transactions

3. **Blockchain Recording**
   - Automatic immutable record creation
   - Hash chain validation
   - Audit trail generation

### Public Transparency

1. **Public Dashboard**
   - View aggregated financial data
   - Filter by institution type
   - Access without authentication

2. **Stakeholder Access**
   - Students, parents, citizens can view
   - Real-time budget utilization
   - Transaction transparency

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=financial_transparency
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=production

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_password
```

#### Frontend
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Database Configuration

The application uses PostgreSQL with the following key tables:
- `users` - User accounts and authentication
- `institutions` - Organization information
- `budgets` - Budget definitions and allocations
- `transactions` - Financial transactions
- `audit_logs` - Complete audit trail
- `blockchain_records` - Immutable transaction records

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Session management and timeout
- Password hashing with bcrypt

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting

### Audit & Compliance
- Complete audit trail for all actions
- Blockchain-style immutable records
- Digital signatures for transactions
- Suspicious activity detection
- Compliance reporting

## 📈 Monitoring & Analytics

### Dashboard Metrics
- Budget utilization rates
- Transaction volumes and trends
- Department-wise spending
- Vendor performance analysis
- Project completion rates

### Audit Features
- Real-time activity monitoring
- Suspicious pattern detection
- Blockchain integrity verification
- Compliance reporting
- Export capabilities

## 🛠️ Development

### Project Structure
```
financial-transparency-platform/
├── backend/                 # Node.js API server
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   └── services/           # Business logic
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux store
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
├── docs/                   # Documentation
├── nginx/                  # Nginx configuration
└── docker-compose.yml      # Docker setup
```

### API Documentation

#### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

#### Budget Endpoints
- `GET /api/budget` - List budgets
- `POST /api/budget` - Create budget
- `PUT /api/budget/:id` - Update budget
- `PUT /api/budget/:id/approve` - Approve budget

#### Transaction Endpoints
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id/approve` - Approve transaction
- `GET /api/transactions/:id/audit` - Get audit trail

#### Dashboard Endpoints
- `GET /api/dashboard/overview` - Dashboard data
- `GET /api/dashboard/public` - Public dashboard
- `GET /api/dashboard/trends/budget` - Budget trends

### Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Integration tests
npm run test:integration
```

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   # Set production environment variables
   export NODE_ENV=production
   export DB_HOST=your-production-db
   export JWT_SECRET=your-production-secret
   ```

2. **Database Migration**
   ```bash
   npm run migrate:prod
   ```

3. **Build and Deploy**
   ```bash
   # Using Docker
   docker-compose -f docker-compose.prod.yml up -d
   
   # Or manual deployment
   npm run build
   npm run start:prod
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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write comprehensive tests
- Update documentation
- Follow semantic versioning

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [API Documentation](docs/api.md)
- [User Guide](docs/user-guide.md)
- [Deployment Guide](docs/deployment.md)
- [Troubleshooting](docs/troubleshooting.md)

### Community
- GitHub Issues for bug reports
- GitHub Discussions for questions
- Email: support@financial-transparency.org

## 🎯 Roadmap

### Version 2.0
- [ ] Mobile applications (iOS/Android)
- [ ] Advanced AI-powered anomaly detection
- [ ] Multi-currency support
- [ ] Advanced reporting with custom dashboards
- [ ] Integration with accounting software
- [ ] Automated compliance checking

### Version 2.1
- [ ] Machine learning for budget predictions
- [ ] Advanced data visualization
- [ ] API rate limiting and quotas
- [ ] Advanced user management
- [ ] Custom workflow engine

## 🏆 Acknowledgments

- Built with modern web technologies
- Inspired by transparency initiatives worldwide
- Community-driven development
- Open source contributions welcome

---

**Financial Transparency Platform** - Bringing accountability to institutional finances through technology.

For more information, visit our [documentation](docs/) or contact our [support team](mailto:support@financial-transparency.org).
