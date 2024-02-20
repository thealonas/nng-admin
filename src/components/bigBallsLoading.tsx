import { Group, Panel, Placeholder, Spinner, View } from "@vkontakte/vkui";
import { AdaptivePanelHeader } from "../helpers/adaptivePanelHeader";

export const BigBallsLoading = () => {
  return (
    <View activePanel="main">
      <Panel id="main">
        <AdaptivePanelHeader />
        <Group>
          <Placeholder>
            <Spinner />
          </Placeholder>
        </Group>
      </Panel>
    </View>
  );
};
