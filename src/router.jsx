import { createBrowserRouter } from "react-router-dom";

import LoginPage from "./pages/login";
import DashboardPage from "./pages/dashboard";

const router = createBrowserRouter([
    {
        path: "/",
        element: <LoginPage />,
    },

]);

export default router;