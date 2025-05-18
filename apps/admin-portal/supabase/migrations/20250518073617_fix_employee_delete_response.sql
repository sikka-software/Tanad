-- Drop existing functions in the correct order (dependent function first)
DROP FUNCTION IF EXISTS api_delete_employees CASCADE;
DROP FUNCTION IF EXISTS delete_employee_with_requests CASCADE;

-- Create a function to handle cascade deletion of employee requests with proper return type
CREATE FUNCTION delete_employee_with_requests(employee_ids uuid[], should_cascade boolean)
RETURNS jsonb AS $$
DECLARE
  deleted_count integer;
  requests_count integer := 0;
BEGIN
  IF should_cascade THEN
    -- Delete employee requests first and count them
    WITH deleted AS (
      DELETE FROM employee_requests
      WHERE employee_id = ANY(employee_ids)
      RETURNING id
    )
    SELECT COUNT(*) INTO requests_count FROM deleted;
  END IF;
  
  -- Delete the employees and count them
  WITH deleted AS (
    DELETE FROM employees
    WHERE id = ANY(employee_ids)
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;

  -- Return a JSON object with the counts
  RETURN jsonb_build_object(
    'success', true,
    'deleted_employees', deleted_count,
    'deleted_requests', requests_count
  );
END;
$$ LANGUAGE plpgsql;

-- Create an API function that will be called from the application
CREATE FUNCTION api_delete_employees(ids uuid[], cascade boolean DEFAULT false)
RETURNS jsonb AS $$
BEGIN
  RETURN delete_employee_with_requests(ids, cascade);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
