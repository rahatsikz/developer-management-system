import { ComboBox } from "@/components/ui/ComboBox";
import { DatePicker } from "@/components/ui/DatePicker";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { getUserOptions } from "../../_components/add-task-dialog";
import { useGetSpaceById } from "@/api/space.query";
import { useParams } from "next/navigation";

export function renderField(
  item: any,
  formControl: any,
  taskId: string,
  mutateField: (key: any) => void
) {
  switch (item.inputType) {
    case "multiselect":
      return (
        <AssigneeCell
          formControl={formControl}
          item={item}
          taskId={taskId}
          mutateField={mutateField}
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
          onBlur={() => mutateField(item.name)}
        />
      );
    case "datepicker":
      return (
        <DatePicker
          id={item.name + taskId}
          formController={formControl}
          name={item.name}
          className={item.classNames}
          onBlur={() => mutateField(item.name)}
        />
      );

    default:
      return null;
  }
}

const AssigneeCell = ({
  formControl,
  item,
  taskId,
  mutateField,
}: {
  formControl: any;
  item: any;
  taskId: string;
  mutateField: (key: any) => void;
}) => {
  const { spaceId } = useParams();
  const { data, isLoading } = useGetSpaceById(spaceId as string);
  if (isLoading) {
    return null;
  }
  return (
    <MultiSelect
      formControl={formControl}
      name='assignees'
      options={getUserOptions(data?.members || [])}
      id={item.name + taskId}
      icon={item.icon}
      className={item.classNames}
      onBlur={() => mutateField(item.name)}
    />
  );
};
