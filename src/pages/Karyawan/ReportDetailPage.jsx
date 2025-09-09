import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import apiClient from "../../apiClient";

function ReportDetailPage() {
  const { reportId } = useParams(); // Gets the ID from the URL (e.g., /report/123)
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportDetails = async () => {
      try {
        const response = await apiClient.get(`/api/reports/${reportId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        setReport(response.data);
      } catch (err) {
        setError("Gagal memuat detail laporan. Mungkin laporan tidak ditemukan.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportDetails();
  }, [reportId]);
  
  const getStatusChip = (status) => {
    // This function can be moved to a shared utils file
    switch (status?.toLowerCase()) {
      case "terkirim": return "bg-blue-100 text-blue-800";
      case "diproses": case "dalam pengerjaan": return "bg-yellow-100 text-yellow-800";
      case "selesai": return "bg-green-100 text-green-800";
      case "ditolak": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) return <p className="text-center mt-10">Memuat detail laporan...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;
  if (!report) return <p className="text-center mt-10">Laporan tidak ditemukan.</p>;

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="px-4 py-3 bg-white/80 backdrop-blur border-b border-neutral-200">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link to="/karyawandashboard" className="text-red-600 hover:underline text-sm">← Kembali ke Dasbor</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Report Details */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">Detail Laporan #{report.id}</h1>
                <p className="text-sm text-neutral-500">Diajukan pada {new Date(report.created_at).toLocaleString()}</p>
              </div>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusChip(report.status)}`}>
                {report.status}
              </span>
            </div>
          </div>
          <div className="border-t border-neutral-200 pt-4">
            <h3 className="font-semibold mb-2">Informasi Aset</h3>
            <p><span className="text-neutral-500">Jenis Aset:</span> {report.item_type}</p>
          </div>
          <div className="border-t border-neutral-200 pt-4">
            <h3 className="font-semibold mb-2">Deskripsi Kerusakan</h3>
            <p className="text-neutral-700 whitespace-pre-wrap">{report.description}</p>
          </div>
           {report.media && report.media.length > 0 && (
            <div className="border-t border-neutral-200 pt-4">
              <h3 className="font-semibold mb-2">Bukti Media</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {report.media.map((file, index) => (
                  <a key={index} href={file.url} target="_blank" rel="noopener noreferrer">
                    <img src={file.url} alt={`Bukti ${index + 1}`} className="rounded-lg object-cover w-full h-32 hover:opacity-80 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Analysis */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 h-fit">
           <h2 className="text-lg font-bold border-b pb-2">🤖 Analisis AI</h2>
           <div>
              <h4 className="font-semibold text-sm">Kemungkinan Diagnosis</h4>
              <p className="text-sm text-neutral-600">{report.ai_analysis?.diagnosis || "Tidak ada diagnosis."}</p>
           </div>
           <div>
              <h4 className="font-semibold text-sm">Rekomendasi Tindakan</h4>
              <p className="text-sm text-neutral-600">{report.ai_analysis?.recommendation || "Tidak ada rekomendasi."}</p>
           </div>
           <div>
              <h4 className="font-semibold text-sm">Perkiraan Biaya Suku Cadang</h4>
              <p className="text-lg font-bold text-red-600">{report.ai_analysis?.estimated_cost ? `Rp ${Number(report.ai_analysis.estimated_cost).toLocaleString('id-ID')}` : "N/A"}</p>
           </div>
        </div>
      </main>
    </div>
  );
}

export default ReportDetailPage;