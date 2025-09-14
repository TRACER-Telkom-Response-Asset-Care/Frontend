import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import apiClient from '@/apiClient';

function UserForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        employee_id: '',
        email: '',
        password: '',
        roles: [],
    });
    const [formErrors, setFormErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const availableRoles = ['superadmin', 'teknisi', 'pegawai'];

    useEffect(() => {
        if (isEditing) {
            setIsLoading(true);
            apiClient.get(`/api/users/${id}`)
                .then(response => {
                    const user = response.data;
                    setFormData({
                        name: user.name,
                        employee_id: user.employee_id,
                        email: user.email,
                        password: '',
                        roles: user.roles.map(role => role.name),
                    });
                })
                .catch(error => {
                    console.error("Gagal memuat data pengguna", error);
                })
                .finally(() => setIsLoading(false));
        }
    }, [id, isEditing]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (e) => {
        setFormData(prev => ({ ...prev, roles: [e.target.value] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setFormErrors({});

        const dataToSend = { ...formData };
        if (isEditing && !dataToSend.password) {
            delete dataToSend.password;
        }

        const apiCall = isEditing
            ? apiClient.put(`/api/users/${id}`, dataToSend)
            : apiClient.post('/api/users', dataToSend);

        try {
            await apiCall;
            navigate('/users');
        } catch (err) {
            if (err.response && err.response.status === 422) {
                setFormErrors(err.response.data.errors);
            } else {
                setFormErrors({ general: ['Terjadi kesalahan. Silakan coba lagi.'] });
            }
        } finally {
            setIsSaving(false);
        }
    };
    
    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><p>Memuat formulir...</p></div>;
    }

    return (
        <div className="min-h-screen bg-neutral-100">
             <header className="px-4 py-3 bg-white/80 backdrop-blur border-b border-neutral-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <h1 className="text-xl font-bold text-neutral-800">
                        {isEditing ? 'Ubah Pengguna' : 'Tambah Pengguna Baru'}
                    </h1>
                </div>
            </header>
            <main className="max-w-4xl mx-auto p-4 sm:p-6">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-lg space-y-6">
                    {formErrors.general && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">{formErrors.general[0]}</div>}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1.5 text-neutral-700">Nama Lengkap</label>
                        <input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange} className="w-full rounded-xl border-neutral-300 shadow-sm p-2" />
                        {formErrors.name && <p className="text-xs text-red-600 mt-1">{formErrors.name[0]}</p>}
                    </div>
                    <div>
                        <label htmlFor="employee_id" className="block text-sm font-medium mb-1.5 text-neutral-700">ID Pekerja</label>
                        <input id="employee_id" name="employee_id" type="text" value={formData.employee_id} onChange={handleInputChange} className="w-full rounded-xl border-neutral-300 shadow-sm p-2" />
                        {formErrors.employee_id && <p className="text-xs text-red-600 mt-1">{formErrors.employee_id[0]}</p>}
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1.5 text-neutral-700">Alamat Email</label>
                        <input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} className="w-full rounded-xl border-neutral-300 shadow-sm p-2" />
                         {formErrors.email && <p className="text-xs text-red-600 mt-1">{formErrors.email[0]}</p>}
                    </div>
                     <div>
                        <label htmlFor="password" className="block text-sm font-medium mb-1.5 text-neutral-700">Kata Sandi</label>
                        <input id="password" name="password" type="password" placeholder={isEditing ? 'Kosongkan jika tidak ingin mengubah' : ''} onChange={handleInputChange} className="w-full rounded-xl border-neutral-300 shadow-sm p-2" />
                        {formErrors.password && <p className="text-xs text-red-600 mt-1">{formErrors.password[0]}</p>}
                    </div>
                    <div>
                        <label htmlFor="roles" className="block text-sm font-medium mb-1.5 text-neutral-700">Peran</label>
                        <select id="roles" name="roles" value={formData.roles[0] || ''} onChange={handleRoleChange} className="w-full rounded-xl border-neutral-300 shadow-sm p-2">
                            <option value="" disabled>Pilih peran</option>
                            {availableRoles.map(role => (
                                <option key={role} value={role} className="capitalize">{role}</option>
                            ))}
                        </select>
                        {formErrors.roles && <p className="text-xs text-red-600 mt-1">{formErrors.roles[0]}</p>}
                    </div>
                    <div className="flex justify-end gap-4 pt-4 border-t border-neutral-200">
                        <Link to="/users" className="text-sm font-medium text-neutral-600 py-2.5 px-6 rounded-xl hover:bg-neutral-100">Batal</Link>
                        <button type="submit" disabled={isSaving} className="bg-red-600 text-white font-medium py-2.5 px-8 rounded-xl disabled:bg-red-300">
                            {isSaving ? 'Menyimpan...' : 'Simpan Pengguna'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}

export default UserForm;
