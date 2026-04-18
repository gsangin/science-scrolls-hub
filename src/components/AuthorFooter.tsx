import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AuthorSettings {
  name: string;
  description: string | null;
  photo_url: string | null;
  show_photo: boolean;
}

const AuthorFooter = () => {
  const { data: author } = useQuery<AuthorSettings | null>({
    queryKey: ["author_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("author_settings")
        .select("name, description, photo_url, show_photo")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data as AuthorSettings) ?? null;
    },
    staleTime: 10 * 60 * 1000, // author data rarely changes
    retry: 1,
  });

  if (!author) return null;

  return (
    <footer className="border-t border-border bg-muted/30 px-6 py-8 mt-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-start gap-5">
          {author.show_photo && author.photo_url && (
            <img
              src={author.photo_url}
              alt={author.name}
              className="w-16 h-16 rounded-full object-cover shrink-0 border-2 border-border"
              loading="lazy"
              decoding="async"
            />
          )}
          <div className="text-left">
            <h3 className="font-heading text-lg font-semibold text-foreground">About the Author</h3>
            <p className="mt-1 font-semibold text-primary">{author.name}</p>
            {author.description && (
              <p className="mt-1 text-sm text-muted-foreground">{author.description}</p>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AuthorFooter;
