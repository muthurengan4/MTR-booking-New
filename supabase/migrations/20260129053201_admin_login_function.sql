-- Admin Login Verification Function
-- Securely verifies admin credentials using encrypted password comparison

CREATE OR REPLACE FUNCTION public.verify_admin_login(
    input_username TEXT,
    input_password TEXT
)
RETURNS TABLE(
    success BOOLEAN,
    admin_id UUID,
    username TEXT,
    email TEXT,
    full_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_record RECORD;
BEGIN
    -- Query admin user with matching username and active status
    SELECT 
        au.id,
        au.username,
        au.email,
        au.full_name,
        au.encrypted_password,
        au.is_active
    INTO admin_record
    FROM public.admin_users au
    WHERE au.username = input_username
    AND au.is_active = true;

    -- Check if admin exists and password matches
    IF admin_record.id IS NOT NULL AND 
       admin_record.encrypted_password = crypt(input_password, admin_record.encrypted_password) THEN
        
        -- Update last login timestamp
        UPDATE public.admin_users
        SET last_login_at = CURRENT_TIMESTAMP
        WHERE id = admin_record.id;
        
        -- Return success with admin info
        RETURN QUERY
        SELECT 
            true AS success,
            admin_record.id AS admin_id,
            admin_record.username,
            admin_record.email,
            admin_record.full_name;
    ELSE
        -- Return failure
        RETURN QUERY
        SELECT 
            false AS success,
            NULL::UUID AS admin_id,
            NULL::TEXT AS username,
            NULL::TEXT AS email,
            NULL::TEXT AS full_name;
    END IF;
END;
$$;