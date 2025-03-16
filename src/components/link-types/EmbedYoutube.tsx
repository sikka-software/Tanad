import React from "react";
// UI
import { Input } from "@/components/ui/input";

type EmbedYoutubeType = {
  test?: any;
};

export const EmbedYoutube: React.FC<EmbedYoutubeType> = (props) => {
  return (
    <div className="p-4">
      <Input
        // label={"Link"}
        placeholder={"https://www.youtube.com/embed/dQw4w9WgXcQ"}
      />
    </div>
  );
};
