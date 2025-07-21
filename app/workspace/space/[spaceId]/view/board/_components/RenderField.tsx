import { ComboBox } from "@/components/ui/ComboBox";
import { DatePicker } from "@/components/ui/DatePicker";
import { MultiSelect } from "@/components/ui/MultiSelect";

export function renderField(item: any, formControl: any, taskId: string) {
  switch (item.inputType) {
    case "multiselect":
      return (
        <MultiSelect
          id={item.name + taskId}
          formControl={formControl}
          name={item.name}
          options={item.options}
          icon={item.icon}
          className={item.classNames}
        />
      );
    case "combobox":
      return (
        <ComboBox
          id={item.name + taskId}
          formControl={formControl}
          name={item.name}
          options={item.options}
          icon={item.icon}
          className={item.classNames}
        />
      );
    case "datepicker":
      return (
        <DatePicker
          id={item.name + taskId}
          formController={formControl}
          name={item.name}
          className={item.classNames}
        />
      );

    default:
      return null;
  }
}
