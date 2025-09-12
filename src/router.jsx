import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/login";
import EmployeeDashboard from "./pages/Karyawan/EmployeeDashboard";
import CreateReportPage from "./pages/Karyawan/CreateReportPage";
import ReportDetailPage from "./pages/Karyawan/ReportDetailPage";
import TeknisiDashboard from "./pages/Teknisi/TeknisiDashboard";
import AssetManagementPage from "./pages/Superadmin/AssetManagementPage";
import AssetForm from "./pages/Superadmin/AssetForm";

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
        path: "/logout",
        element: <LoginPage />,
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: "/karyawandashboard",
                element: <EmployeeDashboard />,
            },
            {
                path: "/create-report",
                element: <CreateReportPage />,
            },
            {
                path: "/report/:reportId",
                element: <ReportDetailPage />,
            },
            {
                path: "/teknisidashboard",
                element: <TeknisiDashboard />,
            },
            {
                path: "/assets",
                element: <AssetManagementPage />,
            },
            {
                path: "/assets/new",
                element: <AssetForm />,
            },
            {
                path: "/assets/edit/:id",
                element: <AssetForm />,
            }
        ]
    }
]);

export default router;