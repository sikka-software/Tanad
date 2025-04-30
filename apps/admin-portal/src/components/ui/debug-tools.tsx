import { HelpCircle } from "lucide-react";

import useUserStore from "@/stores/use-user-store";

import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { ScrollArea } from "./scroll-area";

const DebugTools = () => {
  const profile = useUserStore((state) => state.profile);
  const user = useUserStore((state) => state.user);
  const enterprise = useUserStore((state) => state.enterprise);
  const membership = useUserStore((state) => state.membership);
  const permissions = useUserStore((state) => state.permissions);

  return (
    <div className="fixed bottom-14 left-1 z-50 flex flex-col gap-2 p-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button size="icon_sm" className="size-[38px] rounded-full" variant="outline">
            <HelpCircle />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" side="left" className="w-[300px]">
          <ScrollArea className="h-[400px]">
            <div className="flex flex-col gap-4">
            <div>
              <div className="text-xs font-bold">User ID</div>
                <div className="text-xs break-all">{user?.id}</div>
              </div>
              <div>
                <div className="text-xs font-bold">Enterprise</div>
                <div className="text-xs break-all">
                  {enterprise?.name} ({enterprise?.id})
                </div>
              </div>
              <div>
                <div className="text-xs font-bold">Role ID</div>
                <div className="text-xs break-all">{membership?.role_id}</div>
            </div>
            <div>
                <div className="text-xs font-bold">Permissions</div>
                <div className="flex flex-col gap-1">
                  {permissions.map((permission) => (
                    <div key={permission} className="text-xs">
                      {permission}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DebugTools;
