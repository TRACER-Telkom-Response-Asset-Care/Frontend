import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "@/apiClient";
import { useAuth } from "@/context/AuthContext";

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
        <p className="ml-4 text-neutral-600">Memuat data...</p>
    </div>
);

const ErrorDisplay = ({ message }) => (
    <div className="text-center p-10 bg-red-50 rounded-2xl shadow-sm">
        <p className="font-semibold text-red-700">Terjadi Kesalahan</p>
        <p className="text-sm text-red-600 mt-1">{message}</p>
    </div>
);

const StatCard = ({ title, value, icon, color }) => (
    <div className={`bg-white p-5 rounded-2xl shadow-lg flex items-center gap-4 border-l-4 ${color}`}>
        <div className="text-3xl">{icon}</div>
        <div>
            <p className="text-sm font-medium text-neutral-500">{title}</p>
            <p className="text-2xl font-bold text-neutral-800">{value}</p>
        </div>
    </div>
);

const ReportList = ({ reports, title }) => (
    <div className="bg-white p-5 rounded-2xl shadow-lg">
        <h3 className="font-bold text-neutral-800 mb-4">{title}</h3>
        <ul className="space-y-3">
            {reports.length > 0 ? reports.map(report => (
                <li key={report.id} className="text-sm border-b border-neutral-100 pb-2">
                    <Link to={`/report/${report.id}`} className="hover:text-red-600">
                        <p className="font-medium text-neutral-700">{report.asset.name}</p>
                        <div className="flex justify-between items-center">
                            <p className="text-xs text-neutral-500">{report.report_code}</p>
                            <span className="text-xs font-semibold text-red-700">{report.status}</span>
                        </div>
                    </Link>
                </li>
            )) : <p className="text-sm text-neutral-500">Tidak ada laporan.</p>}
        </ul>
    </div>
);

function SuperAdminDashboard() {
    const { user, logout, isInitializing } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ users: 0, assets: 0, reportsOpen: 0, reportsInProgress: 0 });
    const [recentReports, setRecentReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isInitializing) return;

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [usersRes, assetsRes, reportsRes] = await Promise.all([
                    apiClient.get('/api/users'),
                    apiClient.get('/api/assets'),
                    apiClient.get('/api/reports')
                ]);

                const openReports = reportsRes.data.filter(r => r.status === 'open');
                const inProgressReports = reportsRes.data.filter(r => r.status === 'in_progress');

                setStats({
                    users: usersRes.data.length,
                    assets: assetsRes.data.length,
                    reportsOpen: openReports.length,
                    reportsInProgress: inProgressReports.length,
                });

                setRecentReports(reportsRes.data.slice(0, 5));

            } catch (err) {
                setError("Gagal memuat data dasbor. Silakan coba lagi nanti.");
                console.error("Dashboard fetch error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [isInitializing]);
    
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    
    const renderContent = () => {
        if (isLoading) return <LoadingSpinner />;
        if (error) return <ErrorDisplay message={error} />;

        return (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Pengguna" value={stats.users} icon="👥" color="border-blue-500" />
                    <StatCard title="Total Aset" value={stats.assets} icon="💻" color="border-green-500" />
                    <StatCard title="Laporan Terbuka" value={stats.reportsOpen} icon="📂" color="border-yellow-500" />
                    <StatCard title="Laporan Dikerjakan" value={stats.reportsInProgress} icon="🛠️" color="border-orange-500" />
                </div>

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                         {/* Di sini bisa ditambahkan grafik jika diperlukan */}
                         <div className="bg-white p-5 rounded-2xl shadow-lg h-full">
                            <h3 className="font-bold text-neutral-800 mb-4">Grafik Laporan Mingguan</h3>
                            <div className="flex items-center justify-center h-64 bg-neutral-100 rounded-lg">
                                <p className="text-neutral-500">Area untuk grafik laporan.</p>
                            </div>
                         </div>
                    </div>
                    <div>
                        <ReportList reports={recentReports} title="Laporan Terbaru" />
                    </div>
                </div>
            </>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900">
            <header className="px-4 py-3 bg-white/80 backdrop-blur border-b border-neutral-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <img src="/TRACERLOGO.png" alt="Tracer Logo" className="size-9 object-contain" />
                        <div>
                            <h1 className="text-base font-semibold leading-tight">Dasbor Superadmin</h1>
                            <p className="text-xs text-neutral-500">Selamat datang, {user?.name || "Pengguna"}!</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/assets" className="text-sm font-medium text-neutral-700 hover:text-red-600">Manajemen Aset</Link>
                        <Link to="/users" className="text-sm font-medium text-neutral-700 hover:text-red-600">Manajemen Pengguna</Link>
                        <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:underline">Keluar</button>
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto p-4 sm:p-6">
                {renderContent()}
            </main>
        </div>
    );
}

export default SuperAdminDashboard;