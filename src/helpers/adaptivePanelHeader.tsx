import { PanelHeader, useAdaptivityConditionalRender } from "@vkontakte/vkui";
import { NavLink } from "react-router-dom";

export const AdaptivePanelHeader = () => {
  const { viewWidth } = useAdaptivityConditionalRender();

  return (
    <PanelHeader>
      {viewWidth.tabletMinus && (
        <div className={viewWidth.tabletMinus.className}>
          <NavLink
            to={"/"}
            style={{
              textDecoration: "none",
              color: "dark",
            }}
          >
            🍍 nng admin
          </NavLink>
        </div>
      )}
    </PanelHeader>
  );
};
