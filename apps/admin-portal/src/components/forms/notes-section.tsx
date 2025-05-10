import { SerializedEditorState } from "lexical";
import { Control } from "react-hook-form";

import { NotesEditor } from "../blocks/editor-x/notes-editor";
import { FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import FormSectionHeader from "./form-section-header";

const NotesSection = ({
  control,
  title,
  inDialog,
}: {
  control: Control<any>;
  title: string;
  inDialog?: boolean;
}) => {
  return (
    <div>
      <FormSectionHeader inDialog={inDialog} title={title} />
      <div className="form-container">
        <FormField
          control={control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <NotesEditor
                  editorSerializedState={field.value as unknown as SerializedEditorState}
                  onSerializedChange={(value: SerializedEditorState) => field.onChange(value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default NotesSection;
