import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

// Definisikan base URL untuk gambar langsung di file ini.
const IMAGE_BASE_URL = import.meta.env.VITE_API_BASE_URL.replace("/api", "");

// --- Komponen UI untuk Loading dan Error ---

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        <p className="ml-4 text-neutral-600">Memuat data laporan...</p>
    </div>
);

const ErrorDisplay = ({ message, instructions }) => (
    <div className="text-center p-10 bg-red-50 rounded-2xl shadow-sm">
        <p className="font-semibold text-red-700">Terjadi Kesalahan</p>
        <p className="text-sm text-red-600 mt-1">{message}</p>
        <p className="text-xs text-neutral-500 mt-2">{instructions}</p>
        <Link to="/karyawandashboard" className="mt-4 inline-block bg-red-600 text-white font-medium py-2 px-4 rounded-xl text-sm hover:bg-red-700 transition-colors">
            Kembali ke Dasbor
        </Link>
    </div>
);

// --- Komponen Utama Halaman Detail Laporan ---

function ReportDetailPage() {
    const { reportId } = useParams();
    const [report, setReport] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState({ message: "", instructions: "" });

    useEffect(() => {
        const fetchReportDetails = async () => {
            setIsLoading(true);
            setError({ message: "", instructions: "" }); // Reset error state on new fetch
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/reports/${reportId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
                });
                setReport(response.data);
            } catch (err) {
                console.error("Gagal mengambil detail laporan:", err); // Log error lengkap untuk debugging
                
                // --- PENANGANAN ERROR YANG LEBIH BAIK ---
                if (err.response) {
                    // Server merespons dengan status error (4xx atau 5xx)
                    if (err.response.status === 404) {
                        setError({ message: "Laporan ini tidak dapat ditemukan.", instructions: "Pastikan URL benar atau laporan belum dihapus." });
                    } else if (err.response.status === 403) {
                        setError({ message: "Anda tidak memiliki izin untuk melihat laporan ini.", instructions: "Laporan ini mungkin milik pengguna lain." });
                    } else if (err.response.status === 401) {
                        setError({ message: "Sesi Anda telah berakhir.", instructions: "Silakan logout dan login kembali untuk melanjutkan." });
                    } else {
                        setError({ message: "Terjadi kesalahan pada server.", instructions: "Tim kami telah diberitahu. Silakan coba lagi nanti." });
                    }
                } else if (err.request) {
                    // Permintaan dikirim tetapi tidak ada respons
                    setError({ message: "Tidak dapat terhubung ke server.", instructions: "Periksa koneksi internet Anda dan coba lagi." });
                } else {
                    // Terjadi kesalahan lain saat menyiapkan permintaan
                    setError({ message: "Terjadi kesalahan yang tidak terduga.", instructions: "Silakan muat ulang halaman." });
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchReportDetails();
    }, [reportId]);

    const getStatusChip = (status) => {
        switch (status?.toLowerCase()) {
            case "open": return "bg-blue-100 text-blue-800 ring-blue-600/20";
            case "in_progress": return "bg-yellow-100 text-yellow-800 ring-yellow-600/20";
            case "closed": return "bg-green-100 text-green-800 ring-green-600/20";
            default: return "bg-gray-100 text-gray-800 ring-gray-600/20";
        }
    };

    const aiResponse = report?.responses?.[0]?.response || "Analisis AI sedang diproses atau belum tersedia.";

    return (
        <div className="min-h-screen bg-neutral-100">
            <header className="px-4 py-3 bg-white/80 backdrop-blur border-b border-neutral-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto">
                    <Link to="/karyawandashboard" className="flex items-center gap-2 text-sm font-medium text-red-600 hover:underline">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" /></svg>
                        Kembali ke Dasbor
                    </Link>
                </div>
            </header>
            <main className="max-w-5xl mx-auto p-4">
                {isLoading ? (
                    <LoadingSpinner />
                ) : error.message ? (
                    <ErrorDisplay message={error.message} instructions={error.instructions} />
                ) : !report ? (
                    <ErrorDisplay message="Laporan tidak dapat ditemukan." />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Konten Utama */}
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 space-y-6">
                           {/* ... (sisa kode tampilan tetap sama) ... */}
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-neutral-800">Laporan {report.report_code}</h1>
                                    <p className="text-sm text-neutral-500">
                                        Diajukan pada {new Date(report.created_at).toLocaleString("id-ID", { dateStyle: 'long', timeStyle: 'short' })}
                                    </p>
                                </div>
                                <span className={`capitalize px-3 py-1 text-xs font-semibold rounded-full ring-1 ring-inset ${getStatusChip(report.status)}`}>
                                    {report.status.replace("_", " ")}
                                </span>
                            </div>

                            <div className="border-t border-neutral-200 pt-4 space-y-2">
                                <h3 className="text-base font-semibold text-neutral-700">Informasi Aset</h3>
                                <div className="text-sm grid grid-cols-2 gap-x-4 gap-y-1">
                                    <span className="text-neutral-500">Nama Aset:</span> <span className="text-neutral-800 font-medium">{report.asset.name}</span>
                                    <span className="text-neutral-500">Kode Aset:</span> <span className="text-neutral-800">{report.asset.asset_code}</span>
                                    <span className="text-neutral-500">Lokasi:</span> <span className="text-neutral-800">{report.asset.location}</span>
                                </div>
                            </div>
                            
                            <div className="border-t border-neutral-200 pt-4">
                                <h3 className="text-base font-semibold text-neutral-700 mb-2">Deskripsi Kerusakan</h3>
                                <p className="text-sm text-neutral-700 whitespace-pre-wrap bg-neutral-50 p-3 rounded-lg">{report.description}</p>
                            </div>

                            {report.report_media?.length > 0 && (
                                <div className="border-t border-neutral-200 pt-4">
                                    <h3 className="text-base font-semibold text-neutral-700 mb-2">Bukti Media</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {report.report_media.map((file) => (
                                            <a key={file.id} href={`${IMAGE_BASE_URL}/storage/${file.file_path}`} target="_blank" rel="noopener noreferrer" className="relative group">
                                                <img 
                                                    src={`${IMAGE_BASE_URL}/storage/${file.file_path}`} 
                                                    alt={`Bukti laporan`} 
                                                    className="rounded-lg object-cover w-full h-32 border border-neutral-200"
                                                    onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/300x200/EEE/31343C?text=Gagal\\nMuat'; }}
                                                />
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                                   <p className="text-white text-xs text-center">Lihat Media</p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Sidebar Analisis AI */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 h-fit">
                           <div className="flex items-center gap-3 border-b border-neutral-200 pb-2">
                                <span className="text-2xl">🤖</span>
                                <h2 className="text-lg font-bold text-neutral-800">Hasil Analisis AI</h2>
                           </div>
                           <div>
                              <p className="text-sm text-neutral-600 whitespace-pre-wrap">{aiResponse}</p>
                           </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default ReportDetailPage;

