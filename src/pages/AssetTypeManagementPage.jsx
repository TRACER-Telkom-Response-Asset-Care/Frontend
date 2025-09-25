import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "@/apiClient";
import { useAuth } from "@/context/AuthContext";

// --- Reusable Components ---

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

const EmptyState = ({ onAdd }) => (
    <div className="text-center p-10 bg-white rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold text-neutral-800">Belum Ada Tipe Aset</h3>
        <p className="mt-1 text-sm text-neutral-500">Silakan tambahkan tipe aset pertama Anda.</p>
        <button
            onClick={onAdd}
            className="mt-4 inline-block bg-red-600 text-white font-medium py-2 px-4 rounded-xl text-sm hover:bg-red-700 transition-colors"
        >
            Tambah Tipe Aset
        </button>
    </div>
);

const Modal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-neutral-200 pb-3 mb-4">
                <h3 className="text-lg font-bold text-neutral-800">{title}</h3>
                <button onClick={onClose} className="text-neutral-500 hover:text-neutral-800">&times;</button>
            </div>
            {children}
        </div>
    </div>
);



function AssetTypeManagementPage() {
    const [assetTypes, setAssetTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, logout, isInitializing } = useAuth();
    const navigate = useNavigate();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); 
    const [currentType, setCurrentType] = useState(null); 
    const [typeName, setTypeName] = useState('');
    const [modalError, setModalError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const fetchAssetTypes = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get("/api/asset-types");
            setAssetTypes(response.data);
        } catch (err) {
            setError("Gagal memuat data. Silakan coba lagi nanti.");
            console.error("Failed to fetch asset types:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isInitializing) {
            fetchAssetTypes();
        }
    }, [isInitializing, fetchAssetTypes]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const openModal = (mode, type = null) => {
        setModalMode(mode);
        setCurrentType(type);
        setTypeName(type ? type.name : '');
        setModalError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentType(null);
        setTypeName('');
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!typeName.trim()) {
            setModalError('Nama tipe aset tidak boleh kosong.');
            return;
        }
        setIsSaving(true);
        setModalError('');

        try {
            if (modalMode === 'edit') {
                await apiClient.put(`/api/asset-types/${currentType.id}`, { name: typeName });
            } else {
                await apiClient.post('/api/asset-types', { name: typeName });
            }
            closeModal();
            fetchAssetTypes();
        } catch (err) {
            setModalError(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan.');
            console.error("Save error:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus tipe aset ini? Aset yang menggunakan tipe ini mungkin akan terpengaruh.")) {
            try {
                await apiClient.delete(`/api/asset-types/${id}`);
                fetchAssetTypes();
            } catch (err) {
                alert("Gagal menghapus tipe aset. Pastikan tidak ada aset yang masih menggunakan tipe ini.");
                console.error("Delete error:", err);
            }
        }
    };
    
    const dashboardLink = user?.roles?.some(role => role.name === 'teknisi') ? "/teknisidashboard" : "/pegawaidashboard";

    const renderContent = () => {
        if (isLoading || isInitializing) return <LoadingSpinner />;
        if (error) return <ErrorDisplay message={error} />;
        if (assetTypes.length === 0) return <EmptyState onAdd={() => openModal('add')} />;
        
        return (
            <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Nama Tipe Aset</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                        {assetTypes.map((type) => (
                            <tr key={type.id} className="hover:bg-neutral-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{type.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{type.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                    <button onClick={() => openModal('edit', type)} className="text-blue-600 hover:text-blue-800 hover:underline">Ubah</button>
                                    <button onClick={() => handleDelete(type.id)} className="text-red-600 hover:text-red-800 hover:underline">Hapus</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900">
            <header className="px-4 py-3 bg-white/80 backdrop-blur border-b border-neutral-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <img src="/TRACERLOGO.png" alt="Tracer Logo" className="size-9 object-contain" />
                        <div>
                            <h1 className="text-base font-semibold leading-tight">Manajemen Tipe Aset</h1>
                            <p className="text-xs text-neutral-500">Selamat datang, {user?.name || "Pengguna"}!</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                         <Link to="/assets" className="text-sm font-medium text-neutral-700 hover:text-red-600">
                           Kembali
                        </Link>
                        <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:underline">Keluar</button>
                    </div>
                </div>
            </header>
            <main className="max-w-6xl mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-neutral-800">Daftar Tipe Aset</h2>
                    <button onClick={() => openModal('add')} className="bg-red-600 text-white font-medium py-2 px-5 rounded-xl active:scale-[.99] hover:bg-red-700 transition-colors shadow-sm">
                        Tambah Tipe Baru
                    </button>
                </div>
                {renderContent()}
            </main>

            {isModalOpen && (
                <Modal title={modalMode === 'edit' ? 'Ubah Tipe Aset' : 'Tambah Tipe Aset Baru'} onClose={closeModal}>
                    <form onSubmit={handleSave}>
                        {modalError && <p className="text-sm text-red-600 mb-2">{modalError}</p>}
                        <div className="space-y-2">
                            <label htmlFor="typeName" className="text-sm font-medium text-neutral-700">Nama Tipe</label>
                            <input
                                id="typeName"
                                type="text"
                                value={typeName}
                                onChange={(e) => setTypeName(e.target.value)}
                                className="w-full rounded-xl border-neutral-300 focus:border-red-500 focus:ring-red-500/40 shadow-sm p-2"
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-neutral-200">
                            <button type="button" onClick={closeModal} className="text-sm font-medium text-neutral-600 py-2 px-5 rounded-xl hover:bg-neutral-100">Batal</button>
                            <button type="submit" disabled={isSaving} className="bg-red-600 text-white font-medium py-2 px-5 rounded-xl disabled:bg-red-300">
                                {isSaving ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}

export default AssetTypeManagementPage;

