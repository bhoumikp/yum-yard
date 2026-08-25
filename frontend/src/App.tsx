import { Route, Routes } from "react-router";
import Preview from "./pages/Preview";
import AppLayout from "./layouts/AppLayout";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="preview" element={<Preview />} />
      </Route>
    </Routes>
  );
}

export default App;