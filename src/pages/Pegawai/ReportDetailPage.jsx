import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import apiClient from "../../apiClient";
import { useAuth } from "../../context/AuthContext";
import ReactMarkdown from 'react-markdown';

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL + '/' || '';

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        <p className="ml-4 text-neutral-600">Memuat data laporan...</p>
    </div>
);

const ErrorDisplay = ({ message, instructions, dashboardLink }) => (
    <div className="text-center p-10 bg-red-50 rounded-2xl shadow-sm">
        <p className="font-semibold text-red-700">Terjadi Kesalahan</p>
        <p className="text-sm text-red-600 mt-1">{message}</p>
        <p className="text-xs text-neutral-500 mt-2">{instructions}</p>
        <Link to={dashboardLink} className="mt-4 inline-block bg-red-600 text-white font-medium py-2 px-4 rounded-xl text-sm hover:bg-red-700 transition-colors">
            Kembali ke Dasbor
        </Link>
    </div>
);

const InfoSection = ({ icon, title, children }) => (
    <div className="border-t border-neutral-200 pt-5 mt-5">
        <div className="flex items-center gap-3 mb-3">
            <span className="text-red-600 text-xl">{icon}</span>
            <h3 className="text-md font-semibold text-neutral-800">{title}</h3>
        </div>
        {children}
    </div>
);

const AiAnalysisSection = ({ title, content, icon }) => (
    <div>
        <h4 className="text-base font-semibold text-neutral-700 flex items-center gap-2 mb-2">
            {icon} {title}
        </h4>
        <div className="prose prose-sm text-neutral-600 max-w-none">
            <ReactMarkdown>{content || "Tidak ada data."}</ReactMarkdown>
        </div>
    </div>
);

const MediaPreview = ({ file }) => {
    const filePath = `${IMAGE_BASE_URL}${file.file_path}`;

    if (file.file_type === 'video') {
        return (
            <a key={file.id} href={filePath} target="_blank" rel="noopener noreferrer" className="relative group block w-full h-32 bg-neutral-800 rounded-lg overflow-hidden">
                <video controls className="w-full h-full object-cover">
                    <source src={filePath} type="video/mp4" />
                    Browser Anda tidak mendukung tag video.
                </video>
            </a>
        );
    }

    return (
        <a key={file.id} href={filePath} target="_blank" rel="noopener noreferrer" className="relative group block w-full h-32 bg-neutral-100 rounded-lg overflow-hidden">
            <img
                src={filePath}
                alt="Bukti laporan"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x200/EEE/31343C?text=Gagal\\nMuat'; }}
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                <p className="text-white text-xs font-bold">LIHAT</p>
            </div>
        </a>
    );
};

function ReportDetailPage() {
    const { reportId } = useParams();
    const [report, setReport] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState({ message: "", instructions: "" });
    const [alert, setAlert] = useState({ message: "", type: "" });
    const [newStatus, setNewStatus] = useState('');
    const [feedbackText, setFeedbackText] = useState('');
    const [aiResponse, setAiResponse] = useState(null);
    const [noFeedback, setNoFeedback] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const isTeknisi = user?.roles?.some(role => role.name === 'teknisi');
    let dashboardLink = '/pegawaidashboard';
    if (user?.roles?.some(role => role.name === 'superadmin')) {
        dashboardLink = '/reports';
    } else if (user?.roles?.some(role => role.name === 'teknisi')) {
        dashboardLink = '/teknisidashboard';
    }

    const fetchReportDetails = async () => {
        setIsLoading(true);
        setError({ message: "", instructions: "" });
        try {
            const response = await apiClient.get(`/api/reports/${reportId}`);
            setReport(response.data);
            setNewStatus(response.data.status);
        } catch (err) {
            console.error("Gagal mengambil detail laporan:", err);
            if (err.response) {
                if (err.response.status === 404) setError({ message: "Laporan ini tidak dapat ditemukan.", instructions: "Pastikan URL benar atau laporan belum dihapus." });
                else if (err.response.status === 403) setError({ message: "Anda tidak memiliki izin untuk melihat laporan ini.", instructions: "Laporan ini mungkin milik pengguna lain." });
                else if (err.response.status === 401) {
                    setError({ message: "Sesi Anda telah berakhir.", instructions: "Silakan login kembali untuk melanjutkan." });
                    logout();
                    navigate('/login');
                } else setError({ message: "Terjadi kesalahan pada server.", instructions: "Tim kami telah diberitahu. Silakan coba lagi nanti." });
            } else if (err.request) setError({ message: "Tidak dapat terhubung ke server.", instructions: "Periksa koneksi internet Anda dan coba lagi." });
            else setError({ message: "Terjadi kesalahan yang tidak terduga.", instructions: "Silakan muat ulang halaman." });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReportDetails();
    }, [reportId]);

    useEffect(() => {
        if (report?.feedback?.[0]?.feedback) {
            setFeedbackText(report.feedback[0].feedback);
        }
    }, [report]);

    useEffect(() => {
        if (report?.responses?.[0]?.response) {
            try {
                setAiResponse(JSON.parse(report.responses[0].response));
            } catch (e) {
                console.error("Invalid AI response JSON:", e);
            }
        }
    }, [report]);


    const handleStatusUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        setAlert({ message: "", type: "" });

        try {
            await apiClient.patch(`/api/reports/${reportId}`, { status: newStatus });

            if (newStatus === 'closed') {
                const feedbackMessage = noFeedback ? "Tidak ada umpan balik." : feedbackText;
                await apiClient.post(`/api/reports/${reportId}/feedback`, { feedback: feedbackMessage });
            }

            setAlert({ message: "Laporan berhasil diperbarui!", type: "success" });
            fetchReportDetails();
            setFeedbackText('');
            setNoFeedback(false);
        } catch (err) {
            setAlert({ message: "Gagal memperbarui laporan.", type: "error" });
            console.error("Failed to update report:", err);
        } finally {
            setIsUpdating(false);
        }
    };

    const isSaveDisabled = isUpdating || (newStatus === 'closed' && !feedbackText && !noFeedback);

    const getStatusChip = (status) => {
        switch (status?.toLowerCase()) {
            case "open": return "bg-blue-100 text-blue-800 ring-blue-600/20";
            case "in_progress": return "bg-yellow-100 text-yellow-800 ring-yellow-600/20";
            case "closed": return "bg-green-100 text-green-800 ring-green-600/20";
            default: return "bg-gray-100 text-gray-800 ring-gray-600/20";
        }
    };

    const getUrgencyChip = (urgency) => {
        switch (urgency?.toLowerCase()) {
            case "rendah": return "bg-green-100 text-green-800";
            case "sedang": return "bg-yellow-100 text-yellow-800";
            case "tinggi": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    // console.log(report?.responses[0]?.response);
    // console.log(typeof aiResponse);

    return (
        <div className="min-h-screen bg-neutral-100">
            <header className="px-4 py-3 bg-white/80 backdrop-blur border-b border-neutral-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link to={dashboardLink} className="flex items-center gap-2 text-sm font-medium text-red-600 hover:underline">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" /></svg>
                        Kembali
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 sm:p-6">
                {isLoading ? <LoadingSpinner /> : error.message ? (
                    <ErrorDisplay message={error.message} instructions={error.instructions} dashboardLink={dashboardLink} />
                ) : !report ? (
                    <ErrorDisplay message="Laporan tidak ditemukan." instructions="Laporan mungkin telah dihapus." dashboardLink={dashboardLink} />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <div className="lg:col-span-3 space-y-6">
                            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-5">
                                    <div>
                                        <p className="text-sm text-neutral-500">Detail Laporan</p>
                                        <h1 className="text-2xl font-bold text-neutral-800">{report.report_code}</h1>
                                        <p className="text-sm text-neutral-500 mt-1">Diajukan pada {new Date(report.created_at).toLocaleString("id-ID", { dateStyle: 'long', timeStyle: 'short' })}</p>
                                    </div>
                                    <span className={`capitalize px-3 py-1 text-xs font-semibold rounded-full ring-1 ring-inset ${getStatusChip(report.status)}`}>{report.status.replace("_", " ")}</span>
                                </div>
                                <InfoSection icon="🎛️" title="Informasi Aset"><div className="text-sm grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2"><span className="text-neutral-500">Nama Aset</span> <span className="text-neutral-800 font-medium">{report.asset.name}</span><span className="text-neutral-500">Kode Aset</span> <span className="text-neutral-800">{report.asset.asset_code}</span><span className="text-neutral-500">Lokasi</span> <span className="text-neutral-800">{report.asset.location}</span><span className="text-neutral-500">Tipe Aset</span> <span className="text-neutral-800">{report.asset.asset_type?.name || 'N/A'}</span></div></InfoSection>
                                <InfoSection icon="📝" title="Deskripsi Kerusakan"><p className="text-sm text-neutral-700 whitespace-pre-wrap bg-neutral-50 p-4 rounded-lg border border-neutral-200">{report.description}</p></InfoSection>
                                {report.report_media?.length > 0 && <InfoSection icon="📸" title="Bukti Media"><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">{report.report_media.map((file) => <MediaPreview key={file.id} file={file} />)}</div></InfoSection>}
                                {report.feedback?.[0] && <InfoSection icon="💬" title="Umpan Balik Teknisi"><p className="text-sm text-neutral-700 whitespace-pre-wrap bg-blue-50 p-4 rounded-lg border border-blue-200">{report?.feedback[0]?.feedback}</p></InfoSection>}
                                <InfoSection icon="👤" title="Informasi Pelapor"><div className="text-sm grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2"><span className="text-neutral-500">Nama</span> <span className="text-neutral-800 font-medium">{report.user.name}</span><span className="text-neutral-500">ID pegawai</span> <span className="text-neutral-800">{report.user.employee_id}</span></div></InfoSection>
                            </div>

                            {isTeknisi && (
                                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                                    <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-3">⚙️ Panel Aksi Teknisi</h3>
                                    <form onSubmit={handleStatusUpdate} className="mt-4 border-t border-neutral-200 pt-4 space-y-4">
                                        {alert.message && <div className={`rounded-md border text-sm p-3 ${alert.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>{alert.message}</div>}
                                        <div>
                                            <label htmlFor="status" className="block text-sm font-medium mb-1.5 text-neutral-700">Ubah Status Laporan</label>
                                            <div className="flex items-start gap-4">
                                                <select id="status" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full rounded-xl border-neutral-300 focus:border-red-500 focus:ring-red-500/40 shadow-sm px-2">
                                                    <option value="open">Open</option>
                                                    <option value="in_progress">In Progress</option>
                                                    <option value="closed">Closed</option>
                                                </select>
                                                <button type="submit" disabled={isSaveDisabled} className="bg-red-600 text-white font-medium py-2.5 px-6 rounded-xl active:scale-[.99] disabled:bg-red-300 disabled:cursor-not-allowed transition-colors whitespace-nowrap">
                                                    {isUpdating ? "Menyimpan..." : "Simpan"}
                                                </button>
                                            </div>
                                        </div>
                                        {newStatus === 'closed' && (
                                            <div className="space-y-3 pt-3 border-t border-dashed">
                                                <label htmlFor="feedback" className="block text-sm font-medium text-neutral-700">Umpan Balik (Wajib diisi jika status Closed)</label>
                                                <textarea id="feedback" rows="3" placeholder="Contoh: Perbaikan selesai, komponen X telah diganti." value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} disabled={noFeedback} className="w-full rounded-xl border-neutral-300 focus:border-red-500 focus:ring-red-500/40 shadow-sm disabled:bg-neutral-100 p-2"></textarea>
                                                <div className="flex items-center gap-2">
                                                    <input id="no-feedback" type="checkbox" checked={noFeedback} onChange={(e) => setNoFeedback(e.target.checked)} className="h-4 w-4 rounded border-neutral-300 text-red-600 focus:ring-red-500" />
                                                    <label htmlFor="no-feedback" className="text-sm text-neutral-600">Tidak ada umpan balik khusus</label>
                                                </div>
                                            </div>
                                        )}
                                    </form>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-2 h-fit sticky top-24">
                            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
                                <div className="flex items-center gap-3 border-b border-neutral-200 pb-3">
                                    <span className="text-2xl">🤖</span>
                                    <h2 className="text-lg font-bold text-neutral-800">Analisis AI</h2>
                                </div>
                                {typeof aiResponse === 'object' && aiResponse !== null ? (
                                    <div className="space-y-5">
                                        <AiAnalysisSection icon="📄" title="Ringkasan Masalah" content={aiResponse['Ringkasan Masalah']} />
                                        <AiAnalysisSection icon="🔍" title="Identifikasi Penyebab" content={aiResponse['Identifikasi Kemungkinan Penyebab']} />
                                        <AiAnalysisSection icon="🛠️" title="Rekomendasi Tindakan" content={aiResponse['Rekomendasi Tindakan Perbaikan']} />
                                        <div><h4 className="text-base font-semibold text-neutral-700 flex items-center gap-2 mb-2"><span className="text-xl">💰</span> Estimasi Biaya</h4><div className="prose prose-sm text-neutral-800 max-w-none font-medium bg-blue-50 px-3 py-2 rounded-md border border-blue-200"><ReactMarkdown>{aiResponse['Estimasi Biaya Perbaikan'] || 'Tidak ada estimasi'}</ReactMarkdown></div></div>
                                        <div><h4 className="text-base font-semibold text-neutral-700 flex items-center gap-2 mb-2"><span className="text-xl">❗</span> Tingkat Urgensi</h4><span className={`capitalize text-xs font-bold px-3 py-1 rounded-full ${getUrgencyChip(aiResponse['Tingkat Urgensi'])}`}>{aiResponse['Tingkat Urgensi']}</span></div>
                                    </div>
                                ) : (
                                    <div className="text-center py-5"><p className="text-sm text-neutral-500">Analisis AI sedang diproses atau belum tersedia untuk laporan ini.</p></div>
                                )}
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
}

export default ReportDetailPage;