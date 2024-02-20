import { Avatar, Div, Text, Title } from "@vkontakte/vkui";
import { CenteredData } from "./centeredData";

type IdentityCardProps = {
  upper?: string;
  title: string;
  subtitle?: React.ReactNode;
  avatar?: string;
  titleBadge?: React.ReactNode;
  children?: React.ReactNode;
  avatarSize?: number;
};

export const IdentityCard = (props: IdentityCardProps) => {
  const divStyles: Record<any, any> = {
    display: "flex",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 20,
  };

  const secondaryTextStyles: Record<any, any> = {
    marginBottom: 24,
    color: "var(--vkui--color_text_secondary)",
  };

  const childrenStyles: Record<any, any> = {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "column",
    gap: 12,
  };

  return (
    <CenteredData paddingTop={16}>
      {props.upper && <Text style={secondaryTextStyles}>{props.upper}</Text>}
      <Avatar size={props.avatarSize ?? 96} src={props.avatar} />
      <Div style={divStyles}>
        <Title level="2" weight="2">
          {props.title}
        </Title>
        {props.titleBadge}
      </Div>
      {props.subtitle && (
        <Text style={secondaryTextStyles}>{props.subtitle}</Text>
      )}
      {props.children && <Div style={childrenStyles}>{props.children}</Div>}
    </CenteredData>
  );
};
