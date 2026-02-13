import "./app.css";
import { GlobalCharacterDock } from "../canvas/GlobalCharacterDock";
import { Stack } from "../navigation/stackflow";

export default function App() {
  return (
    <>
      <GlobalCharacterDock />
      <Stack />
    </>
  );
}
