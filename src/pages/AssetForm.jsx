import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Upload, FileText, Image as ImageIcon } from "lucide-react"; // ikon lucide
import apiClient from "@/apiClient";

function AssetForm() {
    const [assetData, setAssetData] = useState({
        name: "",
        asset_code: "",
        location: "",
        asset_type_id: "",
        status: "available",
    });
    const [assetTypes, setAssetTypes] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [manualFile, setManualFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    useEffect(() => {
        const fetchAssetTypes = async () => {
            try {
                const response = await apiClient.get("/api/asset-types");
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
        setAssetData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        if (type === "image") {
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
        } else {
            setManualFile(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            Object.keys(assetData).forEach((key) => {
                formData.append(key, assetData[key]);
            });

            if (imageFile) {
                formData.append("image", imageFile);
            }
            if (manualFile) {
                formData.append("user_manual", manualFile);
            }

            if (isEditing) {
                await apiClient.post(`/api/assets/${id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } else {
                await apiClient.post("/api/assets", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            navigate("/assets");
        } catch (err) {
            setError(err.response?.data?.message || `Gagal ${isEditing ? "memperbarui" : "menyimpan"} aset.`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && isEditing) {
        return <p>Memuat data...</p>;
    }

    return (
        <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-2xl p-8 shadow-lg space-y-6"
                    encType="multipart/form-data"
                >
                    <h2 className="text-2xl font-bold text-center text-neutral-800">
                        {isEditing ? "Ubah Data Aset" : "Tambah Aset Baru"}
                    </h2>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
                            {error}
                        </div>
                    )}

                    {/* Nama */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1.5 text-neutral-700">
                            Nama Aset
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={assetData.name}
                            onChange={handleChange}
                            className="w-full rounded-xl border-neutral-300 shadow-sm p-2"
                        />
                    </div>

                    {/* Kode */}
                    <div>
                        <label htmlFor="asset_code" className="block text-sm font-medium mb-1.5 text-neutral-700">
                            Kode Aset
                        </label>
                        <input
                            id="asset_code"
                            name="asset_code"
                            type="text"
                            required
                            value={assetData.asset_code}
                            onChange={handleChange}
                            className="w-full rounded-xl border-neutral-300 shadow-sm p-2"
                        />
                    </div>

                    {/* Lokasi */}
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium mb-1.5 text-neutral-700">
                            Lokasi
                        </label>
                        <input
                            id="location"
                            name="location"
                            type="text"
                            required
                            value={assetData.location}
                            onChange={handleChange}
                            className="w-full rounded-xl border-neutral-300 shadow-sm p-2"
                        />
                    </div>

                    {/* Tipe Aset */}
                    <div>
                        <label htmlFor="asset_type_id" className="block text-sm font-medium mb-1.5 text-neutral-700">
                            Tipe Aset
                        </label>
                        <select
                            id="asset_type_id"
                            name="asset_type_id"
                            required
                            value={assetData.asset_type_id}
                            onChange={handleChange}
                            className="w-full rounded-xl border-neutral-300 shadow-sm p-2"
                        >
                            <option value="" disabled>
                                Pilih Tipe Aset
                            </option>
                            {assetTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Upload Gambar */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-neutral-700">Gambar Aset (Opsional)</label>
                        <label
                            htmlFor="image"
                            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer hover:bg-neutral-50 transition"
                        >
                            {preview ? (
                                <img src={preview} alt="Preview" className="h-full object-contain p-2" />
                            ) : (
                                <div className="flex flex-col items-center text-neutral-500">
                                    <ImageIcon className="w-10 h-10 mb-2" />
                                    <span className="text-sm">Klik atau tarik file gambar ke sini</span>
                                </div>
                            )}
                            <input
                                id="image"
                                name="image"
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, "image")}
                                className="hidden"
                            />
                        </label>
                    </div>

                    {/* Upload Manual Book */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-neutral-700">Manual Book (PDF, Opsional)</label>
                        <label
                            htmlFor="user_manual"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer hover:bg-neutral-50 transition"
                        >
                            <div className="flex flex-col items-center text-neutral-500">
                                <FileText className="w-10 h-10 mb-2" />
                                <span className="text-sm">
                                    {manualFile ? manualFile.name : "Klik atau tarik file PDF ke sini"}
                                </span>
                            </div>
                            <input
                                id="user_manual"
                                name="user_manual"
                                type="file"
                                accept="application/pdf"
                                onChange={(e) => handleFileChange(e, "manual")}
                                className="hidden"
                            />
                        </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 pt-4">
                        <Link
                            to="/assets"
                            className="text-sm font-medium text-neutral-600 py-2.5 px-6 rounded-xl hover:bg-neutral-100"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-red-600 text-white font-medium py-2.5 px-8 rounded-xl disabled:bg-red-300"
                        >
                            {isLoading ? "Menyimpan..." : "Simpan Aset"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AssetForm;
