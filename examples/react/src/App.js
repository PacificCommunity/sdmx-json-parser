import SingleLine from "./components/SingleLine";
import MultiLine from "./components/MultiLine";
import Column from "./components/Column";
import MultiColumn from "./components/MultiColumn";
import Pie from "./components/Pie";
import Lollipop from "./components/lollipop";

import { Tabs } from "antd";
import Pyramid from "./components/Pyramid";

function App() {
  const { TabPane } = Tabs;
  return (
    <>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Single Line" key="1">
          <SingleLine />
        </TabPane>
        <TabPane tab="Multi Line" key="2">
          <MultiLine />
        </TabPane>
        <TabPane tab="Single Column" key="3">
          <Column />
        </TabPane>
        <TabPane tab="Multi Column" key="4">
          <MultiColumn />
        </TabPane>
        <TabPane tab="Pie" key="5">
          <Pie />
        </TabPane>
        <TabPane tab="Lollipop" key="6">
          <Lollipop />
        </TabPane>
        <TabPane tab="Pyramid" key="7">
          <Pyramid />
        </TabPane>
      </Tabs>
    </>
  );
}

export default App;
