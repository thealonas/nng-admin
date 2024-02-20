import { CustomSelect, CustomSelectOption } from "@vkontakte/vkui";
import { Group } from "../api/categories/groupsCategory";

type GroupsSelectProps = {
  allGroups: Group[];
  placeholder: string | undefined;
  setGroup: (id: number) => void;
};

export const GroupsSelect = (props: GroupsSelectProps) => {
  const options = () => {
    return props.allGroups.map(({ ...group }) => {
      return {
        ...group,
        label: `@${group.screenName}`,
        value: group.groupId,
      };
    });
  };

  return (
    <CustomSelect
      placeholder={props.placeholder ? props.placeholder : "Не выбрана"}
      options={options()}
      searchable
      onChange={(e) => {
        props.setGroup(parseInt(e.target.value));
      }}
      renderOption={({ option, ...restProps }) => (
        <CustomSelectOption {...restProps} description={option.groupId} />
      )}
    />
  );
};
