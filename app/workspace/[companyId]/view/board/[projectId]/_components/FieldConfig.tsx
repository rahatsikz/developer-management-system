import { dummyAssigne, priorityOptions, statusOptions } from "@/data";
import { Flag, User } from "lucide-react";

export const formConfig = [
  {
    inputType: "multiselect",
    name: "assignee",
    label: "Assignee",
    options: dummyAssigne,
    icon: <User />,
    classNames: "px-2.5 py-2",
  },
  {
    inputType: "combobox",
    name: "priority",
    label: "Priority",
    options: priorityOptions,
    icon: <Flag />,
    classNames: "px-2.5 py-2",
  },
  {
    inputType: "datepicker",
    name: "dueDate",
    label: "Due Date",
    options: [],
    icon: <></>,
    classNames: "px-2.5 py-2",
  },
  {
    inputType: "combobox",
    name: "status",
    label: "Status",
    options: statusOptions,
    icon: <></>,
    classNames: "px-2.5 py-2",
  },
];
