import { HelpCircle } from "lucide-react";

import useUserStore from "@/stores/use-user-store";

import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const DebugTools = () => {
  const profile = useUserStore((state) => state.profile);
  const user = useUserStore((state) => state.user);
  return (
    <div className="fixed bottom-14 left-1 z-50 flex flex-col gap-2 p-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button size="icon_sm" className="size-[38px] rounded-full" variant="outline">
            <HelpCircle />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" side="left">
          <div className="flex flex-col gap-2">
            <div>
              <div className="text-xs font-bold">User ID</div>
              <div className="text-xs text-nowrap">{user?.id}</div>
            </div>
            <div>
              <div className="text-xs font-bold">Enterprise ID</div>
              <div className="text-xs text-nowrap">{profile?.enterprise_id}</div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DebugTools;
