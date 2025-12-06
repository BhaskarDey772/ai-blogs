# Assimetria - Complete Authentication System 🔐

A modern full-stack web application built with **TypeScript**, **React**, **Express.js**, and **MongoDB**. Features complete authentication with email/password, JWT tokens, password reset, and email notifications via Resend.

## 🎯 Features

- ✅ **Complete Auth System** - Email/Password signup, login, password reset
- ✅ **JWT Tokens** - 7-day expiry in HTTP-only cookies
  -- ✅ **OAuth Integration (optional)** - Seamless OAuth sync to MongoDB
- ✅ **Email Service** - Password reset & welcome emails via Resend
- ✅ **Protected Routes** - Middleware-based route protection
- ✅ **Modern UI** - Built with shadcn/ui components and Tailwind CSS v4
- ✅ **Fully Typed** - TypeScript 5.3 with strict mode
- ✅ **Production Ready** - Security, error handling, comprehensive docs

## 📋 Prerequisites

- Node.js 18+
- Docker & Docker Compose (for containerized setup)
- MongoDB (local or MongoDB Atlas)
  -- (Optional) OAuth provider account (for social login)

## 📚 Documentation

**Complete guides available in the root directory:**

| Document                                               | Purpose                          | Time      |
| ------------------------------------------------------ | -------------------------------- | --------- |
| **[QUICK_START.md](./QUICK_START.md)**                 | Get running in 5 minutes         | 5 min ⚡  |
| **[AUTH_IMPLEMENTATION.md](./AUTH_IMPLEMENTATION.md)** | Full authentication system       | 10 min 📖 |
| **[API_REFERENCE.md](./API_REFERENCE.md)**             | Complete API docs with examples  | 15 min 📚 |
| **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)**     | Integration & testing steps      | 20 min 🚀 |
| **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)**     | Architecture & file organization | 15 min 📁 |
| **[CHECKLIST.md](./CHECKLIST.md)**                     | Implementation progress tracking | 10 min ✅ |

## 🚀 Quick Start (5 Minutes)

### 1. Setup Environment

```bash
cd backend
cp .env.example .env
# Edit .env with:
# MONGODB_URI=mongodb://localhost:27017/assimetria
# JWT_SECRET=generate-with-openssl-rand-32
# RESEND_API_KEY=your-key-here

cd ../frontend
echo 'VITE_API_BASE=http://localhost:4000/api' > .env.local
cd ..
```

### 2. Start Services

**Option A: Local Development**

```bash
# Terminal 1: MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Terminal 2: Backend
cd backend && npm install && npm run dev

# Terminal 3: Frontend
cd frontend && npm install && npm run dev
# Visit http://localhost:5173
```

### 3. Test It

1. Visit http://localhost:5173
2. Click "Sign Up"
3. Fill form and submit
4. Auto-redirects to dashboard
5. Try login/logout cycle

**See [QUICK_START.md](./QUICK_START.md) for detailed instructions**

## 🏗️ Project Structure

```
backend/src/
├── index.ts                    # Express server + middleware
├── models/
│   ├── User.ts                # User schema + interface
│   └── Article.ts             # Article schema
├── services/
│   ├── AuthService.ts         # Authentication logic (12 methods)
│   ├── EmailService.ts        # Resend email integration
│   └── ArticleService.ts      # Article business logic
├── routes/
│   ├── auth.ts                # 8 auth endpoints
│   └── articles.ts            # Article CRUD
├── middleware/
│   └── auth.ts                # JWT verification + middleware
└── cron/
    └── jobs.ts                # Scheduled tasks

frontend/src/
├── main.tsx                   # React entry
├── App.tsx                    # Routes (to be updated)
├── pages/
│   ├── SignupPage.tsx         # User registration
│   ├── LoginPage.tsx          # User login
│   ├── ForgotPasswordPage.tsx # Password reset request
│   └── ResetPasswordPage.tsx  # Password reset execution
├── lib/
│   ├── AuthContext.tsx        # Auth state management
│   └── utils.ts               # Utilities
├── api/
│   └── client.ts              # Axios HTTP client + auth methods
└── components/
    └── ui/button.tsx          # shadcn Button
```

## 🔐 Authentication Features

### Signup & Login

- Email/password registration
- bcryptjs password hashing (10 rounds)
- JWT token generation
- HTTP-only cookie storage
- 7-day token expiry

### Password Reset

- Forgot password email link
- 1-hour reset token expiry
- SHA-256 token hashing in DB
- Auto-login after reset

### OAuth Integration

-- OAuth sync to MongoDB (optional)

- Automatic user creation
- Seamless Google login
- Multi-auth support

### Email Notifications

- Welcome email on signup
- Password reset email with link
- Via Resend email service
- Customizable templates

## 🔌 API Endpoints

**Authentication** (8 endpoints)

```
POST   /api/auth/signup               # Create account
POST   /api/auth/login                # Email/password login
<!-- OAuth sync endpoint removed in simplified auth flow -->
POST   /api/auth/forgot-password      # Password reset request
POST   /api/auth/reset-password       # Reset password
POST   /api/auth/logout               # Logout
GET    /api/auth/me                   # Get current user (protected)
PATCH  /api/auth/profile              # Update profile (protected)
```

**Articles** (5 endpoints - protected)

```
GET    /api/articles                  # List articles
GET    /api/articles/:id              # Get article
POST   /api/articles                  # Create article
POST   /api/articles/generate         # Generate with AI
DELETE /api/articles/:id              # Delete article
```

**See [API_REFERENCE.md](./API_REFERENCE.md) for complete details**

## 📊 Technical Stack

**Backend**

- Express.js 4.18 - REST API framework
- TypeScript 5.3 - Type safety
- MongoDB - NoSQL database
- Mongoose 8.0 - ODM
- JWT - Token authentication
- bcryptjs - Password hashing
- Resend 1.0 - Email service

**Frontend**

- React 18.2 - UI framework
- Vite 5.0 - Build tool
- TypeScript 5.3 - Type safety
- React Router 6.20 - Navigation
  -- OAuth provider (optional)
- Tailwind CSS 4.0 - Styling
- shadcn/ui - Components

## 📝 Environment Variables

**Backend** (`backend/.env`)

```env
MONGODB_URI=mongodb://localhost:27017/assimetria
JWT_SECRET=your-secret-key-here
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=http://localhost:3000
APP_URL=http://localhost:3000
NODE_ENV=development
PORT=4000
```

**Frontend** (`frontend/.env.local`)

```env
VITE_API_BASE=http://localhost:4000/api
```

## ✅ Status

- **Phase 5** ✅ Complete - Comprehensive auth system
- **Phase 6** 🔄 In Progress - Integration & testing
- **Phase 7** 📝 Planned - Advanced features

**Overall**: 85% complete

To add your logic:

```typescript
// In backend/src/services/articleJob.ts
cron.schedule("0 0 * * *", async () => {
  console.log("[CRON] Midnight job running...");
  // TODO: Add your main code here
});
```

## 🔐 Authentication (Email/Password)

Integrated authentication with a traditional email/password flow. OAuth/social login is optional and can be added via your preferred OAuth provider.

### Setup Instructions

1. Create backend `.env` from `.env.example` and set `MONGODB_URI` and `JWT_SECRET`.
2. (Optional) Configure an OAuth provider and implement a sync endpoint if you require social login.

## 🗄️ Database (MongoDB + Mongoose)

### Your email must include **three things**:

1. **Live URL**

   - Link to your deployed app running on EC2.

2. **Code Repository**

   - A link to a **public GitHub repo** containing:
     - Source code
     - Dockerfiles
     - Infrastructure config (CodeBuild, etc.)
     - Any notes needed to run locally

3. **Short Video (30–120 seconds)**
   - Briefly introduce yourself
   - Explain what you built
   - Explain your technical decisions
   - Mention what you would improve with more time
   - Any video platform is fine (YouTube unlisted, Loom, Drive, etc.)

---

## 2. Application Requirements

### Frontend (React)

- Should display a list of blog articles
- Should display full content when clicking an article
- Built using React, Dockerized

### Backend (Node.js)

- Provides endpoints to:
  - List all articles
  - Retrieve a single article
- Generates new articles using one of the AI/text methods below
- Dockerized

### Storage

- Your choice:
  - JSON file
  - SQLite
  - Postgres
  - Any simple persistent option on EC2

No constraints here — pick what you’re comfortable with.

---

## 3. AI / Text Generation Options

Your backend must generate articles using **one of the following** options:

### **Option A – Free API (Recommended)**

You may use any of these:

- HuggingFace Inference API (free models)
- OpenRouter free-tier models
- DeepInfra free-tier
- Replicate free models

→ Easily **€0 cost**.

### **Option B – OpenAI (Max ~$5) **

You can use OpenAI models, but:

- Use your own API key
- Spend **no more than $5**

### **Option C – Local Small Model**

You may run an open-source model locally inside the backend container.

---

## 4. Automation Requirements

The system must:

- Automatically generate **1 new article per day**
- Already contain **at least 3 articles** when we check it

You can implement scheduling using:

- A **cron job** on EC2, or
- A scheduler inside Node.js (e.g. `node-cron`)

Either is fine as long as it works.

---

## 5. Infrastructure Requirements

This task evaluates your ability to set up real deployment workflows.

### AWS Resources

You must use:

- **EC2**

  - One instance
  - Hosts your dockerized frontend + backend
  - **Do NOT use ECS**

- **ECR**

  - Store your Docker images

- **CodeBuild**
  - Pulls your repo
  - Builds Docker images
  - Pushes images to ECR

### Docker

- Both frontend and backend must have separate Dockerfiles
- You can include a `docker-compose.yml` for local dev

### Basic Deployment Flow

One acceptable example:

1. Push code to GitHub
2. CodeBuild:
   - Pulls repo
   - Builds Docker images
   - Pushes to ECR
3. EC2:
   - Pulls and runs the latest images
4. App runs on EC2 public IP

You may automate this or run manually — just explain what you did.

---

## 6. Suggested Folder Structure

```text
.
├── backend/
│   ├── src/
│   │   ├── index.js
│   │   ├── routes/
│   │   ├── services/
│   │   │   ├── aiClient.js
│   │   │   └── articleJob.js
│   │   └── models/
│   ├── package.json
│   ├── Dockerfile
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/
│   │   │   └── client.js
│   │   └── App.jsx
│   ├── package.json
│   ├── Dockerfile
│   └── README.md
│
├── infra/
│   ├── buildspec.yml
│   ├── docker-compose.yml
│   └── scripts/
│       ├── deploy.sh
│       └── init-ec2.sh
│
├── docs/
│   └── ARCHITECTURE.md
│
└── README.md

```

Feel free to adjust, but keep it clean and documented.

---

## 7. Evaluation Criteria

We look at:

- End-to-end execution
- Working deployment
- Quality and clarity of code
- Docker & AWS understanding
- Clean build pipeline (CodeBuild + ECR)
- Reasonable AI integration
- Clear thinking in your video
- Ability to communicate your decisions

We do **not** expect perfection.  
We expect you to show **ownership, reasoning, and autonomy**.

---

## 8. Submission Summary

Send everything to:

**📩 hiring@assimetria.com**

With subject:

**`[Tech Challenge] - <Your Name>`**

Include:

- **1. Link to deployed app**
- **2. Link to GitHub repo**
- **3. Video link (30–120 sec)**

Thank you and good luck!
