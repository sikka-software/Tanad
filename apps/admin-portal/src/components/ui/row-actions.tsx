"use client";

import { MoreHorizontal, Trash2, Edit, Copy, Eye, Archive } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import React, { useState } from "react";

import { Button } from "./button";
import IconButton from "./icon-button";

interface RowActionsProps {
  onEdit?: () => void;
  onDuplicate?: () => void;
  onView?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onPreview?: () => void;
  texts?: {
    edit?: string;
    duplicate?: string;
    view?: string;
    archive?: string;
    delete?: string;
    preview?: string;
  };
}
const RowActions = ({
  onEdit,
  onDuplicate,
  onView,
  onArchive,
  onDelete,
  onPreview,
  texts,
}: RowActionsProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const actions = [onDelete, onEdit, onDuplicate, onView, onArchive, onPreview];
  const availableActionsCount = actions.filter(Boolean).length; // Count how many actions are defined
  const collapsedWidth = 32; // Default width when collapsed or no actions
  // Calculate expanded width based on the number of actions:
  // Each button is w-7 (28px), gap is gap-1 (4px), padding is p-1 (4px on each side)
  // Width = (count * 28) + (max(0, count - 1) * 4) + (2 * 4)
  // Simplified: Width = 32 * count + 4 (for count >= 1)
  const expandedWidth = availableActionsCount > 0 ? availableActionsCount * 32 + 4 : collapsedWidth;
  return (
    <motion.div
      className="relative flex items-center justify-end"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <AnimatePresence>
        {isHovered ? (
          <motion.div
            initial={{ width: collapsedWidth, opacity: 0 }}
            animate={{ width: expandedWidth, opacity: 1 }}
            exit={{ width: collapsedWidth, opacity: 0 }}
            className="bg-background flex items-center justify-between gap-1 overflow-clip rounded-md p-1 shadow-sm"
          >
            {onDelete && (
              <IconButton
                icon={<Trash2 className="size-4" />}
                label={texts?.delete || "delete"}
                className="h-7 w-7"
                onClick={onDelete}
              />
            )}
            {onEdit && (
              <IconButton
                icon={<Edit className="size-4" />}
                label={texts?.edit || "edit"}
                className="h-7 w-7"
                onClick={onEdit}
              />
            )}
            {onDuplicate && (
              <IconButton
                icon={<Copy className="size-4" />}
                label={texts?.duplicate || "duplicate"}
                className="h-7 w-7"
                onClick={onDuplicate}
              />
            )}
            {/* {onView && (
              <IconButton
                icon={<Eye className="size-4" />}
                label={texts?.view || "view"}
                className="h-7 w-7"
                onClick={onView}
            />
            )}
            {onArchive && (
              <IconButton
                icon={<Archive className="size-4" />}
                label={texts?.archive || "archive"}
                className="h-7 w-7"
                onClick={onArchive}
              />
            )} */}
            {onPreview && (
              <IconButton
                icon={<Eye className="size-4" />}
                label={texts?.preview || "preview"}
                className="h-7 w-7"
                onClick={onPreview}
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ width: collapsedWidth, opacity: 1 }}
            animate={{ width: collapsedWidth, opacity: 1 }}
            exit={{ width: collapsedWidth, opacity: 0 }}
            className="bg-background mt-0.5 flex items-center justify-between gap-1 overflow-clip p-1"
          >
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreHorizontal className="size-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RowActions;
