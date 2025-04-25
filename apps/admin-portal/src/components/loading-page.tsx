import { Loader2 } from "lucide-react";

export default function LoadingPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="text-primary h-8 w-8 animate-spin" />
    </div>
  );
}
