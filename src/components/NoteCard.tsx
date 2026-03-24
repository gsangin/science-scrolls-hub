import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Download, Share2 } from "lucide-react";

interface NoteCardProps {
  title: string;
  chapter: string;
  previewUrl: string;
  pdfUrl: string;
}

const NoteCard = ({ title, chapter, previewUrl, pdfUrl }: NoteCardProps) => {
  return (
    <Card className="group mb-8 overflow-hidden border-none bg-card/50 shadow-xl transition-all active:scale-[0.98]">
      {/* Large Page Preview */}
      <div className="relative w-full">
        <AspectRatio ratio={3 / 4} className="bg-muted">
          <img
            src={previewUrl}
            alt={title}
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
             <span className="text-white text-xs font-medium flex items-center gap-2">
               <Eye size={14} /> Full Page Preview
             </span>
          </div>
        </AspectRatio>
      </div>

      {/* Content & Action Buttons */}
      <div className="p-5 bg-background/60 backdrop-blur-md">
        <div className="flex flex-col gap-1 mb-4">
          <Badge className="w-fit bg-primary/10 text-primary hover:bg-primary/20 border-none text-[10px]">
            {chapter}
          </Badge>
          <h3 className="font-bold text-xl tracking-tight leading-tight">{title}</h3>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => window.open(pdfUrl, '_blank')}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 active:opacity-90"
          >
            <Eye size={18} /> Read Scroll
          </button>
          <button className="p-3.5 bg-secondary text-secondary-foreground rounded-2xl active:bg-secondary/80">
            <Download size={20} />
          </button>
          <button className="p-3.5 bg-secondary text-secondary-foreground rounded-2xl active:bg-secondary/80">
            <Share2 size={20} />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default NoteCard;
