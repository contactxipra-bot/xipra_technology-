-- (Appended Schema Update for Phase 2)
-- 5. Add Certificate tracking to registrations
ALTER TABLE registrations ADD COLUMN hackathon_completed BOOLEAN DEFAULT false;
ALTER TABLE registrations ADD COLUMN team_name TEXT;

-- 6. Add Payment tracking
ALTER TABLE registrations ADD COLUMN payment_status TEXT DEFAULT 'pending';
ALTER TABLE registrations ADD COLUMN invoice_id TEXT;
