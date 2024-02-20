import {
  Button,
  ButtonGroup,
  Checkbox,
  DatePicker,
  FormItem,
  Group,
  Input,
  SegmentedControl,
  Select,
} from "@vkontakte/vkui";
import { useCallback, useEffect, useState } from "react";
import { Group as NngGroup } from "../../../api/categories/groupsCategory";
import {
  BanPriority,
  User,
  Violation,
  ViolationType,
} from "../../../api/categories/usersCategory";
import { GroupsSelect } from "../../../helpers/groupsSelect";
import { useNngApiStore } from "../../../store/apiStore";

type UserAddViolationProps = {
  userId: number;
  setUser: (user: User) => void;
  cancel: () => void;
};

export const UserAddViolation = (props: UserAddViolationProps) => {
  const apiStore = useNngApiStore();

  const [allGroups, setAllGroups] = useState<NngGroup[]>([]);
  const [selectedViolation, setSelectedViolation] = useState("warn");

  const [active, setActive] = useState(true);
  const [priority, setPriority] = useState<string | null>(null);
  const [complaint, setComplaint] = useState<string | null>(null);
  const [group, setGroup] = useState<number>(NaN);

  const [buttonLoading, setButtonLoading] = useState(false);

  const getTodayDate = () => {
    const date = new Date();
    return {
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    };
  };

  const vkDateToDate = (date: Record<any, any>): Date => {
    return new Date(date.year, date.month, date.day);
  };

  const [date, setDate] = useState(getTodayDate());

  const complaintValid = () => {
    if (priority !== "teal") {
      return true;
    }

    return !isNaN(Number(complaint));
  };

  const fetchGroups = useCallback(async () => {
    const groups = await apiStore.nngApi.groups.getGroups();
    setAllGroups(groups);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchGroups().then();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groupInputValid = !isNaN(group);

  const priorityValid = () => {
    if (selectedViolation === "warn") {
      return priority === "green" || priority === "teal";
    }

    return true;
  };

  const submit = async () => {
    setButtonLoading(true);

    const violation: Violation = new Violation();

    violation.type =
      selectedViolation === "warn"
        ? ViolationType.warned
        : ViolationType.banned;

    violation.groupId = group;

    switch (priority) {
      case "green":
        violation.priority = BanPriority.green;
        break;
      case "teal":
        violation.priority = BanPriority.teal;
        break;
      case "orange":
        violation.priority = BanPriority.orange;
        break;
      case "red":
        violation.priority = BanPriority.red;
        break;
      default:
        throw new Error("priority doesn't exist");
    }

    if (priority === "teal" && complaint) {
      violation.complaint = parseInt(complaint);
    } else {
      violation.complaint = null;
    }

    if (selectedViolation !== "warn" && active != null) {
      violation.active = active;
    } else {
      violation.active = null;
    }

    violation.date = vkDateToDate(date);

    try {
      await apiStore.nngApi.users.addViolation(props.userId, violation);
      const newUser = await apiStore.nngApi.users.getUser(props.userId);
      props.setUser(newUser);
      props.cancel();
    } catch (e) {
      console.log(e);
      props.cancel();
    }
  };

  const canSubmit = groupInputValid && priorityValid() && complaintValid();

  return (
    <Group key="add-violation">
      <form>
        <FormItem top={"Тип нарушения"} topComponent="h5">
          <SegmentedControl
            defaultValue={"warn"}
            options={[
              { label: "Предупреждение", value: "warn" },
              { label: "Блокировка", value: "ban" },
            ]}
            onChange={(e) => {
              setSelectedViolation(e?.toString() ?? "warn");
            }}
          ></SegmentedControl>
        </FormItem>

        <FormItem
          top={"Группа, в которой произошло нарушение"}
          bottom={!groupInputValid ? "Выберите группу из списка" : null}
          status={!groupInputValid ? "error" : undefined}
          topComponent="h5"
        >
          <GroupsSelect
            setGroup={setGroup}
            allGroups={allGroups}
            placeholder={undefined}
          ></GroupsSelect>
        </FormItem>

        <FormItem
          top={"Приоритет"}
          status={priorityValid() ? undefined : "error"}
          bottom={
            selectedViolation === "warn" && !priorityValid()
              ? "Приоритет у предупреждения должен быть либо зеленый, либо бирюзовый"
              : ""
          }
          topComponent="h5"
        >
          <Select
            onChange={(e) => {
              setPriority(e.target.value);
            }}
            placeholder="Выберите приоритет"
            options={[
              {
                value: "green",
                label: "Зеленый",
              },
              {
                value: "teal",
                label: "Бирюзовый",
              },
              {
                value: "orange",
                label: "Оранжевый",
              },
              {
                value: "red",
                label: "Красный",
              },
            ]}
          />
        </FormItem>

        {priority === "teal" && (
          <FormItem
            top="Жалоба от"
            status={complaintValid() ? undefined : "error"}
            bottom={complaintValid() ? "" : "Айди должен быть числом"}
            topComponent="h5"
          >
            <Input
              id={"group-id"}
              type={"text"}
              placeholder={"123456789"}
              onChange={(e) => setComplaint(e.target.value)}
            />
          </FormItem>
        )}

        <FormItem top={"Дата нарушения"} topComponent="h5">
          <DatePicker
            onDateChange={(e) => {
              setDate(e);
            }}
            min={{ day: 1, month: 1, year: 2017 }}
            max={{ day: 1, month: 1, year: 2040 }}
            defaultValue={getTodayDate()}
            dayPlaceholder="День"
            monthPlaceholder="Месяц"
            yearPlaceholder="Год"
          />
        </FormItem>

        {selectedViolation !== "warn" && (
          <FormItem>
            <Checkbox
              defaultChecked
              onChange={(e) => {
                setActive(e.target.checked);
              }}
            >
              Активная блокировка
            </Checkbox>
          </FormItem>
        )}

        <FormItem>
          <ButtonGroup mode="horizontal" stretched gap="m">
            <Button
              mode="secondary"
              appearance="negative"
              stretched
              onClick={props.cancel}
            >
              Отмена
            </Button>
            <Button
              mode="secondary"
              appearance="positive"
              disabled={!canSubmit}
              loading={buttonLoading}
              stretched
              onClick={submit}
            >
              Добавить нарушение
            </Button>
          </ButtonGroup>
        </FormItem>
      </form>
    </Group>
  );
};
