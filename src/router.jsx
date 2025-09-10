import { createBrowserRouter } from "react-router-dom";

// Import all the pages needed for the employee flow
import LoginPage from "./pages/Login";
import EmployeeDashboard from "./pages/Karyawan/EmployeeDashboard";
import CreateReportPage from "./pages/Karyawan/CreateReportPage";
import ReportDetailPage from "./pages/Karyawan/ReportDetailPage";
import TeknisiDashboard from "./pages/Teknisi/TeknisiDashboard";

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
    }
]);

export default router;