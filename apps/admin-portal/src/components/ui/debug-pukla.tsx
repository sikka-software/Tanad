import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/ui/accordion";

import { useMainStore } from "@/hooks/main.store";

const DebugPukla = () => {
  const { selectedPukla } = useMainStore();
  return (
    <div className="bg-background fixed end-2 bottom-2 z-[100] rounded border px-4 py-0">
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" className="min-w-[200px] !border-none">
          <AccordionTrigger>Current Pukla is</AccordionTrigger>
          <AccordionContent className="bg-muted-foreground/10 max-h-[200px] max-w-[200px] overflow-y-auto rounded p-2">
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
