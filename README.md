
---

# 🌟 **Assimetria – AI-Powered Blog Platform**

### _Full-Stack Project with Authentication, AI Content Generation, Novel Editor, and AWS Deployment_

A production-ready full-stack application that supports:

- Authenticated blog creation using a **Notion-like Novel Tiptap editor**
- Public blog listing and reading without login
- Automatic **AI-generated blog articles daily**
- Secure authentication using **Clerk**
- Scalable backend with Postgres
- End-to-end CI/CD using **GitHub → CodeBuild → ECR → EC2**
- Docker-based frontend + backend deployment

---

# 🚀 **Live Demo**

| Component          | URL                                                                |
| ------------------ | ------------------------------------------------------------------ |
| **Frontend**       | [https://ai-blogs.cozycandles.in](https://ai-blogs.cozycandles.in) |
| **Backend API**    | `https://api.cozycandles.in/api`                                                |
| **Public Blogs**   | `/`                                                                |
| **User Dashboard** | `/myblogs` (requires login)                                        |

---

# 🧩 **Features**

### 🟢 **Public Blog Experience**

- Anyone can view published blogs
- Clean, SEO-friendly content rendering
- No login required

### 🔵 **User Auth (Clerk)**

- Sign up / Sign in
- Protected routes
- Only the blog author sees “Edit” and “Delete”

### 📝 **Novel Editor Integration**

- Rich text editor with:

  - Headings, lists, code blocks
  - Image upload to S3
  - Slash commands
  - Dark mode–consistent styling

### 🤖 **AI Article Generator**

Backend generates:

- 1 new article per day (cron job)
- Using your selected AI provider (OpenAI/HuggingFace/OpenRouter)
- Automatically saved into Postgres

### 🔐 **Secure Architecture**

- Auth via Clerk (frontend)
- JWT validation for backend API routes
- CORS hardened
- S3 with public-read policy for images

### 🚢 **CI/CD: Zero-Downtime Deployment**

**Workflow:**

1. Push code → triggers **GitHub Action**
2. **GitHub waits** for AWS CodeBuild to finish building + pushing Docker images
3. Once images are ready, GitHub Action SSHes into EC2 and runs:

   ```bash
    cd /home/ubuntu/ai-blogs
    docker-compose -f docker-compose.ec2.yml pull
    docker-compose -f docker-compose.ec2.yml up -d --force-recreate
   ```

4. New version deployed instantly

---

# 🗂️ **Project Structure**

```
.
├── backend/
│   ├── src/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── index.ts
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   │   ├── NovelEditor/
│   │   │   ├── selectors/
│   │   │   ├── generative/
│   │   ├── pages/
│   │   │   ├── PublicBlogs.tsx
│   │   │   ├── PublicBlogView.tsx
│   │   │   ├── ArticlePage.tsx   (My Blogs)
│   │   │   ├── BlogEdit.tsx
│   │   │   ├── BlogView.tsx
│   │   └── App.tsx
│   ├── nginx.conf
│   ├── Dockerfile
│   ├── docker-entrypoint.sh
│   └── public/env-config.template.js
│
├── infra/
│   ├── buildspec.yml
│   ├── docker-compose.ec2.yml
│   └── scripts/
│       └── deploy.sh
│
├── .github/workflows/deploy.yml
└── README.md
```

---

# ⚙️ **Backend Overview**

### 🧱 **Tech Stack**

- Node.js + TypeScript
- Express.js
- PostgreSQL + Drizzle ORM
- S3 image uploads
- AI article generation service
- Cron job for daily publishing

### 📌 **Key Endpoints**

#### **Public**

```
GET /api/articles/public
GET /api/articles/public/:id
```

#### **Authenticated**

```
GET     /api/articles
GET     /api/articles/:id
POST    /api/articles
PATCH   /api/articles/:id
DELETE  /api/articles/:id
DELETE  /api/articles   # bulk delete
```

---

# 🎨 **Frontend Overview**

### 🧱 **Tech Stack**

- React + Vite
- TypeScript
- Clerk Auth
- Novel/Tiptap editor
- Tailwind CSS v4
- Deployed over Nginx

### 🌗 **Dark-Themed Novel Editor**

- Fully customized for dark UI
- White text, inverted prose, styled code blocks
- Image uploads use S3

### 🧭 **Routing Flow**

| Path                | Description                | Auth Required |
| ------------------- | -------------------------- | ------------- |
| `/`                 | Public blogs               | ❌            |
| `/public/:id`       | Read public blog           | ❌            |
| `/myblogs`          | List user’s blogs          | ✔️            |
| `/myblogs/new`      | Create blog                | ✔️            |
| `/myblogs/:id/edit` | Edit blog                  | ✔️            |
| `/blogs/:id`        | BlogView (smart dual mode) | Auto-detect   |

---

# 🏗️ **Deployment Architecture**

```
GitHub → GitHub Actions → CodeBuild → ECR → EC2 → Docker Compose → Nginx
```

### 🚀 **CI/CD Flow**

1. Developer pushes to **main**
2. GitHub Action:

   - Triggers
   - WAITS until CodeBuild finishes Docker builds

3. CodeBuild:

   - Builds backend + frontend images
   - Pushes them to ECR

4. GitHub Action:

   - SSH → EC2
   - Pulls images
   - Restarts containers

No downtime, fully automated.

---

# 🪣 **S3 Bucket Configuration**

### ✅ **Recommended CORS**

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### ✅ **Public Read Policy**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

---

# 🕒 **Daily Article Generation (Cron)**

Backend runs:

```
0 0 * * * → ArticleService.generateDaily()
```

Automatically creates a new blog every night.

---

# 🧪 How to Run Locally

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Visit:
👉 [http://localhost:5173](http://localhost:5173)

---

# 🎥 **Submission Checklist**

You will provide:

- ✔️ Live URL
- ✔️ Public GitHub Repository
- ✔️ Short Video (60–120s) explaining:

  - Architecture
  - Deployment pipeline
  - AI integration
  - Key challenges you solved

---

# 🏁 **Final Notes**

This project demonstrates:

- Real-world full-stack architecture
- Authentication + authorization
- Rich editor UX
- AWS DevOps workflow
- Dockerized scalable deployment
- AI integrations
- Secure backend

A complete production-grade engineering challenge.

---