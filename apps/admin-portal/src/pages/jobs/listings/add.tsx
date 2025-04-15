import { useState } from "react";
import { useForm } from "react-hook-form";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, MapPin, Calendar, DollarSign } from "lucide-react";
import * as z from "zod";

import DataPageLayout from "@/components/layouts/data-page-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useJobs } from "@/hooks/useJobs";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  jobs: z.array(z.string()).min(1, "At least one job is required"),
});

export default function CreateJobListingPage() {
  const t = useTranslations("Jobs");
  const router = useRouter();
  const { data: jobs, isLoading } = useJobs();
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      jobs: [],
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // TODO: Implement API call to create job listing
    console.log(values);
    router.push("/jobs/listings");
  };

  const handleJobSelect = (jobId: string) => {
    setSelectedJobs((prev) => {
      if (prev.includes(jobId)) {
        return prev.filter((id) => id !== jobId);
      }
      return [...prev, jobId];
    });
  };

  return (
    <DataPageLayout>
      <div>
        <h1 className="text-2xl font-bold">{t("Create Job Listing")}</h1>
        <p className="text-gray-600">{t("Create a new job listing with multiple jobs")}</p>
      </div>

      <div className="mt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">{t("Listing Details")}</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Title")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Description")}</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">{t("Select Jobs")}</h3>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {jobs?.map((job) => (
                    <Card
                      key={job.id}
                      className={`cursor-pointer transition-all ${
                        selectedJobs.includes(job.id)
                          ? "border-primary bg-primary/5"
                          : "hover:shadow-md"
                      }`}
                      onClick={() => handleJobSelect(job.id)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{job.title}</h4>
                            <p className="text-sm text-gray-500">{job.type}</p>
                          </div>
                          {selectedJobs.includes(job.id) && (
                            <div className="bg-primary h-4 w-4 rounded-full" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {job.department && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building2 className="h-4 w-4" />
                            <span>{job.department}</span>
                          </div>
                        )}
                        {job.location && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                          </div>
                        )}
                        {job.salary && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <DollarSign className="h-4 w-4" />
                            <span>{job.salary}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.push("/jobs/listings")}>
                {t("Cancel")}
              </Button>
              <Button type="submit">{t("Create Listing")}</Button>
            </div>
          </form>
        </Form>
      </div>
    </DataPageLayout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../../locales/${locale}.json`)).default,
    },
  };
};
