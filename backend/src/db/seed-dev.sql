-- DEV-ONLY seed for local testing of Module C endpoints.
-- Module A owns users/cities/activities, Module B owns trips. This seed exists
-- solely so Module C can create stops/activities and run curl tests. It must be
-- replaced by Module A/B's official seed data before demo day.

-- Demo user (id forced to 1 so test JWT payload {id:1} passes ownership checks)
INSERT INTO users (id, first_name, last_name, email, password_hash)
VALUES (1, 'Demo', 'User', 'demo@globetrotter.dev', 'dev-hash')
ON CONFLICT (id) DO NOTHING;

-- A handful of real cities (Module A territory)
INSERT INTO cities (id, name, country, cost_index, popularity) VALUES
  (1, 'Goa', 'India', 2, 80),
  (2, 'Paris', 'France', 5, 95),
  (3, 'Tokyo', 'Japan', 4, 92),
  (4, 'Bali', 'Indonesia', 3, 85),
  (5, 'Reykjavik', 'Iceland', 5, 70)
ON CONFLICT (id) DO NOTHING;

-- A few activities per city (Module A territory)
INSERT INTO activities (id, city_id, name, category, cost, duration_minutes) VALUES
  (1, 1, 'Baga Beach', 'sightseeing', 0, 120),
  (2, 1, 'Goan Seafood Crawl', 'food', 1500, 90),
  (3, 2, 'Eiffel Tower', 'sightseeing', 2500, 120),
  (4, 2, 'Seine River Cruise', 'nightlife', 3000, 90),
  (5, 3, 'Shibuya Crossing', 'sightseeing', 0, 60),
  (6, 3, 'Ramen Tour', 'food', 2000, 90),
  (7, 4, 'Ubud Rice Terraces', 'sightseeing', 500, 120),
  (8, 5, 'Blue Lagoon Spa', 'culture', 4500, 180)
ON CONFLICT (id) DO NOTHING;

-- One demo trip owned by user 1 (Module B territory)
INSERT INTO trips (id, user_id, name, start_date, end_date, is_public, share_slug)
VALUES (1, 1, 'India & Beyond', '2026-09-01', '2026-09-10', TRUE, 'demo-india-beyond')
ON CONFLICT (id) DO NOTHING;
