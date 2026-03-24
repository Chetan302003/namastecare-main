-- Migration to add auto-call functionality to medicine_reminders
-- This will allow the system to identify which reminders should trigger a voice call

ALTER TABLE IF EXISTS public.medicine_reminders 
ADD COLUMN IF NOT EXISTS auto_call_enabled BOOLEAN DEFAULT FALSE;

-- Optional: Add a custom phone number field if different from family member's phone
ALTER TABLE IF EXISTS public.medicine_reminders 
ADD COLUMN IF NOT EXISTS reminder_phone_number TEXT;

-- Note: We assume medicine_reminders is linked to family_members which has the primary phone_number.
