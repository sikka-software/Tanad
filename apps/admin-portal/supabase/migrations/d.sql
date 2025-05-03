CREATE OR REPLACE FUNCTION public.module_log_employee()\n RETURNS trigger\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\ndeclare\n  log_action_type public.activity_log_action_type;\n  log_details jsonb;\n  record_data record;\n  user_id_to_log uuid;
-- Variable to hold the user ID
 begin
-- Determine action type based on trigger operation
  if (TG_OP = 'INSERT') then
      log_action_type := 'CREATED';
          record_data := NEW;
              log_details := jsonb_build_object('new_data', row_to_json(NEW));
                elsif (TG_OP = 'UPDATE') then
                    log_action_type := 'UPDATED';
                        record_data := NEW;
                            log_details := jsonb_build_object('updated_data', row_to_json(NEW)); 
                              elsif (TG_OP = 'DELETE') then
                                  log_action_type := 'DELETED';
                                      record_data := OLD;
                                          log_details := jsonb_build_object('deleted_data', row_to_json(OLD));
                                            else
                                                return null;
                                                  end if;

                                                    -- Attempt to get auth.uid(), default to a placeholder if NULL
                                                      -- Use a known placeholder for easier debugging
                                                        user_id_to_log := coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid); 
                                                          -- Insert into activity_logs using the potentially placeholder user_id
                                                            insert into public.activity_logs (enterprise_id, user_id, action_type, target_type, target_id, target_name, details)\n  values (\n    record_data.enterprise_id,\n    user_id_to_log, 
                                                            -- Use the variable here
                                                                log_action_type,
                                                                    'EMPLOYEE', 
                                                                        record_data.id,
                                                                            coalesce(record_data.first_name, '') || ' ' || coalesce(record_data.last_name, ''),
                                                                                log_details
                                                                                  );
                                                                                
                                                                                  -- Return NEW for INSERT/UPDATE, OLD for DELETE
                                                                                    if (TG_OP = 'DELETE') then
                                                                                        return OLD;
                                                                                        else
                                                                                            return NEW;
                                                                                            end if;
                                                                                            exception 
                                                                                              when others then
                                                                                                  -- Log any error during trigger execution (optional but helpful for debugging)
                                                                                                    raise warning 'Error in module_log_employee trigger: %', sqlerrm;
                                                                                                      -- Depending on requirements, you might want to still allow the original operation
                                                                                                        -- return NEW; -- or OLD for DELETE
                                                                                                          -- Or re-raise the error to halt the operation
                                                                                                            raise exception 'Trigger module_log_employee failed: %', sqlerrm;
                                                                                                              end;
                                                                                                              $function$;
                                                                                                              