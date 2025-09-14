import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../apiClient";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [employeeID, setEmployeeID] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrors({});
    setAlert({ message: "", type: "" });
    try {
      const response = await apiClient.post("/api/login", {
        employee_id: employeeID,
        password: password,
      });

      console.log("Login berhasil:", response.data.user);

      login(response.data.access_token, response.data.user);

      setAlert({
        message: "Masuk berhasil! Mengarahkan ke dashboard...",
        type: "success",
      });

      setTimeout(() => {
        if (response.data.user.roles[0].name === "teknisi") {
          navigate("/teknisidashboard");
        } else if (response.data.user.roles[0].name === "superadmin") {
          navigate("/superadmindashboard");
        } else {
          navigate("/pegawaidashboard");
        }
      }, 1000)
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setAlert({ message: error.response.data.message, type: "error" });
        setErrors(error.response.data.errors);
      } else {
        setAlert({ message: "ID Pekerja atau kata sandi salah.", type: "error" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <header className="px-4 py-3 bg-white/80 backdrop-blur border-b border-neutral-200">
        <div className="flex items-center justify-center  gap-3">
          <div className="w-[240px] rounded-xl flex items-center justify-center">
            <img src="/TRACERLOGO.png" alt="Tracer Logo" />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-md mx-auto p-4">
          <div className="pt-6 text-center">
            <h2 className="text-2xl font-bold">Masuk</h2>
          </div>

          {alert.message && (
            <div
              className={`mt-4 rounded-xl border text-sm p-3 ${alert.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
                }`}
            >
              {alert.message}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-4 bg-white rounded-2xl p-8 shadow-lg space-y-8"
            noValidate
          >
            <div>
              <label
                htmlFor="employeeid"
                className="block text-sm font-medium mb-2"
              >
                ID Pekerja
              </label>
              <input
                id="employeeid"
                name="employeeid"
                type="text"
                autoComplete="username"
                placeholder="ID Pekerja"
                required
                value={employeeID}
                onChange={(e) => setEmployeeID(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/40"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
              >
                Kata sandi
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-2 my-1 px-3 rounded-lg text-sm text-neutral-600 hover:bg-neutral-100"
                >
                  {showPassword ? "Sembunyikan" : "Tampilkan"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 text-white font-medium py-2 rounded-xl active:scale-[.99] disabled:bg-red-300"
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
export default LoginPage;