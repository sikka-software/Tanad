import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/components/ui/inputs/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Switch } from "@/ui/switch";
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/ui/table";
import { Textarea } from "@/ui/textarea";

import ProtectedRoute from "@/components/app/ProtectedRoute";
import TemplateEditor from "@/components/app/TemplateEditor";

import useUserStore from "@/stores/use-user-store";

const defaultTemplate = {
  logo: "",
  company: {
    name: "",
    address: "",
    contact: "",
  },
  client: {
    name: "",
    address: "",
    contact: "",
  },
  items: [
    {
      description: "",
      quantity: 1,
      price: 0,
    },
  ],
  notes: "",
  terms: "",
};

interface Template {
  id: string;
  name: string;
  type: "invoice" | "quote";
  content: unknown;
  is_default: boolean;
  created_at: string | null;
  user_id: string;
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["invoice", "quote"] as const, {
    required_error: "Please select a template type",
  }),
  content: z.string().min(1, "Template content is required"),
  is_default: z.boolean().default(false),
});

type FormValues = z.input<typeof formSchema>;

export default function TemplatesPage() {
  const [templatesList, setTemplatesList] = useState<Template[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const user = useUserStore((state) => state.user);
  const router = useRouter();
  const t = useTranslations();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "invoice",
      content: JSON.stringify(defaultTemplate, null, 2),
      is_default: false,
    },
  });

  const fetchTemplates = async () => {
    try {
      if (!user?.id) {
        console.error("No user ID found");
        return;
      }

      const response = await fetch(`/api/templates?user_id=${user.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch templates");
      }

      const data = await response.json();
      setTemplatesList(data);
    } catch (error) {
      console.error("Fetch templates error:", error);
      toast.error("Failed to fetch templates");
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchTemplates();
    }
  }, [user?.id]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (!user?.id) {
        console.error("No user ID found");
        toast.error("Please log in to create templates");
        return;
      }

      // Validate JSON before sending
      let parsedContent;
      try {
        parsedContent = JSON.parse(values.content);
      } catch (e) {
        console.error("JSON parsing error:", e);
        toast.error("Invalid JSON format in template content");
        return;
      }

      const response = await fetch("/api/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          type: values.type,
          content: parsedContent,
          is_default: values.is_default,
          user_id: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Template creation error details:", data);
        throw new Error(data.details || data.error || "Failed to create template");
      }

      toast.success(t("General.successful_operation"), {
        description: t("Templates.success.create"),
      });
      setOpen(false);
      form.reset({
        name: "",
        type: "invoice",
        content: JSON.stringify(defaultTemplate, null, 2),
        is_default: false,
      });
      fetchTemplates();
    } catch (error) {
      console.error("Template creation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create template");
    }
  };

  const handleViewTemplate = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handleSaveTemplate = async (template_id: string, content: string) => {
    try {
      const response = await fetch(`/api/templates/${template_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Failed to update template");
      }

      toast.success(t("General.successful_operation"), {
        description: t("Templates.success.update"),
      });
      fetchTemplates();
    } catch (error) {
      toast.error(t("General.error_operation"), {
        description: error instanceof Error ? error.message : "Failed to update template",
      });
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-10">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Templates</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="me-2 h-4 w-4" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
                <DialogDescription>Create a new template for invoices or quotes</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Template name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select template type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="invoice">Invoice</SelectItem>
                            <SelectItem value="quote">Quote</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content (JSON)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Template content in JSON format"
                            className="h-32 font-mono"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="is_default"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <FormLabel>Set as Default</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Create Template
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templatesList.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>{template.name}</TableCell>
                  <TableCell>{template.type}</TableCell>
                  <TableCell>{template.is_default ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    {template.created_at ? new Date(template.created_at).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewTemplate(template)}
                    >
                      View & Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {selectedTemplate && (
          <Dialog
            open={!!selectedTemplate}
            onOpenChange={(open) => !open && setSelectedTemplate(null)}
          >
            <DialogContent className="h-[90vh] max-w-6xl">
              <DialogHeader>
                <DialogTitle>Edit Template: {selectedTemplate.name}</DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-hidden">
                <TemplateEditor template={selectedTemplate} onSave={handleSaveTemplate} />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </ProtectedRoute>
  );
}
