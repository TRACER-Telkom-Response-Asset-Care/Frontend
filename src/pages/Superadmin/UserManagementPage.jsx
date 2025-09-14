import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "@/apiClient";
import { useAuth } from "@/context/AuthContext";

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
        <p className="ml-4 text-neutral-600">Memuat data pengguna...</p>
    </div>
);

const ErrorDisplay = ({ message }) => (
    <div className="text-center p-10 bg-red-50 rounded-2xl shadow-sm">
        <p className="font-semibold text-red-700">Terjadi Kesalahan</p>
        <p className="text-sm text-red-600 mt-1">{message}</p>
    </div>
);

function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user: adminUser, logout } = useAuth();
    const navigate = useNavigate();

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get("/api/users");
            setUsers(response.data);
        } catch (err) {
            setError("Gagal memuat data pengguna.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleDelete = async (userId) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) {
            try {
                await apiClient.delete(`/api/users/${userId}`);
                fetchUsers();
            } catch (err) {
                alert("Gagal menghapus pengguna.");
            }
        }
    };

    const getRoleChip = (roles) => {
        const roleName = Array.isArray(roles) && roles.length > 0 ? roles[0]?.name : 'N/A';
        const colors = {
            superadmin: "bg-red-100 text-red-800",
            teknisi: "bg-blue-100 text-blue-800",
            pegawai: "bg-green-100 text-green-800",
        };
        return <span className={`capitalize px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[roleName] || 'bg-gray-100 text-gray-800'}`}>{roleName}</span>;
    };
    
    const renderContent = () => {
        if (isLoading) return <LoadingSpinner />;
        if (error) return <ErrorDisplay message={error} />;
        
        return (
             <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">ID Pekerja</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Peran</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-neutral-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{user.employee_id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{getRoleChip(user.roles)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                    <Link to={`/users/edit/${user.id}`} className="text-blue-600 hover:text-blue-800">Ubah</Link>
                                    <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-800">Hapus</button>
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
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/TRACERLOGO.png" alt="Tracer Logo" className="size-9 object-contain" />
                        <div>
                            <h1 className="text-base font-semibold">Manajemen Pengguna</h1>
                            <p className="text-xs text-neutral-500">Selamat datang, {adminUser?.name || "Admin"}!</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4">
                        <Link to="/superadmindashboard" className="text-sm font-medium text-neutral-700 hover:text-red-600">Dasbor</Link>
                        <button onClick={logout} className="text-sm font-medium text-red-600 hover:underline">Keluar</button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 sm:p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-neutral-800">Daftar Pengguna</h2>
                    <Link to="/users/new" className="bg-red-600 text-white font-medium py-2 px-5 rounded-xl hover:bg-red-700">
                        Tambah Pengguna
                    </Link>
                </div>
                {renderContent()}
            </main>
        </div>
    );
}

export default UserManagementPage;