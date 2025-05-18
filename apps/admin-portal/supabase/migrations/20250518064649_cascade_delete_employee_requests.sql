-- Create a function to handle cascade deletion of employee requests
CREATE OR REPLACE FUNCTION delete_employee_with_requests(employee_ids uuid[], should_cascade boolean)
RETURNS void AS $$
BEGIN
  IF should_cascade THEN
    -- Delete employee requests first
    DELETE FROM employee_requests
    WHERE employee_id = ANY(employee_ids);
  END IF;
  
  -- Then delete the employees
  DELETE FROM employees
  WHERE id = ANY(employee_ids);
END;
$$ LANGUAGE plpgsql;

-- Create an API function that will be called from the application
CREATE OR REPLACE FUNCTION api_delete_employees(ids uuid[], cascade boolean DEFAULT false)
RETURNS void AS $$
BEGIN
  PERFORM delete_employee_with_requests(ids, cascade);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
