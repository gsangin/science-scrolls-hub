import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AuthorSettings {
  name: string;
  description: string | null;
  photo_url: string | null;
  show_photo: boolean;
}

const AuthorFooter = () => {
  const [author, setAuthor] = useState<AuthorSettings | null>(null);

  useEffect(() => {
    const fetchAuthor = async () => {
      const { data } = await supabase
        .from("author_settings")
        .select("*")
        .limit(1)
        .single();
      if (data) setAuthor(data as AuthorSettings);
    };
    fetchAuthor();
  }, []);

  if (!author) return null;

  return (
    <footer className="border-t border-border bg-muted/30 px-6 py-8 mt-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-start gap-5">
          {author.show_photo && author.photo_url && (
            <img
              src={author.photo_url.replace("/object/public/", "/render/image/public/") + (author.photo_url.includes("?") ? "&" : "?") + "width=128&height=128&resize=cover&quality=75"}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = author.photo_url!; }}
              alt={author.name}
              width={64}
              height={64}
              loading="lazy"
              decoding="async"
              className="w-16 h-16 rounded-full object-cover shrink-0 border-2 border-border"
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
