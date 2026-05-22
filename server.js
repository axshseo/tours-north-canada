import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ============================================
// API ROUTES - Tours & Experiences
// ============================================

/**
 * GET /api/cities
 * Fetch all available cities
 */
app.get('/api/cities', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('experiences')
      .select('city_id')
      .eq('published', true);

    if (error) throw error;

    const uniqueCities = [...new Set(data.map(d => d.city_id))].sort();
    res.json({ success: true, data: uniqueCities });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/city/:cityName
 * Fetch all experiences for a specific city with relations
 */
app.get('/api/city/:cityName', async (req, res) => {
  try {
    const { cityName } = req.params;
    const { data, error } = await supabase
      .from('experiences')
      .select(`
        *,
        categories(name),
        sub_categories(name),
        types(name),
        province_id
      `)
      .eq('city_id', cityName)
      .eq('published', true);

    if (error) throw error;

    res.json({ 
      success: true, 
      city: cityName,
      count: data ? data.length : 0,
      data: data || [] 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/tours/top/:cityName
 * Fetch top-rated tours for a city
 */
app.get('/api/tours/top/:cityName', async (req, res) => {
  try {
    const { cityName } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const { data, error } = await supabase
      .from('experiences')
      .select('*, categories(name)')
      .eq('city_id', cityName)
      .eq('published', true)
      .order('id', { ascending: false })
      .limit(limit);

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/tours/category/:cityName/:categoryName
 * Fetch tours by category and optional sub-type
 */
app.get('/api/tours/category/:cityName/:categoryName', async (req, res) => {
  try {
    const { cityName, categoryName } = req.params;
    const { subType } = req.query;
    const limit = parseInt(req.query.limit) || 10;

    let query = supabase
      .from('experiences')
      .select('*, categories!inner(name)')
      .eq('city_id', cityName)
      .eq('published', true);

    if (categoryName !== 'all') {
      query = query.eq('categories.name', categoryName);
    }

    if (subType) {
      query = query.contains('highlights', [subType]);
    }

    const { data, error } = await query.limit(limit);

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/experiences/nearest
 * Find nearest experiences based on coordinates
 * Query params: lat, lng, limit
 */
app.get('/api/experiences/nearest', async (req, res) => {
  try {
    const { lat, lng, limit = 50 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ 
        success: false, 
        error: 'Latitude and longitude are required' 
      });
    }

    const { data, error } = await supabase.rpc('get_nearest_experiences', {
      user_lat: parseFloat(lat),
      user_lng: parseFloat(lng),
      max_limit: parseInt(limit)
    });

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/experiences/search
 * Full-text search for experiences
 * Query params: q (search query), city, limit
 */
app.get('/api/experiences/search', async (req, res) => {
  try {
    const { q, city, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({ 
        success: false, 
        error: 'Search query (q) is required' 
      });
    }

    let query = supabase
      .from('experiences')
      .select('*')
      .eq('published', true)
      .ilike('title', `%${q}%`);

    if (city) {
      query = query.eq('city_id', city);
    }

    const { data, error } = await query.limit(parseInt(limit));

    if (error) throw error;

    res.json({ 
      success: true, 
      query: q,
      count: data ? data.length : 0,
      data: data || [] 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/experience/:id
 * Fetch a single experience by ID
 */
app.get('/api/experience/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('experiences')
      .select(`
        *,
        categories(name),
        sub_categories(name),
        types(name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: '🚀 Tours North API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Tours North API',
    endpoints: [
      'GET /api/health',
      'GET /api/cities',
      'GET /api/city/:cityName',
      'GET /api/tours/top/:cityName?limit=10',
      'GET /api/tours/category/:cityName/:categoryName?subType=&limit=10',
      'GET /api/experiences/search?q=search&city=&limit=20',
      'GET /api/experiences/nearest?lat=43.6629&lng=-79.3957&limit=50',
      'GET /api/experience/:id'
    ]
  });
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint not found',
    path: req.path
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║  🚀 Tours North API Server Started        ║
║  Port: ${PORT}                                ║
║  Supabase: Connected                       ║
║  Endpoint: http://localhost:${PORT}           ║
╚════════════════════════════════════════════╝
  `);
});
