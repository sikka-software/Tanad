import { DraggableBlockPlugin_EXPERIMENTAL } from "@lexical/react/LexicalDraggableBlockPlugin";
import { GripVerticalIcon } from "lucide-react";
import { useRef, JSX } from "react";

const DRAGGABLE_BLOCK_MENU_CLASSNAME = "draggable-block-menu";

function isOnMenu(element: HTMLElement): boolean {
  return !!element.closest(`.${DRAGGABLE_BLOCK_MENU_CLASSNAME}`);
}

export function DraggableBlockPlugin({
  anchorElem,
}: {
  anchorElem: HTMLElement | null;
}): JSX.Element | null {
  const menuRef = useRef<HTMLDivElement>(null);
  const targetLineRef = useRef<HTMLDivElement>(null);

  if (!anchorElem) {
    return null;
  }

  return (
    <DraggableBlockPlugin_EXPERIMENTAL
      anchorElem={anchorElem}
      menuRef={menuRef as React.RefObject<HTMLDivElement>}
      targetLineRef={targetLineRef as React.RefObject<HTMLDivElement>}
      menuComponent={
        <div
          ref={menuRef}
          className="draggable-block-menu absolute start-0 top-0 cursor-grab rounded-sm px-[1px] py-0.5 opacity-0 will-change-transform hover:bg-gray-100 active:cursor-grabbing rtl:right-2"
        >
          <GripVerticalIcon className="size-4 opacity-30" />
        </div>
      }
      targetLineComponent={
        <div
          ref={targetLineRef}
          className="bg-secondary-foreground pointer-events-none absolute start-0 top-0 h-1 opacity-0 will-change-transform rtl:right-12"
        />
      }
      isOnMenu={isOnMenu}
    />
  );
}
