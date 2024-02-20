import { Div } from "@vkontakte/vkui";

export type CenteredDataProps = {
  children: React.ReactNode;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
};

export const CenteredData = (props: CenteredDataProps) => {
  const styles: Record<any, any> = {
    margin: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    paddingTop: props.paddingTop ?? 32,
    paddingLeft: props.paddingLeft ?? 32,
    paddingRight: props.paddingRight ?? 32,
    paddingBottom: props.paddingBottom ?? 0,
  };

  return <Div style={styles}>{props.children}</Div>;
};
