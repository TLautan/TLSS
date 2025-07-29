// frontend/features/activity-registration/components/activity-form.tsx

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createActivityForDeal } from "@/lib/api";

// Define the shape and validation rules for the form.
const formSchema = z.object({
  deal_id: z.number().min(1, { message: "Deal ID is required and must be a positive number." }),

  type: z.enum(["phone", "email", "meeting"]),
  
  notes: z.string().optional(),
});

// Define a TypeScript type based on the Zod schema
type ActivityFormValues = z.infer<typeof formSchema>;

export function ActivityForm() {
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: "",
    },
  });

  async function onSubmit(values: ActivityFormValues) {
    try {
      await createActivityForDeal(values.deal_id, {
        type: values.type,
        notes: values.notes,
      });
      alert("Activity created successfully!");
      form.reset();
    } catch (error) {
      console.error("Failed to create activity:", error);
      alert("Failed to create activity. Please check the console for details.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="deal_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deal ID</FormLabel>
              <FormControl>
                {/* The {...field} prop from react-hook-form handles onChange correctly */}
                <Input type="number" placeholder="Enter the associated Deal ID" {...field} />
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
              <FormLabel>Activity Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an activity type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Add any notes about the activity..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Create Activity</Button>
      </form>
    </Form>
  );
}
