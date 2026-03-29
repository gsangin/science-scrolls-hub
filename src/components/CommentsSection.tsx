import { useState } from "react";
import { MessageSquare, Send, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CommentsSectionProps {
  subject: string;
  classLevel: string;
  subjectName: string;
  className: string;
  isAdmin: boolean;
}

const CommentsSection = ({ subject, classLevel, subjectName, className: classLabel, isAdmin }: CommentsSectionProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const queryKey = ["comments", subject, classLevel];

  const { data: comments = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("subject", subject)
        .eq("class_level", classLevel)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("comments").insert({
        subject,
        class_level: classLevel,
        message,
        author_name: name.trim() || "Anonymous",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setMessage("");
      setName("");
      toast({ title: "Comment submitted!" });
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err: Error) => {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("comments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return (
    <div className="mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        className="gap-2"
      >
        <MessageSquare className="w-4 h-4" />
        Request / Comment
      </Button>

      {open && (
        <div className="mt-3 rounded-xl border border-border bg-card p-4 animate-in fade-in slide-in-from-top-2 duration-200 space-y-4">
          <h4 className="font-heading font-semibold text-sm text-card-foreground">
            {subjectName} — {classLabel}
          </h4>

          {/* Submit form */}
          <div className="space-y-2">
            <Input
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-sm"
            />
            <Textarea
              placeholder="Write your request or comment..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="text-sm min-h-[60px]"
            />
            <Button
              size="sm"
              onClick={() => addMutation.mutate()}
              disabled={!message.trim() || addMutation.isPending}
              className="gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              {addMutation.isPending ? "Sending..." : "Submit"}
            </Button>
          </div>

          {/* Comments list */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-3">No comments yet</p>
            ) : (
              comments.map((c: any) => (
                <div key={c.id} className="flex items-start gap-2 rounded-lg bg-muted/40 p-2.5 text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs text-card-foreground">{c.author_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 whitespace-pre-wrap">{c.message}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {new Date(c.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteMutation.mutate(c.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
