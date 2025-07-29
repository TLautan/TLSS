// frontend/features/activities/components/activity-form-modal.tsx

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createActivityForDeal } from "@/lib/api";
import { useState } from "react";

const formSchema = z.object({
  type: z.enum(["phone", "email", "meeting"]),
  notes: z.string().optional(),
});

type ActivityFormValues = z.infer<typeof formSchema>;

interface ActivityFormModalProps {
  dealId: number;
  onSuccess: () => void; // Callback to close the modal and refresh data
}

export function ActivityFormModal({ dealId, onSuccess }: ActivityFormModalProps) {
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "phone",
      notes: "",
    },
  });

  async function onSubmit(values: ActivityFormValues) {
    try {
      await createActivityForDeal(dealId, {
        type: values.type,
        notes: values.notes,
      });
      onSuccess(); // Trigger the success callback
    } catch (err) {
      console.error("Failed to create activity:", err);
      setError("Failed to create activity. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Add Activity"}
        </Button>
      </form>
    </Form>
  );
}
