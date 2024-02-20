import { Icon56ErrorOutline } from "@vkontakte/icons";
import { Group, Link, Panel, Placeholder, View } from "@vkontakte/vkui";
import { AdaptivePanelHeader } from "../helpers/adaptivePanelHeader";

export const NotAuthorizedError = () => {
  return (
    <View activePanel="main">
      <Panel id="main">
        <AdaptivePanelHeader />
        <Group>
          <Placeholder icon={<Icon56ErrorOutline />}>
            Для доступа к этому разделу необходимо{" "}
            <Link href={"/"}>авторизоваться</Link>
          </Placeholder>
        </Group>
      </Panel>
    </View>
  );
};
