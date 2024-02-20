import { Icon56ErrorOutline } from "@vkontakte/icons";
import { Group, Panel, Placeholder, View } from "@vkontakte/vkui";
import { AdaptivePanelHeader } from "../helpers/adaptivePanelHeader";

export const InvalidDataError = () => {
  return (
    <View activePanel="main">
      <Panel id="main">
        <AdaptivePanelHeader />
        <Group>
          <Placeholder icon={<Icon56ErrorOutline />}>
            К сожалению, произошла ошибка
          </Placeholder>
        </Group>
      </Panel>
    </View>
  );
};
