# 🚀 Tours North API Setup Guide

Your Supabase database is now connected to an Express.js REST API!

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the API Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The API will run on `http://localhost:3000`

---

## API Endpoints

### Health Check
```
GET http://localhost:3000/api/health
```

### Get All Cities
```
GET http://localhost:3000/api/cities
```
Returns all available cities/destinations.

### Get City Experiences
```
GET http://localhost:3000/api/city/{cityName}
```
Example: `GET http://localhost:3000/api/city/toronto`

**Response:**
```json
{
  "success": true,
  "city": "toronto",
  "count": 45,
  "data": [
    {
      "id": 1,
      "title": "CN Tower Experience",
      "city_id": "toronto",
      "price": 25,
      "published": true,
      "categories": { "name": "Attractions" },
      ...
    }
  ]
}
```

### Get Top Tours for a City
```
GET http://localhost:3000/api/tours/top/{cityName}?limit=10
```
Example: `GET http://localhost:3000/api/tours/top/vancouver?limit=5`

### Get Tours by Category
```
GET http://localhost:3000/api/tours/category/{cityName}/{categoryName}?limit=10&subType=optional
```
Example: `GET http://localhost:3000/api/tours/category/banff/outdoor`

### Search Experiences
```
GET http://localhost:3000/api/experiences/search?q={searchTerm}&city={cityName}&limit=20
```
Example: `GET http://localhost:3000/api/experiences/search?q=whale&limit=10`

### Find Nearest Experiences
```
GET http://localhost:3000/api/experiences/nearest?lat={latitude}&lng={longitude}&limit=50
```
Example: `GET http://localhost:3000/api/experiences/nearest?lat=43.6629&lng=-79.3957&limit=10`
(Toronto coordinates)

### Get Single Experience
```
GET http://localhost:3000/api/experience/{id}
```
Example: `GET http://localhost:3000/api/experience/42`

---

## Frontend Integration

### JavaScript/Fetch
```javascript
// Example: Call the API from your frontend
async function getTorontoTours() {
  const response = await fetch('http://localhost:3000/api/city/toronto');
  const result = await response.json();
  console.log(result.data);
}

// Example: Search
async function searchExperiences(query) {
  const response = await fetch(
    `http://localhost:3000/api/experiences/search?q=${query}&limit=20`
  );
  const result = await response.json();
  return result.data;
}
```

### Using the Fetch Client
```javascript
// In your HTML files, update references:
// OLD: import { getCityInventory } from './assets/js/tours-north-api.js'
// NEW: Call the API endpoint instead

// Old way (client-side Supabase):
// const data = await getCityInventory('toronto');

// New way (via API):
const response = await fetch('/api/city/toronto');
const { data } = await response.json();
```

---

## Environment Variables

The `.env` file contains:
```
SUPABASE_URL=https://uxjjptuhnquobjohunqs.supabase.co
SUPABASE_ANON_KEY=sb_publishable_bYFzdR3U4rHiEgA28jkUPA_cFvs-J-W
PORT=3000
NODE_ENV=development
```

**Keep your `.env` file private!** Add it to `.gitignore`

---

## CORS Configuration

The API allows requests from any origin by default. To restrict to specific domains:

Edit `server.js` and update the CORS configuration:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'https://yoursite.com'],
  credentials: true
}));
```

---

## Deployment Options

### Vercel (Serverless)
1. Push code to GitHub
2. Connect repo to Vercel
3. Set environment variables in Vercel dashboard
4. Redeploy

### Netlify Functions
Convert `server.js` endpoints to Netlify Functions in `/netlify/functions/`

### Docker
Use the existing `Dockerfile` or update it for the Node.js API

### Heroku
```bash
heroku create
git push heroku main
heroku config:set SUPABASE_URL=...
```

---

## Troubleshooting

### "Cannot find module"
```bash
rm -rf node_modules
npm install
```

### Port already in use
```bash
# macOS/Linux
lsof -i :3000
kill -9 <PID>

# Or change PORT in .env
PORT=3001 npm start
```

### Supabase connection error
- Verify SUPABASE_URL and SUPABASE_ANON_KEY in `.env`
- Check Supabase project is active
- Verify table names match your schema

---

## Next Steps

1. **Update your frontend** to call API endpoints instead of direct Supabase
2. **Add authentication** - Create protected routes with API keys
3. **Add validation** - Validate request parameters
4. **Add logging** - Track API requests and errors
5. **Deploy** - Push to production server

---

Happy coding! 🎉
