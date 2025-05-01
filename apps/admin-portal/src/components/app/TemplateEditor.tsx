import { useState } from "react";

import { Printer, Save } from "lucide-react";

import { Button } from "@/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Textarea } from "@/ui/textarea";

interface TemplateEditorProps {
  template: {
    id: string;
    name: string;
    type: "invoice" | "quote";
    content: any;
  };
  onSave?: (template_id: string, content: string) => void;
}

export default function TemplateEditor({ template, onSave }: TemplateEditorProps) {
  const [editedContent, setEditedContent] = useState(JSON.stringify(template.content, null, 2));
  const [activeTab, setActiveTab] = useState("preview");

  const handleSave = () => {
    if (onSave) {
      try {
        // Validate JSON before saving
        JSON.parse(editedContent);
        onSave(template.id, editedContent);
      } catch (error) {
        console.error("Invalid JSON:", error);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderPreview = () => {
    try {
      const content = JSON.parse(editedContent);
      return (
        <div className="min-h-[600px] rounded-lg bg-white p-8 shadow print:p-0 print:shadow-none">
          <div className="mx-auto max-w-3xl">
            {/* Header */}
            <div className="mb-8 flex items-start justify-between print:mb-12">
              <div>
                <h1 className="text-3xl font-bold">{template.name}</h1>
                <div className="mt-2">
                  <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800 print:bg-gray-50">
                    {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                  </span>
                </div>
              </div>
              {content.logo && (
                <img src={content.logo} alt="Company Logo" className="h-16 w-auto object-contain" />
              )}
            </div>

            {/* Company Details */}
            {content.company && (
              <div className="mb-8 print:mb-12">
                <h2 className="mb-2 text-lg font-semibold">Company Details</h2>
                <div className="text-gray-600">
                  <p>{content.company.name}</p>
                  <p>{content.company.address}</p>
                  <p>{content.company.contact}</p>
                </div>
              </div>
            )}

            {/* Client Details */}
            {content.client && (
              <div className="mb-8 print:mb-12">
                <h2 className="mb-2 text-lg font-semibold">Client Details</h2>
                <div className="text-gray-600">
                  <p>{content.client.name}</p>
                  <p>{content.client.address}</p>
                  <p>{content.client.contact}</p>
                </div>
              </div>
            )}

            {/* Items */}
            {content.items && content.items.length > 0 && (
              <div className="mb-8 print:mb-12">
                <h2 className="mb-4 text-lg font-semibold">Items</h2>
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left">Description</th>
                      <th className="py-2 text-right">Quantity</th>
                      <th className="py-2 text-right">Price</th>
                      <th className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.items.map((item: any, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{item.description}</td>
                        <td className="py-2 text-right">{item.quantity}</td>
                        <td className="py-2 text-right">${item.price}</td>
                        <td className="py-2 text-right">${item.quantity * item.price}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="py-4 text-right font-semibold">
                        Total:
                      </td>
                      <td className="py-4 text-right font-semibold">
                        $
                        {content.items.reduce(
                          (sum: number, item: any) => sum + item.quantity * item.price,
                          0,
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Notes */}
            {content.notes && (
              <div className="mb-8 print:mb-12">
                <h2 className="mb-2 text-lg font-semibold">Notes</h2>
                <p className="whitespace-pre-line text-gray-600">{content.notes}</p>
              </div>
            )}

            {/* Terms */}
            {content.terms && (
              <div className="border-t pt-4 text-sm text-gray-500">
                <h3 className="mb-1 font-semibold">Terms & Conditions</h3>
                <p className="whitespace-pre-line">{content.terms}</p>
              </div>
            )}
          </div>
        </div>
      );
    } catch (error) {
      return (
        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          Invalid JSON format. Please check your template content.
        </div>
      );
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="edit">Edit</TabsTrigger>
          </TabsList>

          <div className="absolute top-0 right-0 flex gap-2">
            <Button onClick={handlePrint} variant="outline" className="gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>

          <TabsContent value="preview" className="mt-4">
            {renderPreview()}
          </TabsContent>

          <TabsContent value="edit" className="mt-4">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[600px] font-mono"
              placeholder="Enter template content in JSON format"
            />
          </TabsContent>
        </Tabs>
      </div>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          #preview-content,
          #preview-content * {
            visibility: visible;
          }
          #preview-content {
            position: absolute;
            left: 0;
            top: 0;
          }
        }
      `}</style>
    </div>
  );
}
