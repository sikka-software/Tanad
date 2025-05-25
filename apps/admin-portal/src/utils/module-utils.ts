// export const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
//   if (columnId === "id") return;
//   setData?.((data || []).map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
//   await updateBranch({ id: rowId, data: { [columnId]: value } });
// };

export const createHandleEdit = <T extends { id: string }, U>(
  setData: ((data: T[]) => void) | undefined,
  updateMutation: (args: { id: string; data: U }) => Promise<any> | void,
  currentTableData: T[] | undefined,
) => {
  return async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "id") return;

    if (setData) {
      const updatedData = (currentTableData || []).map((row) =>
        row.id === rowId ? { ...row, [columnId]: value } : row,
      );
      setData(updatedData);
    }

    await updateMutation({ id: rowId, data: { [columnId]: value } as U });
  };
};
