import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "@/apiClient";
import { useAuth } from "@/context/AuthContext";

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
        <p className="ml-4 text-neutral-600">Memuat riwayat laporan...</p>
    </div>
);

const ErrorDisplay = ({ message }) => (
    <div className="text-center p-10 bg-red-50 rounded-2xl shadow-sm">
        <p className="font-semibold text-red-700">Terjadi Kesalahan</p>
        <p className="text-sm text-red-600 mt-1">{message}</p>
    </div>
);

const EmptyState = ({ title, message, showCreateButton = false }) => (
    <div className="text-center p-10 bg-white rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold text-neutral-800">{title}</h3>
        <p className="mt-1 text-sm text-neutral-500">{message}</p>
        {showCreateButton && (
            <Link
                to="/create-report"
                className="mt-4 inline-block bg-red-600 text-white font-medium py-2 px-4 rounded-xl text-sm hover:bg-red-700 transition-colors"
            >
                Buat Laporan Pertama Anda
            </Link>
        )}
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Nama Aset</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Tanggal</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                        <th className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                    {reports.map((report) => (
                        <tr key={report.id} className="hover:bg-neutral-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{report.report_code}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{report.asset.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{new Date(report.created_at).toLocaleDateString("id-ID", { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`capitalize px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusChip(report.status)}`}>
                                    {report.status.replace("_", " ")}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link to={`/report/${report.id}`} className="text-red-600 hover:text-red-800 hover:underline">
                                    Lihat Detail
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

function EmployeeDashboard() {
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const { user, logout, isInitializing } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isInitializing) return;

        if (user) {
            const fetchUserReports = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const response = await apiClient.get("/api/reports/current-user");
                    setReports(response.data);
                } catch (err) {
                    setError("Gagal memuat laporan. Silakan coba muat ulang halaman.");
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchUserReports();
        } else {
            setIsLoading(false);
        }
    }, [user, isInitializing]);

    const filteredReports = useMemo(() => {
        return reports
            .filter(report => filterStatus === 'all' || report.status === filterStatus)
            .filter(report =>
                report.report_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.asset.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [reports, filterStatus, searchTerm]);

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
            return <EmptyState 
                        title="Belum Ada Laporan"
                        message="Sepertinya Anda belum pernah membuat laporan kerusakan."
                        showCreateButton={true}
                   />;
        }
        return (
            <>
                <div className="bg-white p-4 rounded-2xl shadow-lg mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Cari ID laporan atau nama aset..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-1/3 rounded-xl border-neutral-300 focus:border-red-500 focus:ring-red-500/40 shadow-sm px-4"
                        />
                        <div className="flex items-center gap-2 flex-wrap">
                            {['all', 'open', 'in_progress', 'closed'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-2 text-sm font-medium rounded-xl capitalize transition-colors ${filterStatus === status ? 'bg-red-600 text-white shadow' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
                                >
                                    {status === 'all' ? 'Semua' : status.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {filteredReports.length > 0 ? (
                    <ReportTable reports={filteredReports} />
                ) : (
                    <EmptyState 
                        title="Tidak Ada Laporan Ditemukan"
                        message="Tidak ada laporan yang cocok dengan filter atau pencarian Anda."
                    />
                )}
            </>
        );
    };

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900">
            <header className="px-4 py-3 bg-white/80 backdrop-blur border-b border-neutral-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <img src="/TRACERLOGO.png" alt="Tracer Logo" className="size-9 object-contain" />
                        <div>
                            <h1 className="text-base font-semibold leading-tight">Dasbor pegawai</h1>
                            <p className="text-xs text-neutral-500">Selamat datang, {user?.name || "Pengguna"}!</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:underline">
                        Keluar
                    </button>
                </div>
            </header>
            <main className="max-w-4xl mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-neutral-800">Riwayat Laporan Anda</h2>
                    <Link to="/create-report" className="bg-red-600 text-white font-medium py-2 px-5 rounded-xl active:scale-[.99] hover:bg-red-700 transition-colors shadow-sm">
                        Buat Laporan Baru
                    </Link>
                </div>
                {renderContent()}
            </main>
        </div>
    );
}

export default EmployeeDashboard;