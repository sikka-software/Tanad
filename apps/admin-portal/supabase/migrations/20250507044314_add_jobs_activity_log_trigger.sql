CREATE TRIGGER trigger_jobs_activity_log
AFTER INSERT OR UPDATE OR DELETE ON public.jobs
FOR EACH ROW EXECUTE FUNCTION public.module_log_job();
