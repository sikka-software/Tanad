CREATE OR REPLACE FUNCTION validate_department_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.location_type = 'office' AND NOT EXISTS (SELECT 1 FROM offices WHERE id = NEW.location_id) THEN
    RAISE EXCEPTION 'Invalid office location_id';
  ELSIF NEW.location_type = 'branch' AND NOT EXISTS (SELECT 1 FROM branches WHERE id = NEW.location_id) THEN
    RAISE EXCEPTION 'Invalid branch location_id';
  ELSIF NEW.location_type = 'warehouse' AND NOT EXISTS (SELECT 1 FROM warehouses WHERE id = NEW.location_id) THEN
    RAISE EXCEPTION 'Invalid warehouse location_id';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_department_location_trigger
BEFORE INSERT OR UPDATE ON department_locations
FOR EACH ROW
EXECUTE FUNCTION validate_department_location();