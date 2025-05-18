-- Create a function to check if any of the given employee IDs have associated requests
CREATE OR REPLACE FUNCTION check_employee_has_requests(employee_ids uuid[])
RETURNS jsonb AS $$
DECLARE
  has_requests boolean;
  request_count integer;
BEGIN
  -- Check if any of the employees have requests
  SELECT EXISTS (
    SELECT 1
    FROM employee_requests
    WHERE employee_id = ANY(employee_ids)
  ) INTO has_requests;

  -- Get the count of requests if any exist
  IF has_requests THEN
    SELECT COUNT(*)
    FROM employee_requests
    WHERE employee_id = ANY(employee_ids)
    INTO request_count;
  ELSE
    request_count := 0;
  END IF;

  -- Return a JSON object with the result
  RETURN jsonb_build_object(
    'has_requests', has_requests,
    'request_count', request_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 