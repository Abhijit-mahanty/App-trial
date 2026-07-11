import { useState } from "react";
import { 
  useListTasks, 
  getListTasksQueryKey,
  useCreateTask,
  useUpdateTask
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckSquare, Circle, CheckCircle2, MoreVertical, Plus, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  caseId: z.coerce.number().min(1, "Case ID is required"),
  assignee: z.string().min(1, "Assignee is required"),
  dueDate: z.string().min(1, "Due date is required"),
  status: z.enum(["Open", "In Progress", "Completed"]).default("Open"),
});

type FormValues = z.infer<typeof taskSchema>;

export const Tasks = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");

  const { data: tasks, isLoading } = useListTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const form = useForm<FormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      caseId: 1,
      assignee: "J&B Attorney",
      status: "Open",
      dueDate: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = (data: FormValues) => {
    createTask.mutate(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
          setIsDialogOpen(false);
          form.reset();
          toast.success("Task created successfully");
        },
      }
    );
  };

  const handleStatusChange = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "Completed" ? "Open" : "Completed";
    updateTask.mutate(
      { id, data: { status: newStatus as any } },
      {
        onSuccess: (data) => {
          // Optimistic update pattern
          queryClient.setQueryData(getListTasksQueryKey(), (old: any) => {
            if (!old) return old;
            return old.map((t: any) => t.id === id ? { ...t, status: newStatus } : t);
          });
          toast.success(`Task marked as ${newStatus}`);
        }
      }
    );
  };

  const filteredTasks = tasks?.filter(t => statusFilter === "All" || t.status === statusFilter) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-1 text-sm">Action items and assigned responsibilities.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Task</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Title</FormLabel>
                      <FormControl>
                        <Input placeholder="What needs to be done?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
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
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="assignee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assignee</FormLabel>
                      <FormControl>
                        <Input placeholder="Who is responsible?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="pt-4">
                  <Button type="submit" disabled={createTask.isPending}>
                    {createTask.isPending ? "Saving..." : "Save Task"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card p-2 rounded-lg border border-border inline-flex w-full overflow-x-auto">
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
          <TabsList className="bg-transparent h-auto p-0">
            <TabsTrigger value="All" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2">All Tasks</TabsTrigger>
            <TabsTrigger value="Open" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2">Open</TabsTrigger>
            <TabsTrigger value="In Progress" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2">In Progress</TabsTrigger>
            <TabsTrigger value="Completed" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="animate-pulse h-16 bg-card rounded-lg border border-border"></div>
          ))}
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="bg-card rounded-lg border border-border shadow-sm divide-y divide-border/50">
          {filteredTasks.map((task, i) => (
            <div key={task.id} className="p-4 flex items-center gap-4 group hover:bg-muted/30 transition-colors animate-in fade-in" style={{ animationDelay: `${i * 20}ms` }}>
              <button 
                onClick={() => handleStatusChange(task.id, task.status)}
                className="shrink-0 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
              >
                {task.status === "Completed" ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                ) : (
                  <Circle className="h-6 w-6" />
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-base truncate ${task.status === 'Completed' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <Badge variant="secondary" className="text-[10px] font-normal py-0 h-5 px-1.5 border-border/50 bg-background">
                    Case #{task.caseId}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" /> {task.assignee}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              {task.status === "In Progress" && (
                <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-transparent shadow-none hidden sm:flex">
                  In Progress
                </Badge>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-card rounded-lg border border-dashed border-border">
          <CheckSquare className="h-12 w-12 text-muted-foreground mb-4 opacity-30" />
          <h3 className="text-lg font-medium text-foreground">No tasks found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            {statusFilter === "All" ? "You don't have any tasks assigned." : `You don't have any ${statusFilter.toLowerCase()} tasks.`}
          </p>
        </div>
      )}
    </div>
  );
};
