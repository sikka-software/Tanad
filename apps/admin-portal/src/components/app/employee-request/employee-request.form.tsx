import { z } from "zod";

interface EmployeeRequestFormProps {
  id?: string;
  onSuccess?: () => void;
  onSubmit: (data: EmployeeRequestFormValues) => Promise<void>;
  loading?: boolean;
}

const createEmployeeRequestFormSchema = (t: (key: string) => string) => z.object({});

export type EmployeeRequestFormValues = z.infer<ReturnType<typeof createEmployeeRequestFormSchema>>;

const EmployeeRequestForm = ({
  id,
  onSuccess,
  onSubmit,
  loading = false,
}: EmployeeRequestFormProps) => {
  return <div>EmployeeRequestForm</div>;
};

export default EmployeeRequestForm;
