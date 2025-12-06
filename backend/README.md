# Backend (starter)

Simple Express backend exposing:

- `GET /health` - health check
- `GET /articles` - list articles
- `GET /articles/:id` - single article
- `POST /generate` - generate a new article (also scheduled daily)

Persistence: `src/storage.json` (simple JSON file for demo)

Run locally:

```bash
cd backend
npm install
npm start
```
