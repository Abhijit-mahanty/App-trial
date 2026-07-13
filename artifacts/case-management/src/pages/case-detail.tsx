import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { 
  useGetCase, 
  useUpdateCase, 
  useDeleteCase,
  getGetCaseQueryKey,
  useListDocuments,
  getListDocumentsQueryKey,
  useCreateDocument,
  useListDeadlines,
  getListDeadlinesQueryKey,
  useCreateDeadline,
  useListTasks,
  getListTasksQueryKey,
  useCreateTask,
  useUpdateTask,
  useListInteractions,
  getListInteractionsQueryKey,
  useCreateInteraction,
  CaseUpdate
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Files, 
  CalendarDays, 
  CheckSquare, 
  MessagesSquare,
  Clock,
  User,
  Scale,
  Plus,
  Circle,
  CheckCircle2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
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

export const CaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const caseId = parseInt(id || "0", 10);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDocOpen, setIsDocOpen] = useState(false);
  const [isDeadlineOpen, setIsDeadlineOpen] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [isInteractionOpen, setIsInteractionOpen] = useState(false);

  const { data: caseData, isLoading: caseLoading } = useGetCase(caseId, {
    query: { 
      queryKey:
      getGetCaseQueryKey(caseId),
      enabled: !!caseId,
    }
  });
  
  // Scoped queries
  const { data: documents } = useListDocuments(
  { caseId },
  {
    query: {
      queryKey: getListDocumentsQueryKey({ caseId }),
      enabled: !!caseId,
    },
  }
);

const { data: deadlines } = useListDeadlines(
  { caseId },
  {
    query: {
      queryKey: getListDeadlinesQueryKey({ caseId }),
      enabled: !!caseId,
    },
  }
);

const { data: tasks } = useListTasks(
  { caseId },
  {
    query: {
      queryKey: getListTasksQueryKey({ caseId }),
      enabled: !!caseId,
    },
  }
);

const { data: interactions } = useListInteractions(
  { caseId },
  {
    query: {
      queryKey: getListInteractionsQueryKey({ caseId }),
      enabled: !!caseId,
    },
  }
);

  const updateCase = useUpdateCase();
  const deleteCase = useDeleteCase();
  const createDocument = useCreateDocument();
  const createDeadline = useCreateDeadline();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const createInteraction = useCreateInteraction();

  // Edit form state
  const [editForm, setEditForm] = useState<CaseUpdate>({});

  const handleEditOpen = () => {
    if (caseData) {
      setEditForm({
        name: caseData.name,
        client: caseData.client,
        status: caseData.status as any,
        description: caseData.description || "",
      });
      setIsEditOpen(true);
    }
  };

  const handleUpdate = () => {
    updateCase.mutate(
      { id: caseId, data: editForm },
      {
        onSuccess: (updatedCase) => {
          queryClient.setQueryData(getGetCaseQueryKey(caseId), updatedCase);
          setIsEditOpen(false);
          toast.success("Case updated successfully");
        },
        onError: () => toast.error("Failed to update case"),
      }
    );
  };

  const handleDelete = () => {
    deleteCase.mutate(
      { id: caseId },
      {
        onSuccess: () => {
          toast.success("Case deleted");
          setLocation("/cases");
        },
        onError: () => toast.error("Failed to delete case"),
      }
    );
  };

  // Forms setup
  const docForm = useForm({
    resolver: zodResolver(z.object({
      name: z.string().min(1, "Name required"),
      type: z.string().min(1, "Type required"),
      date: z.string().min(1, "Date required"),
      notes: z.string().optional(),
    })),
    defaultValues: { name: "", type: "Legal Document", date: new Date().toISOString().split('T')[0], notes: "" }
  });

  const onDocSubmit = (data: any) => {
    createDocument.mutate({ data: { ...data, caseId } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey({ caseId }) });
        setIsDocOpen(false);
        docForm.reset();
        toast.success("Document added");
      }
    });
  };

  const deadlineForm = useForm({
    resolver: zodResolver(z.object({
      title: z.string().min(1, "Title required"),
      priority: z.enum(["High", "Medium", "Low"]),
      date: z.string().min(1, "Date required"),
    })),
    defaultValues: { title: "", priority: "Medium", date: new Date().toISOString().split('T')[0] }
  });

  const onDeadlineSubmit = (data: any) => {
    createDeadline.mutate({ data: { ...data, caseId } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDeadlinesQueryKey({ caseId }) });
        setIsDeadlineOpen(false);
        deadlineForm.reset();
        toast.success("Deadline added");
      }
    });
  };

  const taskForm = useForm({
    resolver: zodResolver(z.object({
      title: z.string().min(1, "Title required"),
      assignee: z.string().min(1, "Assignee required"),
      dueDate: z.string().min(1, "Due date required"),
    })),
    defaultValues: { title: "", assignee: "J&B Attorney", dueDate: new Date().toISOString().split('T')[0] }
  });

  const onTaskSubmit = (data: any) => {
    createTask.mutate({ data: { ...data, caseId, status: "Open" } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey({ caseId }) });
        setIsTaskOpen(false);
        taskForm.reset();
        toast.success("Task added");
      }
    });
  };

  const handleTaskStatusToggle = (taskId: number, currentStatus: string) => {
    const newStatus = currentStatus === "Completed" ? "Open" : "Completed";
    updateTask.mutate({ id: taskId, data: { status: newStatus as any } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey({ caseId }) });
      }
    });
  };

  const interactionForm = useForm({
    resolver: zodResolver(z.object({
      client: z.string().min(1, "Client required"),
      type: z.enum(["Phone Call", "Email", "Meeting", "Letter"]),
      date: z.string().min(1, "Date required"),
      notes: z.string().min(1, "Notes required"),
    })),
    defaultValues: { client: "", type: "Phone Call", date: new Date().toISOString().split('T')[0], notes: "" }
  });

  const onInteractionSubmit = (data: any) => {
    createInteraction.mutate({ data: { ...data, caseId } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListInteractionsQueryKey({ caseId }) });
        setIsInteractionOpen(false);
        interactionForm.reset();
        toast.success("Interaction logged");
      }
    });
  };

  if (caseLoading) {
    return <div className="animate-pulse space-y-6">
      <div className="h-8 w-64 bg-muted rounded"></div>
      <div className="h-32 bg-card rounded-lg border border-border"></div>
      <div className="h-64 bg-card rounded-lg border border-border mt-6"></div>
    </div>;
  }

  if (!caseData) return <div>Case not found</div>;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      <div className="flex items-center gap-4 flex-wrap">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-full border border-border/50 shrink-0">
          <Link href="/cases"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Matter #{caseData.id}</span>
          <h1 className="text-3xl font-serif font-bold text-foreground leading-none">{caseData.name}</h1>
        </div>
        <div className="ml-auto flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleEditOpen} className="gap-2">
                <Edit className="h-4 w-4" /> Edit Matter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Case Matter</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Matter Name</label>
                  <Input 
                    value={editForm.name || ""} 
                    onChange={e => setEditForm(prev => ({...prev, name: e.target.value}))} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Client</label>
                  <Input 
                    value={editForm.client || ""} 
                    onChange={e => setEditForm(prev => ({...prev, client: e.target.value}))} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select 
                    value={editForm.status || "Active"} 
                    onValueChange={(val: any) => setEditForm(prev => ({...prev, status: val}))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea 
                    value={editForm.description || ""} 
                    onChange={e => setEditForm(prev => ({...prev, description: e.target.value}))} 
                  />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <Button onClick={handleUpdate} disabled={updateCase.isPending}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-2">
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this case?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the case
                  and all associated documents, deadlines, tasks, and interactions.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete Matter
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card className="border-border shadow-sm bg-card overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="p-6 md:col-span-2 space-y-4 bg-background/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm">
                  <User className="h-4 w-4" /> Client
                </div>
                <Badge variant={caseData.status === 'Active' ? 'default' : caseData.status === 'Pending' ? 'secondary' : 'outline'}>
                  {caseData.status}
                </Badge>
              </div>
              <div className="text-xl font-medium">{caseData.client}</div>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Matter Description</h4>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {caseData.description || <span className="italic text-muted-foreground">No description provided.</span>}
                </p>
              </div>
            </div>
            
            <div className="p-6 flex flex-col justify-center items-center text-center">
              <Clock className="h-8 w-8 text-primary mb-3 opacity-80" />
              <div className="text-3xl font-bold font-serif">{caseData.daysActive}</div>
              <div className="text-sm text-muted-foreground mt-1">Days Active</div>
            </div>
            
            <div className="p-6 flex flex-col justify-center items-center text-center bg-muted/20">
              <Scale className="h-8 w-8 text-primary mb-3 opacity-80" />
              <div className="text-sm font-medium text-foreground">Opened</div>
              <div className="text-muted-foreground mt-1">
                {new Date(caseData.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="w-full justify-start h-auto p-1 bg-card border border-border rounded-lg shadow-sm overflow-x-auto flex-nowrap shrink-0">
          <TabsTrigger value="documents" className="py-2.5 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium rounded-md flex gap-2 shrink-0">
            <Files className="h-4 w-4" /> Documents ({documents?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="deadlines" className="py-2.5 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium rounded-md flex gap-2 shrink-0">
            <CalendarDays className="h-4 w-4" /> Deadlines ({deadlines?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="tasks" className="py-2.5 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium rounded-md flex gap-2 shrink-0">
            <CheckSquare className="h-4 w-4" /> Tasks ({tasks?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="interactions" className="py-2.5 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium rounded-md flex gap-2 shrink-0">
            <MessagesSquare className="h-4 w-4" /> Log ({interactions?.length || 0})
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6 bg-card border border-border rounded-lg shadow-sm p-6 min-h-[400px]">
          {/* Documents Tab */}
          <TabsContent value="documents" className="mt-0">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Case Documents</h3>
              <Dialog open={isDocOpen} onOpenChange={setIsDocOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Document</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Document</DialogTitle></DialogHeader>
                  <Form {...docForm}>
                    <form onSubmit={docForm.handleSubmit(onDocSubmit)} className="space-y-4">
                      <FormField control={docForm.control} name="name" render={({field}) => (
                        <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                      )} />
                      <FormField control={docForm.control} name="type" render={({field}) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="Legal Document">Legal Document</SelectItem>
                              <SelectItem value="Contract">Contract</SelectItem>
                              <SelectItem value="Evidence">Evidence</SelectItem>
                              <SelectItem value="Transcript">Transcript</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <FormField control={docForm.control} name="date" render={({field}) => (
                        <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>
                      )} />
                      <FormField control={docForm.control} name="notes" render={({field}) => (
                        <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
                      )} />
                      <Button type="submit" className="w-full" disabled={createDocument.isPending}>Save</Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            {documents && documents.length > 0 ? (
              <div className="grid gap-3">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded border border-border/60 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded text-primary">
                        <Files className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.type} • {new Date(doc.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-10">No documents associated with this case.</p>
            )}
          </TabsContent>
          
          {/* Deadlines Tab */}
          <TabsContent value="deadlines" className="mt-0">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Upcoming Deadlines</h3>
              <Dialog open={isDeadlineOpen} onOpenChange={setIsDeadlineOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Deadline</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Deadline</DialogTitle></DialogHeader>
                  <Form {...deadlineForm}>
                    <form onSubmit={deadlineForm.handleSubmit(onDeadlineSubmit)} className="space-y-4">
                      <FormField control={deadlineForm.control} name="title" render={({field}) => (
                        <FormItem><FormLabel>Event Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                      )} />
                      <FormField control={deadlineForm.control} name="priority" render={({field}) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="High">High</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="Low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <FormField control={deadlineForm.control} name="date" render={({field}) => (
                        <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>
                      )} />
                      <Button type="submit" className="w-full" disabled={createDeadline.isPending}>Save</Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            {deadlines && deadlines.length > 0 ? (
              <div className="grid gap-3">
                {deadlines.map(d => (
                  <div key={d.id} className="flex items-center justify-between p-3 rounded border border-border/60 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="font-mono font-medium text-center bg-muted p-2 rounded min-w-14">
                        {new Date(d.date).getDate()} <span className="block text-[10px] uppercase text-muted-foreground">{new Date(d.date).toLocaleString('default', { month: 'short' })}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{d.title}</p>
                        <Badge variant="outline" className={`mt-1 text-[10px] py-0 h-4 ${
                          d.priority === 'High' ? 'text-destructive border-destructive/30 bg-destructive/5' : 
                          d.priority === 'Medium' ? 'text-amber-600 border-amber-600/30 bg-amber-500/5' : 
                          'text-emerald-600 border-emerald-600/30 bg-emerald-500/5'
                        }`}>
                          {d.priority} Priority
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-10">No upcoming deadlines.</p>
            )}
          </TabsContent>
          
          {/* Tasks Tab */}
          <TabsContent value="tasks" className="mt-0">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Action Items</h3>
              <Dialog open={isTaskOpen} onOpenChange={setIsTaskOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Task</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Task</DialogTitle></DialogHeader>
                  <Form {...taskForm}>
                    <form onSubmit={taskForm.handleSubmit(onTaskSubmit)} className="space-y-4">
                      <FormField control={taskForm.control} name="title" render={({field}) => (
                        <FormItem><FormLabel>Task</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                      )} />
                      <FormField control={taskForm.control} name="assignee" render={({field}) => (
                        <FormItem><FormLabel>Assignee</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                      )} />
                      <FormField control={taskForm.control} name="dueDate" render={({field}) => (
                        <FormItem><FormLabel>Due Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>
                      )} />
                      <Button type="submit" className="w-full" disabled={createTask.isPending}>Save</Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            {tasks && tasks.length > 0 ? (
              <div className="grid gap-3">
                {tasks.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded border border-border/60 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleTaskStatusToggle(t.id, t.status)}
                        className="shrink-0 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                      >
                        {t.status === 'Completed' ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5" />}
                      </button>
                      <div>
                        <p className={`font-medium text-sm ${t.status === 'Completed' ? 'line-through text-muted-foreground' : ''}`}>{t.title}</p>
                        <p className="text-xs text-muted-foreground">Assigned to: {t.assignee}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">{t.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-10">No tasks assigned to this case.</p>
            )}
          </TabsContent>
          
          {/* Interactions Tab */}
          <TabsContent value="interactions" className="mt-0">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Communication Log</h3>
              <Dialog open={isInteractionOpen} onOpenChange={setIsInteractionOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Log Interaction</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Log Interaction</DialogTitle></DialogHeader>
                  <Form {...interactionForm}>
                    <form onSubmit={interactionForm.handleSubmit(onInteractionSubmit)} className="space-y-4">
                      <FormField control={interactionForm.control} name="client" render={({field}) => (
                        <FormItem><FormLabel>Contact Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                      )} />
                      <FormField control={interactionForm.control} name="type" render={({field}) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="Phone Call">Phone Call</SelectItem>
                              <SelectItem value="Email">Email</SelectItem>
                              <SelectItem value="Meeting">Meeting</SelectItem>
                              <SelectItem value="Letter">Letter</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <FormField control={interactionForm.control} name="date" render={({field}) => (
                        <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>
                      )} />
                      <FormField control={interactionForm.control} name="notes" render={({field}) => (
                        <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
                      )} />
                      <Button type="submit" className="w-full" disabled={createInteraction.isPending}>Save</Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            {interactions && interactions.length > 0 ? (
              <div className="relative border-l border-border ml-3 space-y-6">
                {interactions.map((i) => (
                  <div key={i.id} className="relative pl-6">
                    <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                    <div className="bg-background border border-border/60 p-3 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-medium text-sm block">{i.client}</span>
                          <span className="text-xs text-muted-foreground">{i.type}</span>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                          {new Date(i.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80">{i.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-10">No communications logged yet.</p>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};