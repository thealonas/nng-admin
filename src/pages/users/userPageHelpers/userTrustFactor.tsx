import {
  Icon28AttachOutline,
  Icon28BugOutline,
  Icon28Camera,
  Icon28CheckCircleOutline,
  Icon28CrossLargeOutline,
  Icon28Crown,
  Icon28Favorite,
  Icon28Hand,
  Icon28IncognitoOutline,
  Icon28MoneySendOutline,
  Icon28PencilSquare,
  Icon28Profile,
  Icon28RefreshOutline,
  Icon28UserBackgroundOutline,
  Icon28UserCardOutline,
  Icon28Users,
  Icon28WarningTriangleOutline,
} from "@vkontakte/icons";
import {
  Accordion,
  Banner,
  FormItem,
  Group,
  Header,
  InfoRow,
  Progress,
  Separator,
  SimpleCell,
  Spacing,
  Spinner,
} from "@vkontakte/vkui";
import React, { useEffect, useState } from "react";
import { TrustInfo, User } from "../../../api/categories/usersCategory";

type UserTrustFactorProps = {
  userNngData: User | undefined;
  trustFetching: boolean;
  recalculateTrust: () => void;
};

export const UserTrustFactor = (props: UserTrustFactorProps) => {
  const [trust, setTrust] = useState(0);
  const [toxicity, setToxicity] = useState(0);

  useEffect(() => {
    setTrust(props.userNngData?.trustInfo.trust ?? 0);
    setToxicity((props.userNngData?.trustInfo.toxicity ?? 0) * 100);
  }, [props.userNngData]);

  const trustAppereance =
    trust <= 10 ? "negative" : trust <= 80 ? undefined : "positive";

  const trustName =
    trust <= 10
      ? "☹️"
      : trust < 20
        ? "Низкий"
        : trust <= 70
          ? "Средний"
          : "Высокий";

  const toxicityAppearance =
    toxicity <= 30 ? "positive" : toxicity <= 60 ? undefined : "negative";

  const toxicityName =
    toxicity <= 30
      ? "Низкая"
      : toxicity <= 60
        ? "Средняя"
        : toxicity <= 80
          ? "Высокая"
          : "🤬";

  const trustElements = [];

  const positiveIcon = (icon: React.JSX.Element) => {
    return <div>{icon}</div>;
  };

  const negativeIcon = (icon: React.JSX.Element) => {
    return (
      <div
        style={{
          color: "red",
        }}
      >
        {icon}
      </div>
    );
  };

  const trustInfo = props.userNngData?.trustInfo ?? new TrustInfo();

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(new Date().getMonth() - 6);

  const isYoungAccount =
    props.userNngData?.trustInfo.registrationDate != null &&
    props.userNngData?.trustInfo.registrationDate > sixMonthsAgo;

  if (props.userNngData?.admin) {
    trustElements.push(
      <SimpleCell
        key="admin"
        before={positiveIcon(<Icon28Crown />)}
        indicator="+100"
      >
        Администратор
      </SimpleCell>,
    );
  }

  if (trustInfo.verified) {
    trustElements.push(
      <SimpleCell
        key="verified"
        before={positiveIcon(<Icon28CheckCircleOutline />)}
        indicator="+25"
      >
        Верификация
      </SimpleCell>,
    );
  }

  if (trustInfo.activism) {
    trustElements.push(
      <SimpleCell
        key="activism"
        before={positiveIcon(<Icon28Favorite />)}
        indicator="+40"
      >
        Благодарность
      </SimpleCell>,
    );
  }

  if (trustInfo.hadViolation) {
    trustElements.push(
      <SimpleCell
        key="hadViolation"
        before={negativeIcon(<Icon28AttachOutline />)}
        indicator="-5"
      >
        История нарушений
      </SimpleCell>,
    );
  }

  if (trustInfo.hasViolation) {
    trustElements.push(
      <SimpleCell
        key="hasViolation"
        before={negativeIcon(<Icon28CrossLargeOutline />)}
        indicator="-100"
      >
        Активное нарушение
      </SimpleCell>,
    );
  }

  if (trustInfo.hadWarning) {
    trustElements.push(
      <SimpleCell
        key="hadWarnings"
        before={negativeIcon(<Icon28WarningTriangleOutline />)}
        indicator="-5"
      >
        История предупреждений
      </SimpleCell>,
    );
  }

  if (trustInfo.hasWarning) {
    trustElements.push(
      <SimpleCell
        key="hasWarnings"
        before={negativeIcon(<Icon28WarningTriangleOutline />)}
        indicator="-10"
      >
        Активное предупреждение
      </SimpleCell>,
    );
  }

  if (trustInfo.donate) {
    trustElements.push(
      <SimpleCell
        key="donate"
        before={positiveIcon(<Icon28MoneySendOutline />)}
        indicator="+10"
      >
        Донат
      </SimpleCell>,
    );
  }

  if (trustInfo.oddGroups) {
    trustElements.push(
      <SimpleCell
        key="og"
        before={negativeIcon(<Icon28IncognitoOutline />)}
        indicator="-15"
      >
        Сомнительные группы
      </SimpleCell>,
    );
  }

  if (trustInfo.closedProfile) {
    trustElements.push(
      <SimpleCell key="cp" before={negativeIcon(<Icon28Hand />)} indicator="-7">
        Закрытый профиль
      </SimpleCell>,
    );
  }

  if (isYoungAccount) {
    trustElements.push(
      <SimpleCell
        key="ya"
        before={negativeIcon(<Icon28UserCardOutline />)}
        indicator="-10"
      >
        Новый аккаунт
      </SimpleCell>,
    );
  }

  if (trustInfo.hasPhoto) {
    trustElements.push(
      <SimpleCell
        key="hp"
        before={positiveIcon(<Icon28Camera />)}
        indicator="+3"
      >
        Аватарка
      </SimpleCell>,
    );
  }

  if (trustInfo.hasWallPosts) {
    trustElements.push(
      <SimpleCell
        key="wall"
        before={positiveIcon(<Icon28PencilSquare />)}
        indicator="+3"
      >
        Более 5 постов
      </SimpleCell>,
    );
  }

  if (trustInfo.hasFriends) {
    trustElements.push(
      <SimpleCell
        key="friends"
        before={positiveIcon(<Icon28Users />)}
        indicator="+3"
      >
        Более 15 друзей
      </SimpleCell>,
    );
  }

  if (trustInfo.joinedTestGroup) {
    trustElements.push(
      <SimpleCell
        key="testGroup"
        before={positiveIcon(<Icon28BugOutline />)}
        indicator="+10"
      >
        nng β
      </SimpleCell>,
    );
  }

  if (trustInfo.joinedMainGroup) {
    trustElements.push(
      <SimpleCell
        key="mainGroup"
        before={positiveIcon(<Icon28Profile />)}
        indicator="+3"
      >
        Состоит в основной группе
      </SimpleCell>,
    );
  }

  if (trustInfo.usedNng) {
    trustElements.push(
      <SimpleCell
        key="used"
        before={positiveIcon(<Icon28UserBackgroundOutline />)}
        indicator="+3"
      >
        Активное использование
      </SimpleCell>,
    );
  }

  if (props.userNngData == null) {
    return (
      <Group header={<Header>Траст фактор</Header>}>
        <Spinner />
      </Group>
    );
  }
  return (
    <Group header={<Header>Траст фактор</Header>}>
      {props.trustFetching ? (
        <Banner
          mode="image"
          background={
            <div
              style={{
                backgroundColor: "#65c063",
                backgroundImage:
                  "url(https://sun9-59.userapi.com/7J6qHkTa_P8VKRTO5gkh6MizcCEefz04Y0gDmA/y6dSjdtPU4U.jpg)",
                backgroundPosition: "right bottom",
                backgroundSize: 320,
                backgroundRepeat: "no-repeat",
              }}
            ></div>
          }
          before={<Spinner />}
          header="Траст фактор обновляется"
        />
      ) : undefined}
      <FormItem
        key="trust"
        id="trust"
        top="Уровень"
        bottom={`${trustName} (${trust})`}
        topComponent="h5"
      >
        <Progress appearance={trustAppereance} value={trust} />
      </FormItem>
      <FormItem
        key="toxicity"
        id="toxicity"
        top="Токсичность"
        bottom={`${toxicityName} (${toxicity.toFixed(0)})`}
        topComponent="h5"
      >
        <Progress appearance={toxicityAppearance} value={toxicity} />
      </FormItem>
      <SimpleCell
        key="recalculate"
        before={<Icon28RefreshOutline />}
        disabled={props.trustFetching}
        onClick={props.recalculateTrust}
      >
        Пересчитать
      </SimpleCell>
      <SimpleCell key="joinDate">
        <InfoRow header="Дата вступления в nng">
          {props.userNngData?.trustInfo.nngJoinDate.toLocaleDateString("ru-RU")}
        </InfoRow>
      </SimpleCell>
      {props.userNngData?.trustInfo.registrationDate ? (
        <SimpleCell key="registrationDate">
          <InfoRow header="Дата регистрации">
            {props.userNngData?.trustInfo.registrationDate.toLocaleDateString(
              "ru-RU",
            )}
          </InfoRow>
        </SimpleCell>
      ) : undefined}
      <Spacing size={12}>
        <Separator />
      </Spacing>
      <Accordion>
        <Accordion.Summary iconPosition="before">Факторы</Accordion.Summary>
        <Accordion.Content>{trustElements}</Accordion.Content>
      </Accordion>
    </Group>
  );
};
