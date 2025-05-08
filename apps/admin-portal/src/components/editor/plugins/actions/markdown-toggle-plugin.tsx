import { $isCodeNode } from "@lexical/code";
import { $createCodeNode } from "@lexical/code";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  Transformer,
} from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import IconButton from "@root/src/components/ui/icon-button";
import { $createTextNode } from "lexical";
import { $getRoot } from "lexical";
import { FileTextIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback } from "react";


export function MarkdownTogglePlugin({
  shouldPreserveNewLinesInMarkdown,
  transformers,
}: {
  shouldPreserveNewLinesInMarkdown: boolean;
  transformers: Array<Transformer>;
}) {
  const t = useTranslations();
  const [editor] = useLexicalComposerContext();

  const handleMarkdownToggle = useCallback(() => {
    editor.update(() => {
      const root = $getRoot();
      const firstChild = root.getFirstChild();
      if ($isCodeNode(firstChild) && firstChild.getLanguage() === "markdown") {
        $convertFromMarkdownString(
          firstChild.getTextContent(),
          transformers,
          undefined, // node
          shouldPreserveNewLinesInMarkdown,
        );
      } else {
        const markdown = $convertToMarkdownString(
          transformers,
          undefined, //node
          shouldPreserveNewLinesInMarkdown,
        );
        const codeNode = $createCodeNode("markdown");
        codeNode.append($createTextNode(markdown));
        root.clear().append(codeNode);
        if (markdown.length === 0) {
          codeNode.select();
        }
      }
    });
  }, [editor, shouldPreserveNewLinesInMarkdown]);

  return (
    <IconButton
      variant={"ghost"}
      onClick={handleMarkdownToggle}
      label={t("General.convert_from_markdown")}
      aria-label="Convert from markdown"
      size={"sm"}
      className="p-2"
      buttonType="button"
      icon={<FileTextIcon className="size-4" />}
    />
  );
}
