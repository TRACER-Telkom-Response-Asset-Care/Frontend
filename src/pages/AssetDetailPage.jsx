import React, { useState, useEffect, useMemo} from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '@/apiClient';
import { useAuth } from '@/context/AuthContext';

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL + '/' || '';

const Icon = ({ name, className }) => {
    const icons = {
        back: '←',
        code: '#️⃣',
        type: '🏷️',
        location: '📍',
        manual: '📄',
    };
    return <span className={`inline-block ${className}`}>{icons[name]}</span>;
};

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        <p className="ml-4 text-neutral-600">Memuat data aset...</p>
    </div>
);

const ErrorDisplay = ({ message, onRetry }) => (
    <div className="text-center p-10 mt-10 bg-red-50 rounded-2xl max-w-lg mx-auto">
        <p className="font-semibold text-red-700">Terjadi Kesalahan</p>
        <p className="text-sm text-red-600 mt-1">{message}</p>
        <button onClick={onRetry} className="mt-4 bg-red-600 text-white font-medium py-2 px-4 rounded-xl text-sm hover:bg-red-700">
            Coba Lagi
        </button>
    </div>
);

const StatusBadge = ({ status }) => {
    const statusMap = {
        open: { text: 'Open', style: 'bg-green-100 text-green-800' },
        in_progress: { text: 'Repairing', style: 'bg-yellow-100 text-yellow-800' },
        closed: { text: 'Closed', style: 'bg-red-100 text-red-800' },
        available: { text: 'Available', style: 'bg-green-100 text-green-800' },
        broken: { text: 'Broken', style: 'bg-red-100 text-red-800' },
        in_repair: { text: 'In Repair', style: 'bg-yellow-100 text-yellow-800' },
        removed: { text: 'Removed', style: 'bg-gray-100 text-gray-800' },
    };
    const { text, style } = statusMap[status] || { text: 'Tidak Diketahui', style: 'bg-neutral-100' };
    return <span className={`capitalize px-4 py-2 text-sm font-bold rounded-full inline-block ${style}`}>{text}</span>;
};

function AssetDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAsset = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get(`/api/assets/${id}`);
            setAsset(response.data);
        } catch (err) {
            console.error("Gagal mengambil detail aset:", err);
            setError("Gagal memuat data aset. Pastikan aset tersebut ada.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAsset();
    }, [id]);
    
    const dashboardLink = useMemo(() => {
        const role = user?.roles?.[0]?.name;
        if (role === "superadmin") return "/superadmindashboard";
        if (role === "teknisi") return "/teknisidashboard";
        return "/pegawaidashboard";
    }, [user?.roles]);

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorDisplay message={error} onRetry={fetchAsset} />;
    if (!asset) return null;

    return (
        <div className="min-h-screen bg-neutral-50 p-4 sm:p-6 lg:p-8">
            <main className="max-w-6xl mx-auto">
                {/* Navigasi Header */}
                <div className="mb-6">
                     <p className="text-sm text-neutral-500 mb-2">
                        <Link to="/assets" className="hover:underline">Manajemen Aset</Link>
                        <span className="mx-2">/</span>
                        <span>Detail</span>
                    </p>
                    <div className="flex items-center gap-4">
                        <Link to="/assets" className="flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-red-600">
                            <Icon name="back" />
                            Kembali ke Daftar Aset
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Kolom Kiri: Gambar & Nama */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center text-center">
                        <img 
                            src={ IMAGE_BASE_URL + asset.image || 'https://via.placeholder.com/400x300.png?text=Gambar+Aset'} 
                            alt={asset.name} 
                            className="w-full max-w-sm h-64 object-contain rounded-lg bg-neutral-100 mb-6"
                        />
                        <h1 className="text-3xl font-bold text-neutral-800">{asset.name}</h1>
                    </div>

                    {/* Kolom Kanan: Detail & Dokumen */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                             <h2 className="text-sm font-semibold text-neutral-500 uppercase mb-3">Status Aset</h2>
                             <StatusBadge status={asset.status} />
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-lg space-y-4">
                             <h2 className="text-lg font-semibold text-neutral-800 border-b pb-3 mb-4">Informasi Utama</h2>
                             <InfoItem icon="code" label="Kode Aset" value={asset.asset_code} />
                             <InfoItem icon="type" label="Tipe Aset" value={asset.asset_type?.name || 'N/A'} />
                             <InfoItem icon="location" label="Lokasi" value={asset.location} />
                        </div>
                         {asset.user_manual_url && (
                            <div className="bg-white p-6 rounded-2xl shadow-lg">
                                <h2 className="text-lg font-semibold text-neutral-800 mb-3">Dokumen</h2>
                                <a href={asset.user_manual_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-red-600 hover:underline font-medium">
                                    <Icon name="manual" className="text-xl" />
                                    <span>Unduh Manual Pengguna (.pdf)</span>
                                </a>
                            </div>
                         )}
                    </div>
                </div>

                {/* Riwayat Laporan */}
                <div className="mt-6 lg:mt-8 bg-white p-6 rounded-2xl shadow-lg">
                    <h2 className="text-xl font-bold text-neutral-800 mb-4">Riwayat Laporan Kerusakan</h2>
                    {asset.reports && asset.reports.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-neutral-200">
                                 <thead className="bg-neutral-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">ID Laporan</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-neutral-500 uppercase">Tanggal</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-neutral-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-200">
                                    {asset.reports.map(report => (
                                        <tr key={report.id} className="hover:bg-neutral-50">
                                            <td className="px-6 py-4 text-sm font-medium text-red-600">{report.report_code}</td>
                                            <td className="px-6 py-4 text-center text-sm text-neutral-500">{new Date(report.created_at).toLocaleDateString("id-ID")}</td>
                                            <td className="px-6 py-4 text-center"><StatusBadge status={report.status.replace('_', ' ').toLowerCase()} /></td>
                                            <td className="px-6 py-4 text-right text-sm">
                                                <Link to={`/report/${report.id}`} className="font-medium text-red-600 hover:underline">Lihat Detail</Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center text-neutral-500 py-8">Belum ada riwayat laporan untuk aset ini.</p>
                    )}
                </div>
            </main>
        </div>
    );
}

const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 text-sm">
        <Icon name={icon} className="text-neutral-400 mt-1 text-xl" />
        <div>
            <p className="text-neutral-500">{label}</p>
            <p className="font-semibold text-neutral-800">{value}</p>
        </div>
    </div>
);


export default AssetDetailPage;