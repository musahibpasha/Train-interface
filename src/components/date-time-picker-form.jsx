"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { TimePickerDemo } from "./time-picker-demo";

/**
 * @param {Object} props
 * @param {any} props.form
 * @param {string} props.name
 */
export function DateTimePickerForm({ form, name }) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <Popover>
            <FormControl>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[280px] justify-start text-left font-normal text-black",
                    !field.value && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? (
                    format(field.value, "PPP HH:mm")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
            </FormControl>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={(date) => {
                  // Preserve the time part when changing date
                  if (date && field.value) {
                    const newDate = new Date(date);
                    newDate.setHours(field.value.getHours());
                    newDate.setMinutes(field.value.getMinutes());
                    field.onChange(newDate);
                  } else {
                    field.onChange(date);
                  }
                }}
                initialFocus
              />
              <div className="p-3 border-t border-border">
                <TimePickerDemo setDate={field.onChange} date={field.value} />
              </div>
            </PopoverContent>
          </Popover>
        </FormItem>
      )}
    />
  );
}
