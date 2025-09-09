import { createBrowserRouter } from "react-router-dom";

// Import all the pages needed for the employee flow
import LoginPage from "./pages/Login";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import CreateReportPage from "./pages/CreateReportPage";
import ReportDetailPage from "./pages/ReportDetailPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <LoginPage />,
    },
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/dashboard",
        // Note: I'm using EmployeeDashboard to match the component we created.
        // You can rename your DashboardPage.jsx file to EmployeeDashboard.jsx.
        element: <EmployeeDashboard />,
    },
    {
        // Route for the report creation form
        path: "/create-report",
        element: <CreateReportPage />,
    },
    {
        // Dynamic route for viewing a single report's details.
        // The ':reportId' part is a placeholder for the actual ID.
        path: "/report/:reportId",
        element: <ReportDetailPage />,
    }
]);

export default router;