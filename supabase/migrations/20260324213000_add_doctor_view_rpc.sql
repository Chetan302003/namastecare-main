-- Create RPC function to fetch clinical data by token
-- This function uses SECURITY DEFINER to bypass RLS for authorized token holders

CREATE OR REPLACE FUNCTION public.get_clinical_data_by_token(token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
    member_record RECORD;
    health_records_json JSONB;
    medicine_reminders_json JSONB;
    target_user_id UUID;
    target_member_name TEXT;
    target_member_id UUID;
BEGIN
    -- Handle "Self" case
    IF token LIKE 'self-%' THEN
        target_user_id := (REPLACE(token, 'self-', ''))::UUID;
        target_member_name := 'Self';
        target_member_id := target_user_id;
        
        SELECT 'Self' as name, '' as age, '' as gender, '' as phone_number, target_user_id as user_id INTO member_record;
    ELSE
        -- Handle Family Member case
        SELECT * INTO member_record FROM public.family_members WHERE doctor_view_token = token;
        
        IF NOT FOUND THEN
            RETURN NULL;
        END IF;
        
        target_user_id := member_record.user_id;
        target_member_name := member_record.name;
        target_member_id := member_record.id;
    END IF;

    -- Fetch Health Records
    SELECT COALESCE(JSONB_AGG(hr), '[]'::jsonb) INTO health_records_json
    FROM (
        SELECT * FROM public.health_records 
        WHERE user_id = target_user_id 
        AND (member_name = target_member_name OR target_member_name = 'Self')
        ORDER BY created_at DESC
    ) hr;

    -- Fetch Medicine Reminders
    SELECT COALESCE(JSONB_AGG(mr), '[]'::jsonb) INTO medicine_reminders_json
    FROM (
        SELECT * FROM public.medicine_reminders 
        WHERE family_member_id = target_member_id
        AND active = true
    ) mr;

    -- Construct Final JSON
    result := JSONB_BUILD_OBJECT(
        'member', row_to_json(member_record)::jsonb,
        'records', health_records_json,
        'medicines', medicine_reminders_json
    );

    RETURN result;
END;
$$;
