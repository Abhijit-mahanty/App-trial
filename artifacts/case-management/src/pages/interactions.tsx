import { useState } from "react";
import { 
  useListInteractions, 
  getListInteractionsQueryKey,
  useCreateInteraction
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Mail, Users, FileText, Plus, MessagesSquare } from "lucide-react";
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

const interactionSchema = z.object({
  caseId: z.coerce.number().min(1, "Case ID is required"),
  client: z.string().min(1, "Client is required"),
  type: z.enum(["Phone Call", "Email", "Meeting", "Letter"]),
  date: z.string().min(1, "Date is required"),
  notes: z.string().min(1, "Notes are required"),
});

type FormValues = z.infer<typeof interactionSchema>;

export const Interactions = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: interactions, isLoading } = useListInteractions();
  const createInteraction = useCreateInteraction();

  const form = useForm<FormValues>({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      caseId: 1,
      client: "",
      type: "Phone Call",
      date: new Date().toISOString().split('T')[0],
      notes: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    createInteraction.mutate(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListInteractionsQueryKey() });
          setIsDialogOpen(false);
          form.reset();
          toast.success("Interaction logged successfully");
        },
      }
    );
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "Phone Call": return <Phone className="h-4 w-4" />;
      case "Email": return <Mail className="h-4 w-4" />;
      case "Meeting": return <Users className="h-4 w-4" />;
      case "Letter": return <FileText className="h-4 w-4" />;
      default: return <MessagesSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-foreground">Interactions</h1>
          <p className="text-muted-foreground mt-1 text-sm">Log of all communications with clients and opposing counsel.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Log Interaction
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Log New Interaction</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
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
                </div>
                <FormField
                  control={form.control}
                  name="client"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client / Contact</FormLabel>
                      <FormControl>
                        <Input placeholder="Who did you interact with?" {...field} />
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
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Phone Call">Phone Call</SelectItem>
                          <SelectItem value="Email">Email</SelectItem>
                          <SelectItem value="Meeting">Meeting</SelectItem>
                          <SelectItem value="Letter">Letter</SelectItem>
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
                      <FormLabel>Notes / Summary</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Summary of the communication..." className="min-h-[100px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="pt-4">
                  <Button type="submit" disabled={createInteraction.isPending}>
                    {createInteraction.isPending ? "Saving..." : "Save Log"}
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
            <Card key={i} className="animate-pulse h-32"></Card>
          ))}
        </div>
      ) : interactions && interactions.length > 0 ? (
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          {interactions.map((interaction, i) => (
            <div key={interaction.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-card shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-primary">
                {getIconForType(interaction.type)}
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-border bg-card shadow-sm group-hover:border-primary/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{interaction.client}</span>
                    <Badge variant="secondary" className="text-[10px] font-normal h-5 py-0">Case #{interaction.caseId}</Badge>
                  </div>
                  <time className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded">
                    {new Date(interaction.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </time>
                </div>
                <div className="text-sm text-foreground/80 bg-background/50 p-3 rounded border border-border/40 whitespace-pre-wrap">
                  {interaction.notes}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-card rounded-lg border border-dashed border-border">
          <MessagesSquare className="h-12 w-12 text-muted-foreground mb-4 opacity-30" />
          <h3 className="text-lg font-medium text-foreground">No interactions logged</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Keep track of all client communications by logging them here.
          </p>
        </div>
      )}
    </div>
  );
};
