import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "@/apiClient";
import { useAuth } from "@/context/AuthContext";

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
        <p className="ml-4 text-neutral-600">Memuat data aset...</p>
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
        <h3 className="text-lg font-semibold text-neutral-800">Belum Ada Aset</h3>
        <p className="mt-1 text-sm text-neutral-500">Sepertinya belum ada data aset yang ditambahkan.</p>
        <Link
            to="/assets/new"
            className="mt-4 inline-block bg-red-600 text-white font-medium py-2 px-4 rounded-xl text-sm hover:bg-red-700 transition-colors"
        >
            Tambah Aset Pertama
        </Link>
    </div>
);

// New component for displaying when no search/filter results are found
const NoResults = () => (
    <div className="text-center p-10 bg-white rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold text-neutral-800">Aset Tidak Ditemukan</h3>
        <p className="mt-1 text-sm text-neutral-500">Coba ubah kata kunci pencarian atau filter Anda.</p>
    </div>
);


const AssetTable = ({ assets, onEdit, onDelete, onShowDetails }) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Kode Aset</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Nama Aset</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Tipe</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Lokasi</th>
                        <th className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                    {assets.map((asset) => (
                        <tr key={asset.id} className="hover:bg-neutral-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{asset.asset_code}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{asset.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{asset.asset_type?.name || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{asset.location}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                {/* New "Details" Button */}
                                <button onClick={() => onShowDetails(asset.id)} className="text-green-600 hover:text-green-800 hover:underline">
                                    Detail
                                </button>
                                <button onClick={() => onEdit(asset.id)} className="text-blue-600 hover:text-blue-800 hover:underline">
                                    Ubah
                                </button>
                                <button onClick={() => onDelete(asset.id)} className="text-red-600 hover:text-red-800 hover:underline">
                                    Hapus
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

function AssetManagementPage() {
    const [assets, setAssets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState(""); // Stores the asset type name for filtering
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

    const fetchAssets = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get("/api/assets");
            setAssets(response.data);
        } catch (err) {
            setError("Gagal memuat data aset. Silakan coba lagi nanti.");
            console.error("Failed to fetch assets:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isInitializing) {
            fetchAssets();
        }
    }, [isInitializing]);
    
    // Memoize the list of unique asset types for the filter dropdown
    const assetTypes = useMemo(() => {
        const types = new Set(assets.map(asset => asset.asset_type?.name).filter(Boolean));
        return ["Semua Tipe", ...Array.from(types)];
    }, [assets]);

    // Memoize the filtered assets to avoid re-calculation on every render
    const filteredAssets = useMemo(() => {
        return assets.filter(asset => {
            const searchTermLower = searchTerm.toLowerCase();
            const matchesSearch = searchTermLower === '' ||
                asset.name.toLowerCase().includes(searchTermLower) ||
                asset.asset_code.toLowerCase().includes(searchTermLower) ||
                asset.location.toLowerCase().includes(searchTermLower);

            const matchesFilter = filterType === '' || filterType === "Semua Tipe" ||
                asset.asset_type?.name === filterType;

            return matchesSearch && matchesFilter;
        });
    }, [assets, searchTerm, filterType]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleEdit = (id) => {
        navigate(`/assets/edit/${id}`);
    };

    const handleShowDetails = (id) => {
        navigate(`/assets/${id}`);
    }

    const handleDelete = async (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus aset ini?")) {
            try {
                await apiClient.delete(`/api/assets/${id}`);
                fetchAssets(); // Refetch assets to update the list
            } catch (err) {
                alert("Gagal menghapus aset. Silakan coba lagi.");
                console.error("Failed to delete asset:", err);
            }
        }
    };

    const renderContent = () => {
        if (isLoading || isInitializing) {
            return <LoadingSpinner />;
        }
        if (error) {
            return <ErrorDisplay message={error} />;
        }
        if (assets.length === 0) {
            return <EmptyState />;
        }
        if (filteredAssets.length === 0) {
            return <NoResults />;
        }
        return <AssetTable assets={filteredAssets} onEdit={handleEdit} onDelete={handleDelete} onShowDetails={handleShowDetails} />;
    };

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900">
            <header className="px-4 py-3 bg-white/80 backdrop-blur border-b border-neutral-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <img src="/TRACERLOGO.png" alt="Tracer Logo" className="size-9 object-contain" />
                        <div>
                            <h1 className="text-base font-semibold leading-tight">Manajemen Aset</h1>
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
                    <h2 className="text-2xl font-bold text-neutral-800">Daftar Aset</h2>
                    <div className="flex items-center gap-4">
                        <Link to="/asset-types" className="bg-white border border-neutral-300 text-neutral-700 font-medium py-2 px-5 rounded-xl hover:bg-neutral-100 transition-colors shadow-sm">
                            Kelola Tipe Aset
                        </Link>
                        <Link to="/assets/new" className="bg-red-600 text-white font-medium py-2 px-5 rounded-xl active:scale-[.99] hover:bg-red-700 transition-colors shadow-sm">
                            Tambah Aset Baru
                        </Link>
                    </div>
                </div>

                {/* New Search and Filter Section */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Cari aset (kode, nama, lokasi)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-grow p-2 border border-neutral-300 rounded-xl focus:ring-1 focus:ring-red-500 focus:border-red-500 shadow-sm transition"
                    />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="p-2 border border-neutral-300 rounded-xl focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white shadow-sm transition"
                        disabled={assets.length === 0} // Disable if no assets
                    >
                        {assetTypes.map(type => (
                            <option key={type} value={type === "Semua Tipe" ? "" : type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>

                {renderContent()}
            </main>
        </div>
    );
}

export default AssetManagementPage;