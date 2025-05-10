import { Tabs, TabsContent, TabsList, TabsTrigger } from "../animate-ui/components/tabs";

const BooleanTabs = ({ trueText, falseText }: { trueText: string; falseText: string }) => {
  return (
    <div>
      <Tabs defaultValue="true">
        <TabsList className="h-9 w-full">
          <TabsTrigger value="true">{trueText}</TabsTrigger>
          <TabsTrigger value="false">{falseText}</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default BooleanTabs;
