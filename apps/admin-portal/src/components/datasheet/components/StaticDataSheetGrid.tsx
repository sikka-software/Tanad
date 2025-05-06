// ON HOLD
import { useState } from "react";
import React from "react";

import { DataSheetGridProps, DataSheetGridRef } from "../types";
import { DataSheetGrid } from "./DataSheetGrid";

export const StaticDataSheetGrid = React.forwardRef<DataSheetGridRef, DataSheetGridProps<any>>(
  <T extends any>(
    {
      columns,
      gutterColumn,
      stickyRightColumn,
      addRowsComponent,
      createRow,
      duplicateRow,
      style,
      rowKey,
      onFocus,
      onBlur,
      onActiveCellChange,
      onSelectionChange,
      rowClassName,
      rowHeight,
      ...rest
    }: DataSheetGridProps<T>,
    ref: React.ForwardedRef<DataSheetGridRef>,
  ) => {
    const [staticProps] = useState({
      columns,
      gutterColumn,
      stickyRightColumn,
      addRowsComponent,
      createRow,
      duplicateRow,
      style,
      rowKey,
      onFocus,
      onBlur,
      onActiveCellChange,
      onSelectionChange,
      rowClassName,
      rowHeight,
    });

    return (
      <DataSheetGrid
        {...staticProps}
        {...rest}
        rowHeight={typeof rowHeight === "number" ? rowHeight : staticProps.rowHeight}
        ref={ref}
      />
    );
  },
) as <T extends any>(
  props: DataSheetGridProps<T> & { ref?: React.ForwardedRef<DataSheetGridRef> },
) => React.ReactNode;
