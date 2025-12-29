import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Heart, MoreHorizontal } from "lucide-react"

const tagsList = ["Pop", "Rock", "Jazz", "Hip-Hop", "Classique", "Électro", "Indie", "Blues"];

export default function TagsSection() {
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const toggleTag = (tag: string) => {
      setSelectedTags(prev =>
        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
      );
    };
  
    return (
      <section className="my-6">
        <div className="flex items-center space-x-3 mb-4">
          <Button onClick={() => console.log("Play tags:", selectedTags)} size="icon" className="rounded-full p-6 bg-white cursor-pointer">
            <Play className="w-6 h-6 text-black" />
          </Button>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tag => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
  
        <div className="flex flex-wrap gap-2">
  {tagsList.map(tag => {
    const isSelected = selectedTags.includes(tag);
    return (
      <Button
        key={tag}
        size="sm"
        variant="outline"
        onClick={() => toggleTag(tag)}
        style={{
          backgroundColor: isSelected ? "##2a0c0c" : undefined, // bg-blue-500
          color: isSelected ? "#5ea500" : undefined,               // text-white
          borderColor: isSelected ? "#5ea500" : undefined,      // border-blue-500
        }}
      >
        {tag}
      </Button>
    );
  })}
</div>


      </section>
    );
  }