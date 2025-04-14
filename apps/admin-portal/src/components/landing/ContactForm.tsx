import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Resolver } from "react-hook-form";
// UI
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
// Utils
import { cn } from "@/lib/utils";
// Types
import { TextInputType } from "@/lib/types";

type ContactFormData = { name: string; email: string; message: string } & {
  [key: string]: string;
};

type CustomField = {
  label: string;
  type: "text" | "number" | "select";
  name: string;
  placeholder?: string;
  options?: {
    label: string;
    value: string;
  }[];
};
type ContactFormProps = {
  cardless?: boolean;
  formId?: string;
  formAutoComplete?: "on" | "off";
  clearOnSubmit?: boolean;
  size?: "sm" | "default";
  onSubmit: (e: ContactFormData) => void;
  customFields?: CustomField[];
  showSuccess?: boolean;
  classNames?: {
    submitButton?: string;
    container?: string;
  };
  texts?: {
    submit: string;
    name: TextInputType;
    email: TextInputType;
    message: TextInputType;
    success?: {
      title?: string;
      description?: string;
    };
  };
};
export const ContactForm: React.FC<ContactFormProps> = ({
  cardless,
  size = "default",
  texts,
  formId,
  formAutoComplete = "off",
  onSubmit,
  customFields,
  classNames,
  clearOnSubmit = true,
  ...props
}) => {
  const customFieldsSchema = z.object({
    ...customFields?.reduce(
      (acc: { [key: string]: z.ZodType<any, any> }, curr: CustomField) => {
        switch (curr.type) {
          case "text":
            acc[curr.name] = z.string().optional().default("");
            break;
          case "number":
            acc[curr.name] = z.string().optional().default("");
            break;
          case "select":
            acc[curr.name] = z.string().optional().default("");
            break;
          default:
            break;
        }
        return acc;
      },
      {}
    ),
  });

  const contactFormSchema = z.object({
    name: z
      .string({ required_error: texts?.name.required || "Name is required" })
      .min(1, texts?.name.required || "Name is required")
      .default(""),
    email: z
      .string({ required_error: texts?.email?.required || "Email is required" })
      .min(1, { message: texts?.email?.required || "Email is required" })
      .email({ message: texts?.email?.invalid || "Invalid email" })
      .default(""),
    message: z
      .string({
        required_error: texts?.message.required || "Message is required",
      })
      .min(10, texts?.message.invalid || "Message is too short")
      .default(""),
  });

  const customFieldsDefaultValues = customFields?.reduce(
    (acc: { [key: string]: any }, curr: CustomField) => {
      acc[curr.name] = "";
      return acc;
    },
    {}
  );
  const MainSchema = contactFormSchema.merge(customFieldsSchema);

  const form = useForm<ContactFormData>({
    mode: "all",
    resolver: zodResolver(MainSchema) as unknown as Resolver<ContactFormData>,
    defaultValues: {
      name: "",
      email: "",
      message: "",
      ...customFieldsDefaultValues,
    },
  });

  const SubmitForm = async (data: ContactFormData) => {
    const isValid = await form.trigger();
    if (!isValid) {
      return;
    }
    if (onSubmit) {
      onSubmit(data);
      if (clearOnSubmit) {
        form.reset();
      }
    } else {
      console.log("Form is submitted but onSubmit prop is missing");
    }
  };

  return (
    <Card
      className={cn(
        "w-full",
        cardless && "border-none bg-transparent shadow-none drop-shadow-none",
        classNames?.container
      )}
      style={cardless ? { boxShadow: "none" } : undefined}
    >
      <CardContent
        //   headless
        className={cn(cardless ? "!p-0" : "", "pt-6")}
      >
        {props.showSuccess ? (
          <CardHeader>
            <CardTitle>{texts?.success?.title || "Message Sent! 🎉"}</CardTitle>
            <CardDescription>
              {texts?.success?.description ||
                "Thank you for your submission, we will get back to you as soon as possible."}
            </CardDescription>
          </CardHeader>
        ) : (
          <Form {...form}>
            <form
              noValidate
              onSubmit={form.handleSubmit(SubmitForm)}
              className="space-y-2"
              id={formId}
              autoComplete={formAutoComplete}
            >
              <div
                className={cn("flex items-start justify-start gap-2", {
                  "flex-row": size === "default",
                  "flex-col": size === "sm",
                })}
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>{texts?.name.label}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={texts?.name.placeholder}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>{texts?.email.label}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={texts?.email.placeholder}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>{texts?.message.label}</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-40 h-ful"
                        placeholder={texts?.message.placeholder}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className={cn("w-full", classNames?.submitButton)}
              >
                {texts?.submit || "Submit"}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};
