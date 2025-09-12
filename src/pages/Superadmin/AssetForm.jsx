import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import apiClient from "@/apiClient";

function AssetForm() {
    const [assetData, setAssetData] = useState({
        name: '',
        asset_code: '',
        location: '',
        asset_type_id: '',
        status: 'available',
    });
    const [assetTypes, setAssetTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    useEffect(() => {
        const fetchAssetTypes = async () => {
            try {
                const response = await apiClient.get('/api/asset-types');
                setAssetTypes(response.data);
            } catch (err) {
                console.error("Failed to fetch asset types", err);
            }
        };

        fetchAssetTypes();

        if (isEditing) {
            const fetchAsset = async () => {
                setIsLoading(true);
                try {
                    const response = await apiClient.get(`/api/assets/${id}`);
                    const { name, asset_code, location, asset_type_id, status } = response.data;
                    setAssetData({ name, asset_code, location, asset_type_id, status });
                } catch (err) {
                    setError("Gagal memuat data aset.");
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchAsset();
        }
    }, [id, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAssetData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const apiCall = isEditing
            ? apiClient.post(`/api/assets/${id}`, assetData) // Using POST as per backend route for update
            : apiClient.post('/api/assets', assetData);

        try {
            await apiCall;
            navigate('/superadmin/assets');
        } catch (err) {
            setError(err.response?.data?.message || `Gagal ${isEditing ? 'memperbarui' : 'menyimpan'} aset.`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && isEditing) {
        return <p>Memuat data...</p>
    }

    return (
        <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-lg space-y-6">
                    <h2 className="text-2xl font-bold text-center text-neutral-800">
                        {isEditing ? 'Ubah Data Aset' : 'Tambah Aset Baru'}
                    </h2>

                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">{error}</div>}

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1.5 text-neutral-700">Nama Aset</label>
                        <input id="name" name="name" type="text" required value={assetData.name} onChange={handleChange} className="w-full rounded-xl border-neutral-300 shadow-sm p-2" />
                    </div>

                    <div>
                        <label htmlFor="asset_code" className="block text-sm font-medium mb-1.5 text-neutral-700">Kode Aset</label>
                        <input id="asset_code" name="asset_code" type="text" required value={assetData.asset_code} onChange={handleChange} className="w-full rounded-xl border-neutral-300 shadow-sm p-2" />
                    </div>

                    <div>
                        <label htmlFor="location" className="block text-sm font-medium mb-1.5 text-neutral-700">Lokasi</label>
                        <input id="location" name="location" type="text" required value={assetData.location} onChange={handleChange} className="w-full rounded-xl border-neutral-300 shadow-sm p-2" />
                    </div>
                    
                    <div>
                        <label htmlFor="asset_type_id" className="block text-sm font-medium mb-1.5 text-neutral-700">Tipe Aset</label>
                        <select id="asset_type_id" name="asset_type_id" required value={assetData.asset_type_id} onChange={handleChange} className="w-full rounded-xl border-neutral-300 shadow-sm p-2">
                            <option value="" disabled>Pilih Tipe Aset</option>
                            {assetTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
                        </select>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <Link to="/superadmin/assets" className="text-sm font-medium text-neutral-600 py-2.5 px-6 rounded-xl hover:bg-neutral-100">Batal</Link>
                        <button type="submit" disabled={isLoading} className="bg-red-600 text-white font-medium py-2.5 px-8 rounded-xl disabled:bg-red-300">
                            {isLoading ? 'Menyimpan...' : 'Simpan Aset'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AssetForm;