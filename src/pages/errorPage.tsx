import { Panel, Placeholder, View } from "@vkontakte/vkui";
import { NavLink, isRouteErrorResponse, useRouteError } from "react-router-dom";
import { AdaptivePanelHeader } from "../helpers/adaptivePanelHeader";

export const ErrorPage = () => {
  const error = useRouteError();
  console.log(error);

  const buffer = [];

  if (isRouteErrorResponse(error)) {
    buffer.push(
      <Placeholder key={"pl"} header={`🐊 ${error.status}`}>
        Может{" "}
        <NavLink
          style={{ textDecoration: "green wavy underline" }}
          key={"navlink"}
          to={"/"}
        >
          вернёмся домой
        </NavLink>
        ?
      </Placeholder>
    );
  } else {
    buffer.push(
      <Placeholder key={"pl"} header={"У нас что-то поломалось"}>
        Может{" "}
        <NavLink
          style={{ textDecoration: "green wavy underline" }}
          key={"navlink"}
          to={"/"}
        >
          вернёмся домой
        </NavLink>
        ?
      </Placeholder>
    );
  }

  return (
    <View activePanel="main">
      <Panel id="main">
        <AdaptivePanelHeader />
        {buffer}
      </Panel>
    </View>
  );
};
