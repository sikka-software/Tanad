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
  texts?: {
    edit?: string;
    duplicate?: string;
    view?: string;
    archive?: string;
    delete?: string;
  };
}
const RowActions = ({
  onEdit,
  onDuplicate,
  onView,
  onArchive,
  onDelete,
  texts,
}: RowActionsProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const expandedWidth = 100;
  const collapsedWidth = 32;
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
            <IconButton
              icon={<Trash2 className="size-4" />}
              label={texts?.delete || "delete"}
              className="h-7 w-7"
              onClick={onDelete}
            />
            <IconButton
              icon={<Edit className="size-4" />}
              label={texts?.edit || "edit"}
              className="h-7 w-7"
              onClick={onEdit}
            />
            <IconButton
              icon={<Copy className="size-4" />}
              label={texts?.duplicate || "duplicate"}
              className="h-7 w-7"
              onClick={onDuplicate}
            />
            {/* <IconButton
              icon={<Eye className="size-4" />}
              label={texts?.view || "view"}
              className="h-7 w-7"
              onClick={onView}
            />
            <IconButton
              icon={<Archive className="size-4" />}
              label={texts?.archive || "archive"}
              className="h-7 w-7"
              onClick={onArchive}
            /> */}
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
