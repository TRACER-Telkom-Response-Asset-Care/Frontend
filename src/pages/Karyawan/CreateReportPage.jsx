import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "@/apiClient";
import { useAuth } from "@/context/AuthContext";


const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

const AlertTriangleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" />
    </svg>
);

const VideoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500">
        <path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </svg>
);

const UploadCloudIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-10 text-neutral-400">
        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/>
    </svg>
);


// --- Components ---
const Alert = ({ message, type }) => {
    if (!message) return null;
    const isSuccess = type === 'success';
    const baseClasses = 'mb-4 rounded-xl border text-sm p-3 flex items-center gap-3 animate-fade-in';
    const successClasses = 'border-green-200 bg-green-50 text-green-800';
    const errorClasses = 'border-red-200 bg-red-50 text-red-800';

    return (
        <div className={`${baseClasses} ${isSuccess ? successClasses : errorClasses}`}>
            {isSuccess ? <CheckCircleIcon /> : <AlertTriangleIcon />}
            <p className="font-medium">{message}</p>
        </div>
    );
};

const FilePreview = ({ file, onRemove }) => {
    const isImage = file.type.startsWith('image/');
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        if (isImage) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url); // Cleanup
        }
    }, [file, isImage]);


    return (
        <div className="relative group w-full aspect-square bg-neutral-100 rounded-xl overflow-hidden border-2 border-dashed border-neutral-200">
            {isImage ? (
                <img src={previewUrl} alt={file.name} className="w-full h-full object-cover" />
            ) : (
                <div className="flex flex-col items-center justify-center h-full p-2 text-center">
                    <VideoIcon />
                    <p className="text-xs text-neutral-600 truncate mt-2">{file.name}</p>
                </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <button
                    type="button"
                    onClick={onRemove}
                    className="size-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 scale-75 group-hover:scale-100 transition-transform duration-200 ease-in-out"
                    aria-label="Hapus file"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
            </div>
        </div>
    );
};

// --- Main Page Component ---
function CreateReportPage() {
    const [assets, setAssets] = useState([]);
    const [assetId, setAssetId] = useState("");
    const [description, setDescription] = useState("");
    const [mediaFiles, setMediaFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState({ message: "", type: "" });
    const [isDragging, setIsDragging] = useState(false);

    const { user, isInitializing } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isInitializing) return;

        const fetchAssets = async () => {
            try {
                const response = await apiClient.get("/api/assets");
                setAssets(response.data);
            } catch (error) {
                setAlert({ message: "Gagal memuat daftar aset. Silakan coba muat ulang halaman.", type: "error" });
                console.error("Failed to fetch assets:", error);
            }
        };
        fetchAssets();
    }, [isInitializing]);
    
    const handleFileValidation = (files) => {
        const MAX_SIZE = 8 * 1024 * 1024; // 8MB
        const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'video/mp4', 'video/quicktime'];
        let newAlert = { message: "", type: "" };

        const validatedFiles = Array.from(files).filter(file => {
            if (!ALLOWED_TYPES.includes(file.type)) {
                newAlert = { message: `Tipe file '${file.name}' tidak didukung.`, type: "error" };
                return false;
            }
            if (file.size > MAX_SIZE) {
                newAlert = { message: `Ukuran file '${file.name}' terlalu besar (Maks 8MB).`, type: "error" };
                return false;
            }
            return true;
        });

        if (newAlert.message) {
            setAlert(newAlert);
        } else {
            setAlert({ message: "", type: "" });
        }

        return validatedFiles;
    };


    const handleFileChange = (event) => {
        const files = event.target.files;
        if (files) {
            const validatedFiles = handleFileValidation(files);
            setMediaFiles(prevFiles => [...prevFiles, ...validatedFiles]);
        }
    };

    const handleDragEvents = (e, isOver) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(isOver);
    };

    const handleDrop = (e) => {
        handleDragEvents(e, false);
        const files = e.dataTransfer.files;
        if (files) {
            const validatedFiles = handleFileValidation(files);
            setMediaFiles(prevFiles => [...prevFiles, ...validatedFiles]);
        }
    };

    const handleRemoveFile = (indexToRemove) => {
        setMediaFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!assetId || !description) {
            setAlert({ message: "Aset dan deskripsi wajib diisi.", type: "error" });
            return;
        }
        setIsLoading(true);
        setAlert({ message: "", type: "" });

        const formData = new FormData();
        formData.append("asset_id", assetId);
        formData.append("user_id", user.id);
        formData.append("description", description);
        
        mediaFiles.forEach(file => formData.append("media[]", file));

        try {
            await apiClient.post("/api/reports", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setAlert({ message: "Laporan berhasil dikirim! Mengarahkan ke dasbor...", type: "success" });
            setTimeout(() => navigate("/karyawandashboard"), 2000);
        } catch (error) {
            const mediaError = error.response?.data?.errors 
                ? Object.keys(error.response.data.errors).find(key => key.startsWith('media.'))
                : null;
            
            const errorMessage = mediaError 
                ? error.response.data.errors[mediaError][0] 
                : "Gagal mengirim laporan. Periksa kembali isian Anda atau coba lagi nanti.";

            setAlert({ message: errorMessage, type: "error" });
            console.error("Failed to submit report:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-100 text-neutral-900">
            <header className="px-4 py-3 bg-white/80 backdrop-blur border-b border-neutral-200 sticky top-0 z-20 shadow-sm">
                <div className="max-w-3xl mx-auto flex items-center gap-3">
                    <img src="/src/assets/TRACERLOGO.png" alt="Tracer Logo" className="size-9 object-contain" />
                    <h1 className="text-base font-semibold leading-tight tracking-tight">Buat Laporan Kerusakan Baru</h1>
                </div>
            </header>
            
            <main className="max-w-3xl mx-auto p-4 sm:p-6">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-neutral-200 space-y-6">
                    <Alert message={alert.message} type={alert.type} />
                    
                    
                    <div>
                        <label htmlFor="assetId" className="block text-sm font-medium mb-1.5 text-neutral-700">Pilih Aset yang Rusak</label>
                        <div className="relative">
                            <select 
                                id="assetId" 
                                value={assetId} 
                                onChange={(e) => setAssetId(e.target.value)} 
                                required 
                                className="w-full appearance-none bg-white py-2.5 px-3.5 pr-10 rounded-xl border-neutral-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/30 shadow-sm transition-colors duration-200"
                            >
                                <option value="" disabled>Pilih salah satu...</option>
                                {assets.map(asset => (
                                    <option key={asset.id} value={asset.id}>
                                        {asset.name} ({asset.asset_code}) - Lokasi: {asset.location}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                            </div>
                        </div>
                    </div>

                    
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium mb-1.5 text-neutral-700">Deskripsikan Kerusakan</label>
                        <textarea 
                            id="description" 
                            rows="4" 
                            placeholder="Contoh: AC tidak dingin, hanya mengeluarkan angin." 
                            required 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            className="w-full rounded-xl border-neutral-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/30 shadow-sm transition-colors duration-200 p-2"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-neutral-700">Unggah Bukti (Foto/Video)</label>
                        <div
                            onDragOver={(e) => handleDragEvents(e, true)}
                            onDragLeave={(e) => handleDragEvents(e, false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current.click()}
                            className={`relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200 ${isDragging ? 'border-red-500 bg-red-50' : 'border-neutral-300 bg-neutral-50 hover:border-red-400'}`}
                        >
                            <UploadCloudIcon />
                            <p className="mt-2 text-sm text-neutral-600">
                                <span className="font-semibold text-red-600">Klik untuk mengunggah</span> atau seret file ke sini
                            </p>
                            <p className="mt-1 text-xs text-neutral-500">JPG, PNG, MP4, MOV (Maks 8MB per file).</p>
                            <input 
                                ref={fileInputRef}
                                id="media" 
                                name="media[]" 
                                type="file" 
                                multiple 
                                onChange={handleFileChange} 
                                className="hidden"
                                accept="image/jpeg,image/png,video/mp4,video/quicktime"
                            />
                        </div>
                    </div>
                    
                    
                    {mediaFiles.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 pt-2">
                            {mediaFiles.map((file, index) => (
                                <FilePreview key={index} file={file} onRemove={() => handleRemoveFile(index)} />
                            ))}
                        </div>
                    )}

                
                    <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-5 border-t border-neutral-200 mt-6">
                        <Link to="/karyawandashboard" className="text-sm font-medium text-center text-neutral-600 hover:text-red-600 py-2.5 px-6 rounded-xl w-full sm:w-auto hover:bg-neutral-100 transition-colors">
                            Batal
                        </Link>
                        <button 
                            type="submit" 
                            disabled={isLoading} 
                            className="w-full sm:w-auto bg-red-600 text-white font-medium py-2.5 px-8 rounded-xl active:scale-[.98] disabled:bg-red-300 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            {isLoading ? "Mengirim..." : "Kirim Laporan"}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}

export default CreateReportPage;