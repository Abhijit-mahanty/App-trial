import { useState } from "react";
import { 
  useListDeadlines, 
  getListDeadlinesQueryKey,
  useCreateDeadline
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, Plus, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";

const deadlineSchema = z.object({
  title: z.string().min(1, "Title is required"),
  caseId: z.coerce.number().min(1, "Case ID is required"),
  priority: z.enum(["High", "Medium", "Low"]),
  date: z.string().min(1, "Date is required"),
});

type FormValues = z.infer<typeof deadlineSchema>;

export const Calendar = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: deadlines, isLoading } = useListDeadlines();
  const createDeadline = useCreateDeadline();

  const form = useForm<FormValues>({
    resolver: zodResolver(deadlineSchema),
    defaultValues: {
      title: "",
      caseId: 1,
      priority: "Medium",
      date: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = (data: FormValues) => {
    createDeadline.mutate(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListDeadlinesQueryKey() });
          setIsDialogOpen(false);
          form.reset();
          toast.success("Deadline added successfully");
        },
        onError: () => {
          toast.error("Failed to add deadline");
        },
      }
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-destructive/10 text-destructive border-destructive/20";
      case "Medium": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "Low": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      default: return "";
    }
  };

  // Group deadlines by month
  const sortedDeadlines = deadlines?.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-foreground">Calendar</h1>
          <p className="text-muted-foreground mt-1 text-sm">Track important case dates, court appearances, and filing deadlines.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Deadline
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>New Deadline</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Motion to Dismiss Due" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="caseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Case ID</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="High">High - Urgent</SelectItem>
                          <SelectItem value="Medium">Medium - Standard</SelectItem>
                          <SelectItem value="Low">Low - Informational</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="pt-4">
                  <Button type="submit" disabled={createDeadline.isPending}>
                    {createDeadline.isPending ? "Adding..." : "Save Deadline"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="animate-pulse flex gap-4 h-16 bg-card rounded-lg border border-border"></div>
          ))}
        </div>
      ) : sortedDeadlines.length > 0 ? (
        <div className="space-y-6">
          <div className="bg-card rounded-lg border border-border shadow-sm divide-y divide-border/50">
            {sortedDeadlines.map((deadline, i) => {
              const dDate = new Date(deadline.date);
              const isPast = dDate < new Date(new Date().setHours(0,0,0,0));
              
              return (
                <div key={deadline.id} className={`p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-muted/50 transition-colors animate-in fade-in slide-in-from-left-2`} style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="flex items-center gap-4 sm:w-48 shrink-0">
                    <div className={`p-3 rounded-md flex flex-col items-center justify-center min-w-16 border ${isPast ? 'bg-muted border-border/50 text-muted-foreground' : 'bg-primary/5 border-primary/20 text-primary'}`}>
                      <span className="text-xs font-semibold uppercase">{dDate.toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-xl font-bold leading-none mt-1">{dDate.getDate()}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-medium text-lg ${isPast ? 'text-muted-foreground line-through decoration-muted-foreground/30' : 'text-foreground'}`}>
                        {deadline.title}
                      </h3>
                      {isPast && <Badge variant="outline" className="text-xs py-0 h-5">Passed</Badge>}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        Case #{deadline.caseId}
                      </span>
                    </div>
                  </div>
                  
                  <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                    <Badge variant="outline" className={`${getPriorityColor(deadline.priority)}`}>
                      {deadline.priority === 'High' && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {deadline.priority}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-card rounded-lg border border-border shadow-sm">
          <Clock className="mx-auto h-12 w-12 text-muted-foreground opacity-30 mb-4" />
          <h3 className="text-lg font-medium text-foreground">No upcoming deadlines</h3>
          <p className="text-muted-foreground">Your calendar is clear.</p>
        </div>
      )}
    </div>
  );
};
