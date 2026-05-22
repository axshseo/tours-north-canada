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
// EXAMPLE ROUTE - How to add more endpoints
// ============================================

/**
 * POST /api/bookings
 * Example: Create a new booking
 */
app.post('/api/bookings', async (req, res) => {
  try {
    const { experience_id, user_email, booking_date, guests } = req.body;

    // Validation
    if (!experience_id || !user_email || !booking_date) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('bookings')
      .insert([
        {
          experience_id,
          user_email,
          booking_date,
          guests: guests || 1,
          created_at: new Date()
        }
      ])
      .select();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/experience/:id
 * Example: Update experience (admin only)
 */
app.put('/api/experience/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('experiences')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/experience/:id
 * Example: Delete experience (admin only)
 */
app.delete('/api/experience/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('experiences')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Experience deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default app;
