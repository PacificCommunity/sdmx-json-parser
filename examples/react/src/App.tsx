import SingleLine from "./components/SingleLine";
import MultiLine from "./components/MultiLine";
import Column from "./components/Column";
import MultiColumn from "./components/MultiColumn";
import Pie from "./components/Pie";
import Lollipop from "./components/lollipop";
import Pyramid from "./components/Pyramid"

import { Tabs } from "antd";
import "./App.css";

function App() {
  return (
    <Tabs tabBarStyle={{
      display: "flex",
      justifyContent: "space-between"
    }} defaultActiveKey="1" items={[{
      key: "1",
      label: "Single Line",
      children: <SingleLine />
    }, {
      key: "2",
      label: "Multi Line",
      children: <MultiLine />
    }, {
      key: "3",
      label: "Single Column",
      children: <Column />
    }, {
      key: "4",
      label: "Multi Column",
      children: <MultiColumn />
    }, {
      key: "5",
      label: "Pie",
      children: <Pie />
    }, {
      key: "6",
      label: "Lollipop",
      children: <Lollipop />
    }, {
      key: "7",
      label: "Pyramid",
      children: <Pyramid />
    }]} />
  );
}

export default App
