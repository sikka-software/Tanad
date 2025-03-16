import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useMainStore } from "@/hooks/main.store";

const DebugPukla = () => {
  const { selectedPukla } = useMainStore();
  return (
    <div className="fixed bottom-2 end-2 py-0 px-4 z-[100] bg-background border rounded">
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" className="min-w-[200px] !border-none">
          <AccordionTrigger>Current Pukla is</AccordionTrigger>
          <AccordionContent className="max-w-[200px] p-2 rounded bg-muted-foreground/10 max-h-[200px] overflow-y-auto">
            <pre dir="ltr" className="overflow-y-auto">
              {JSON.stringify(selectedPukla, null, 2)}
            </pre>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default DebugPukla;
