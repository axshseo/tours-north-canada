import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// THE SINGLE SOURCE OF TRUTH
const supabaseUrl = 'https://uxjjptuhnquobjohunqs.supabase.co'
const supabaseKey = 'sb_publishable_bYFzdR3U4rHiEgA28jkUPA_cFvs-J-W'
export const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * FETCH 9-LAYER CITY INVENTORY
 * This function powers your City Hubs (Toronto, Banff, etc.)
 */
export async function getCityInventory(cityName) {
    const { data, error } = await supabase
        .from('experiences')
        .select(`
            *,
            categories(name),
            sub_categories(name),
            types(name)
        `)
        .eq('city_id', cityName)
        .eq('published', true);

    if (error) {
        console.error("Infrastructure Error: Stockroom Sync Failed", error);
        return [];
    }
    return data;
}

/**
 * FETCH TOP RATED TOURS
 */
export async function getTopRatedTours(cityName, limit = 10) {
    const { data, error } = await supabase
        .from('experiences')
        .select('*, categories(name)')
        .eq('city_id', cityName)
        .eq('published', true)
        .order('id', { ascending: false }) // Mocking "top rated" as newest/highest id for now since rating column is mock
        .limit(limit);

    if (error) return [];
    return data;
}

/**
 * FETCH TOURS BY CATEGORY OR SUB-TYPE
 */
export async function getToursByCategory(cityName, categoryName, subType = null, limit = 10) {
    let query = supabase
        .from('experiences')
        .select('*, categories!inner(name)')
        .eq('city_id', cityName)
        .eq('published', true);

    if (categoryName) {
        query = query.eq('categories.name', categoryName);
    }

    if (subType) {
        // Assuming sub_types is a column or derived from highlights JSONB/Array
        query = query.contains('highlights', [subType]);
    }

    const { data, error } = await query.limit(limit);
    if (error) {
        console.error("Filter Error:", error);
        return [];
    }
    return data || [];
}

/**
 * FETCH NEAREST EXPERIENCES (PostGIS)
 * Uses proximity logic to find tours near a specific coordinate.
 */
export async function getNearestExperiences(lat, lng, limit = 50) {
    const { data, error } = await supabase.rpc('get_nearest_experiences', {
        user_lat: lat,
        user_lng: lng,
        max_limit: limit
    });

    if (error) {
        console.error("Geographic Search Error", error);
        return [];
    }
    return data;
}

/**
 * FETCH LATEST TRAVEL HACKS (Mocking from knowledge for now)
 */
export async function getLatestTravelHacks(cityName, limit = 3) {
    // In a real scenario, this might be a 'guides' or 'articles' table
    return [
        { title: "The UP Express Hack", snippet: "How to get from Pearson to Downtown in 25 mins for $12.", url: "/guides/transit" },
        { title: "ROM Free Friday Nights", snippet: "Access Canada's largest museum for $0 every third Friday.", url: "/guides/free-entry" },
        { title: "Winter Wind Tunnels", snippet: "The 3 corners to avoid when the temp drops below -10C.", url: "/guides/winter-survival" }
    ].slice(0, limit);
}

/**
 * FETCH TOURS BY COLLECTION (L5/L6)
 */
export async function getToursByCollection(cityName, collectionName, limit = 10) {
    const { data, error } = await supabase
        .from('experiences')
        .select(`
            *,
            categories(name),
            experience_collections!inner(name)
        `)
        .eq('city_id', cityName)
        .eq('published', true)
        .eq('experience_collections.name', collectionName)
        .limit(limit);

    if (error) {
        console.error("Collection Fetch Error:", error);
        return [];
    }
    return data;
}

/**
 * FETCH TOURS BY TAG (L8)
 */
export async function getToursByTag(cityName, tagName, limit = 10) {
    const { data, error } = await supabase
        .from('experiences')
        .select(`
            *,
            categories(name),
            experience_context_tags!inner(name)
        `)
        .eq('city_id', cityName)
        .eq('published', true)
        .eq('experience_context_tags.name', tagName)
        .limit(limit);

    if (error) {
        console.error("Tag Fetch Error:", error);
        return [];
    }
    return data;
}

/**
 * FETCH WEATHER SAFE TOURS (Indoor or specific tags)
 */
export async function getWeatherSafeTours(cityName, limit = 10) {
    const { data, error } = await supabase
        .from('experiences')
        .select(`
            *,
            categories(name),
            types!inner(name)
        `)
        .eq('city_id', cityName)
        .eq('published', true)
        .or('name.eq.Indoor', { foreignTable: 'types' }) // Indoor types are weather safe
        .limit(limit);

    if (error) {
        console.error("Weather Safe Fetch Error:", error);
        return [];
    }
    return data;
}
