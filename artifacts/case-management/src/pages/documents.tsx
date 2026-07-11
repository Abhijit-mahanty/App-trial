import { useState } from "react";
import { 
  useListDocuments, 
  getListDocumentsQueryKey,
  useCreateDocument
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Search, Plus, Calendar, FileType, SearchX } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

const docSchema = z.object({
  name: z.string().min(1, "Document name is required"),
  caseId: z.coerce.number().min(1, "Case ID is required"),
  type: z.string().min(1, "Type is required"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
});

type DocFormValues = z.infer<typeof docSchema>;

export const Documents = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: documents, isLoading } = useListDocuments();
  const createDocument = useCreateDocument();

  const form = useForm<DocFormValues>({
    resolver: zodResolver(docSchema),
    defaultValues: {
      name: "",
      caseId: 1, // Defaulting to 1 for simplicity in this demo, real app would fetch cases
      type: "Legal Document",
      date: new Date().toISOString().split('T')[0],
      notes: "",
    },
  });

  const onSubmit = (data: DocFormValues) => {
    createDocument.mutate(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
          setIsDialogOpen(false);
          form.reset();
          toast.success("Document added successfully");
        },
        onError: () => {
          toast.error("Failed to add document");
        },
      }
    );
  };

  const filteredDocs = documents?.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-foreground">Documents</h1>
          <p className="text-muted-foreground mt-1 text-sm">Central repository for all case files and evidence.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Document Record</DialogTitle>
              <DialogDescription>
                Log a new document to the repository.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Deposition Transcript" {...field} />
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
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Legal Document">Legal Document</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Evidence">Evidence</SelectItem>
                          <SelectItem value="Transcript">Transcript</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
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
                      <FormLabel>Document Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
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
                        <Textarea placeholder="Optional details..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="pt-4">
                  <Button type="submit" disabled={createDocument.isPending}>
                    {createDocument.isPending ? "Adding..." : "Add Document"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card p-4 rounded-lg border border-border/50 shadow-sm relative">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search by name or type..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-background max-w-md"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <Card key={i} className="animate-pulse h-32"></Card>
          ))}
        </div>
      ) : filteredDocs && filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc, i) => (
            <Card key={doc.id} className="group hover:border-primary/40 transition-colors animate-in fade-in zoom-in-95" style={{ animationDelay: `${i * 30}ms` }}>
              <CardContent className="p-5 flex gap-4">
                <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground truncate" title={doc.name}>
                    {doc.name}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary" className="text-[10px] py-0 h-5 font-normal flex gap-1 items-center">
                      <FileType className="h-3 w-3" />
                      {doc.type}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] py-0 h-5 font-normal text-muted-foreground flex gap-1 items-center border-border/60">
                      <Calendar className="h-3 w-3" />
                      {new Date(doc.date).toLocaleDateString()}
                    </Badge>
                  </div>
                  {doc.notes && (
                    <p className="text-xs text-muted-foreground mt-2 truncate">
                      {doc.notes}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-card rounded-lg border border-dashed border-border">
          <SearchX className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground">No documents found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Try adjusting your search criteria or add a new document.
          </p>
        </div>
      )}
    </div>
  );
};
