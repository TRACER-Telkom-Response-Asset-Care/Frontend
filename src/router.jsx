import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/login";
import EmployeeDashboard from "./pages/Pegawai/EmployeeDashboard";
import CreateReportPage from "./pages/Pegawai/CreateReportPage";
import ReportDetailPage from "./pages/Pegawai/ReportDetailPage";
import TeknisiDashboard from "./pages/Teknisi/TeknisiDashboard";
import SuperAdminDashboard from "./pages/Superadmin/SuperadminDashboard";
import AssetManagementPage from "./pages/AssetManagementPage";
import AssetForm from "./pages/AssetForm";
import AssetTypeManagementPage from "./pages/AssetTypeManagementPage";
import UserManagementPage from "./pages/Superadmin/UserManagementPage";
import UserForm from "./pages/Superadmin/UserForm";
import AssetDetailPage from "./pages/AssetDetailPage";

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
                path: "/pegawaidashboard",
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
                path: "/assets/:id",
                element: <AssetDetailPage />,
            },
            {
                path: "/assets/new",
                element: <AssetForm />,
            },
            {
                path: "/assets/edit/:id",
                element: <AssetForm />,
            },
            {
                path: "/asset-types",
                element: <AssetTypeManagementPage />,
            },
            {
                path: "/superadmindashboard",
                element: <SuperAdminDashboard />,
            },
            {
                path: "/users",
                element: <UserManagementPage />,
            },
            {
                path: "/users/new",
                element: <UserForm />,
            },
            {
                path: "/users/edit/:id",
                element: <UserForm />,
            },
        ]
    }
]);

export default router;