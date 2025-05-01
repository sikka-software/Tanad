import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent, TabsContents } from "@/ui/tabs";

export const DepartmentsFeatures = () => {
  return (
    <Tabs defaultValue="account" className="bg-muted mx-auto rounded-lg mb-24">
      <TabsList className="gap-4">
        <TabsTrigger value="invoicing">Invoicing</TabsTrigger>
        <TabsTrigger value="crm">CRM</TabsTrigger>
        <TabsTrigger value="accounting">Accounting</TabsTrigger>
        <TabsTrigger value="inventory">Inventory</TabsTrigger>
        <TabsTrigger value="human-resources">Human Resources</TabsTrigger>
        <TabsTrigger value="administration">Administration</TabsTrigger>
      </TabsList>

      <TabsContents className="bg-background mx-1 -mt-2 mb-1 h-full rounded-sm">
        <TabsContent value="invoicing" className="space-y-6 p-6">
          <p className="text-muted-foreground text-sm">
            Make changes to your account here. Click save when you&apos;re done.
          </p>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="Pedro Duarte" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="username">Username</Label>
              <Input id="username" defaultValue="@peduarte" />
            </div>
          </div>

          <Button>Save changes</Button>
        </TabsContent>
        <TabsContent value="crm" className="space-y-6 p-6">
          <p className="text-muted-foreground text-sm">
            Change your password here. After saving, you&apos;ll be logged out.
          </p>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="current">Current password</Label>
              <Input id="current" type="password" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">New password</Label>
              <Input id="new" type="password" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input id="confirm" type="password" />
            </div>
          </div>

          <Button>Save password</Button>
        </TabsContent>
      </TabsContents>
    </Tabs>
  );
};
