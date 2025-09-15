import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "@/apiClient";
import { useAuth } from "@/context/AuthContext";

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
        <p className="ml-4 text-neutral-600">Memuat laporan...</p>
    </div>
);

const ErrorDisplay = ({ message }) => (
    <div className="text-center p-10 bg-red-50 rounded-2xl shadow-sm">
        <p className="font-semibold text-red-700">Terjadi Kesalahan</p>
        <p className="text-sm text-red-600 mt-1">{message}</p>
    </div>
);

const EmptyState = () => (
    <div className="text-center p-10 bg-white rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold text-neutral-800">Belum Ada Laporan</h3>
        <p className="mt-1 text-sm text-neutral-500">Sepertinya belum ada data laporan yang masuk.</p>
    </div>
);

const NoResults = () => (
    <div className="text-center p-10 bg-white rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold text-neutral-800">Laporan Tidak Ditemukan</h3>
        <p className="mt-1 text-sm text-neutral-500">Coba ubah kata kunci pencarian atau filter Anda.</p>
    </div>
);


const ReportTable = ({ reports }) => {
    const getStatusChip = (status) => {
        switch (status.toLowerCase()) {
            case "open": return "bg-blue-100 text-blue-800";
            case "in_progress": return "bg-yellow-100 text-yellow-800";
            case "closed": return "bg-green-100 text-green-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">ID Laporan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Aset</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Pelapor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Tanggal</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                        <th className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                    {reports.map((report) => (
                        <tr key={report.id} className="hover:bg-neutral-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">{report.report_code}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800 font-medium">{report.asset.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{report.user.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{new Date(report.created_at).toLocaleDateString("id-ID", { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`capitalize px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusChip(report.status)}`}>{report.status.replace("_", " ")}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link to={`/report/${report.id}`} className="text-red-600 hover:text-red-800 hover:underline">Lihat Detail</Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

function ReportsManagementPage() {
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const { user, logout, isInitializing } = useAuth();
    const navigate = useNavigate();

    const dashboardLink = useMemo(() => {
        const role = user?.roles?.[0]?.name;
        if (role === "superadmin") {
            return "/superadmindashboard";
        } else if (role === "teknisi") {
            return "/teknisidashboard";
        } else {
            return "/pegawaidashboard";
        }
    }, [user?.roles]);

    const fetchReports = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get("/api/reports");
            setReports(response.data);
        } catch (err) {
            setError("Gagal memuat data laporan. Silakan coba lagi nanti.");
            console.error("Failed to fetch reports:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isInitializing) {
            fetchReports();
        }
    }, [isInitializing]);
    
    const reportStatuses = useMemo(() => {
        const statuses = new Set(reports.map(report => report.status).filter(Boolean));
        return ["Semua Status", ...Array.from(statuses)];
    }, [reports]);

    const filteredReports = useMemo(() => {
        return reports.filter(report => {
            const searchTermLower = searchTerm.toLowerCase();
            const matchesSearch = searchTermLower === '' ||
                report.asset.name.toLowerCase().includes(searchTermLower) ||
                report.report_code.toLowerCase().includes(searchTermLower) ||
                report.user.name.toLowerCase().includes(searchTermLower);

            const matchesFilter = filterStatus === '' || filterStatus === "Semua Status" ||
                report.status === filterStatus;

            return matchesSearch && matchesFilter;
        });
    }, [reports, searchTerm, filterStatus]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const renderContent = () => {
        if (isLoading || isInitializing) {
            return <LoadingSpinner />;
        }
        if (error) {
            return <ErrorDisplay message={error} />;
        }
        if (reports.length === 0) {
            return <EmptyState />;
        }
        if (filteredReports.length === 0) {
            return <NoResults />;
        }
        return <ReportTable reports={filteredReports} />;
    };

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900">
            <header className="px-4 py-3 bg-white/80 backdrop-blur border-b border-neutral-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <img src="/TRACERLOGO.png" alt="Tracer Logo" className="size-9 object-contain" />
                        <div>
                            <h1 className="text-base font-semibold leading-tight">Manajemen Laporan</h1>
                            <p className="text-xs text-neutral-500">Selamat datang, {user?.name || "Pengguna"}!</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to={dashboardLink} className="text-sm font-medium text-neutral-700 hover:text-red-600">
                            Kembali ke Dasbor
                        </Link>
                        <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:underline">
                            Keluar
                        </button>
                    </div>
                </div>
            </header>
            <main className="max-w-6xl mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-neutral-800">Daftar Laporan Kerusakan</h2>
                </div>

                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Cari laporan (kode, nama aset, pelapor)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-grow p-2 border border-neutral-300 rounded-xl focus:ring-1 focus:ring-red-500 focus:border-red-500 shadow-sm transition"
                    />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="p-2 border border-neutral-300 rounded-xl focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white shadow-sm transition"
                        disabled={reports.length === 0}
                    >
                        {reportStatuses.map(status => (
                            <option key={status} value={status === "Semua Status" ? "" : status}>
                                {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
                            </option>
                        ))}
                    </select>
                </div>

                {renderContent()}
            </main>
        </div>
    );
}

export default ReportsManagementPage;