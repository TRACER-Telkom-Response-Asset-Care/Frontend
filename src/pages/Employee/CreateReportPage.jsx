import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../../apiClient";

function CreateReportPage() {
  const [itemType, setItemType] = useState("");
  const [description, setDescription] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!itemType || !description) {
      setAlert({ message: "Jenis barang dan deskripsi wajib diisi.", type: "error" });
      return;
    }
    setIsLoading(true);
    setAlert({ message: "", type: "" });

    const formData = new FormData();
    formData.append("item_type", itemType);
    formData.append("description", description);
    mediaFiles.forEach(file => formData.append("media[]", file));

    try {
      await apiClient.post("/api/reports", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      setAlert({ message: "Laporan berhasil dikirim! Mengarahkan ke dashboard...", type: "success" });
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error) {
      setAlert({ message: error.response?.data?.message || "Gagal mengirim laporan.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="px-4 py-3 bg-white/80 backdrop-blur border-b border-neutral-200">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <img src="src\assets\TRACERLOGO.png" alt="Tracer Logo" className="size-9" />
          <h1 className="text-base font-semibold leading-tight">Buat Laporan Kerusakan Baru</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        {alert.message && (
          <div className={`mb-4 rounded-xl border text-sm p-3 ${alert.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
            {alert.message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-lg space-y-4">
          <div>
            <label htmlFor="itemType" className="block text-sm font-medium mb-1">Pilih Jenis Aset</label>
            <select id="itemType" value={itemType} onChange={(e) => setItemType(e.target.value)} required className="w-full rounded-xl border-neutral-200 focus:ring-red-500/40">
              <option value="" disabled>Pilih salah satu...</option>
              <option value="AC">AC</option>
              <option value="Kipas Angin">Kipas Angin</option>
              <option value="Proyektor">Proyektor</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">Deskripsikan Kerusakan</label>
            <textarea id="description" rows="4" placeholder="Contoh: AC tidak dingin, hanya mengeluarkan angin." required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-xl border-neutral-200 focus:ring-red-500/40"></textarea>
          </div>
          <div>
            <label htmlFor="media" className="block text-sm font-medium mb-1">Unggah Bukti (Foto/Video)</label>
            <input id="media" type="file" multiple onChange={(e) => setMediaFiles(Array.from(e.target.files))} className="w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100" />
            <p className="mt-1 text-xs text-neutral-500">Anda dapat memilih lebih dari satu file.</p>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <Link to="/dashboard" className="text-sm font-medium text-neutral-600 hover:underline">Batal</Link>
            <button type="submit" disabled={isLoading} className="bg-red-600 text-white font-medium py-2 px-6 rounded-xl active:scale-[.99] disabled:bg-red-300">
              {isLoading ? "Mengirim..." : "Kirim Laporan"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default CreateReportPage;