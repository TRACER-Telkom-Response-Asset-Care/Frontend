import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../apiClient";

function EmployeeDashboard() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const userData = JSON.parse(localStorage.getItem("userData"));

  useEffect(() => {
    const fetchReports = async () => {
      try {
   
        const response = await apiClient.get("/api/reports", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        setReports(response.data);
      } catch (err) {
        setError("Gagal memuat laporan. Silakan coba lagi nanti.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const getStatusChip = (status) => {
    switch (status.toLowerCase()) {
      case "terkirim":
        return "bg-blue-100 text-blue-800";
      case "diproses":
      case "dalam pengerjaan":
        return "bg-yellow-100 text-yellow-800";
      case "selesai":
        return "bg-green-100 text-green-800";
      case "ditolak":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="px-4 py-3 bg-white/80 backdrop-blur border-b border-neutral-200">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="src\assets\TRACERLOGO.png" alt="Tracer Logo" className="size-9 object-contain" />
            <div>
              <h1 className="text-base font-semibold leading-tight">Dasbor Karyawan</h1>
              <p className="text-xs text-neutral-500">Selamat datang, {userData?.name || "Pengguna"}!</p>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="text-sm font-medium text-red-600 hover:underline"
          >
            Keluar
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Riwayat Laporan Anda</h2>
          <Link
            to="/create-report"
            className="bg-red-600 text-white font-medium py-2 px-4 rounded-xl active:scale-[.99]"
          >
            Buat Laporan Baru
          </Link>
        </div>

        {isLoading ? (
          <p>Memuat laporan...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Jenis Aset</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                  <th className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {reports.length > 0 ? (
                  reports.map((report) => (
                    <tr key={report.id}>
                      <td className="px-6 py-4 text-sm font-medium text-neutral-900">#{report.id}</td>
                      <td className="px-6 py-4 text-sm text-neutral-500">{report.item_type}</td>
                      <td className="px-6 py-4 text-sm text-neutral-500">{new Date(report.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusChip(report.status)}`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <Link to={`/report/${report.id}`} className="text-red-600 hover:text-red-900">
                          Lihat Detail
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-neutral-500">
                      Anda belum membuat laporan apapun.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default EmployeeDashboard;