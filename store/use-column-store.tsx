import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Column = {
  id: string;
  name: string;
  label: string;
  checked: boolean;
};

type ColumnsStore = {
  ColumnArr: Column[];
  toggleColumn: (columnName: string) => void;
  setColumns: (columns: Column[]) => void;
};

export const useColumnStore = create<ColumnsStore>()(
  persist(
    (set, get) => ({
      ColumnArr: [
        { id: "0", name: "id", label: "id", checked: true },
        { id: "1", name: "name", label: "Name", checked: true },
        { id: "2", name: "assignee", label: "Assignee", checked: true },
        { id: "3", name: "dueDate", label: "Due Date", checked: true },
        { id: "4", name: "priority", label: "Priority", checked: true },
        { id: "5", name: "status", label: "Status", checked: true },
        { id: "6", name: "comments", label: "Comments", checked: false },
      ],

      toggleColumn: (columnName) => {
        const updated = get().ColumnArr.map((col) =>
          col.name === columnName ? { ...col, checked: !col.checked } : col
        );
        set({ ColumnArr: updated });
      },

      setColumns: (columns) => {
        set({ ColumnArr: columns });
      },
    }),
    {
      name: "column-store",
      partialize: (state) => ({ ColumnArr: state.ColumnArr }),
    }
  )
);
