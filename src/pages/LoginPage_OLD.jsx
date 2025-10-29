//
// import { useState } from "react";
// import axios from "axios";
// import { useAuth } from "../context/AuthContext";
// import { useNavigate, Link } from "react-router-dom";
// import AuthLayout from "../layouts/AuthLayout";
//
// export default function LoginPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [busy, setBusy] = useState(false);
//   const navigate = useNavigate();
//
//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");
//     setBusy(true);
//     try {
//       const res = await axios.post(
//         `${import.meta.env.VITE_USER_SERVICE_URL}/auth/login`,
//         { email, password }
//       );
//
//       const access = res.data.access || res.data.accessToken;
//       const refresh = res.data.refresh || res.data.refreshToken;
//       if (!access) throw new Error("Access token missing");
//
//       localStorage.setItem("accessToken", access);
//       if (refresh) localStorage.setItem("refreshToken", refresh);
//
//       const validate = await axios.get(
//         `${import.meta.env.VITE_USER_SERVICE_URL}/auth/validate`,
//         { headers: { Authorization: `Bearer ${access}` } }
//       );
//
//       const role = validate.data.role;
//       if (role === "MERCHANT") navigate("/merchant/dashboard", { replace: true });
//       else navigate("/products", { replace: true });
//     } catch (err) {
//       setError(
//         err?.response?.data?.error ||
//         err?.response?.data ||
//         "Invalid email or password"
//       );
//     } finally {
//       setBusy(false);
//     }
//   };
//
//   return (
//     <AuthLayout>
//       <h1 className="auth-title mb-6">Sign in</h1>
//
//       {error && (
//         <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
//           {String(error)}
//         </div>
//       )}
//
//       <form onSubmit={handleLogin} className="space-y-4">
//         <div>
//           <label className="field-label">Email</label>
//           <input type="email" value={email}
//                  onChange={(e) => setEmail(e.target.value)} required className="w-full" />
//         </div>
//         <div>
//           <label className="field-label">Password</label>
//           <input type="password" value={password}
//                  onChange={(e) => setPassword(e.target.value)} required className="w-full" />
//         </div>
//         <button className="btn w-full" disabled={busy}>
//           {busy ? "Signing in…" : "Sign in"}
//         </button>
//       </form>
//
//       <div className="mt-6 flex items-center justify-between">
//         <span className="auth-note">New here?</span>
//         <Link to="/register" className="btn-secondary px-3 py-2 rounded">
//           Create account
//         </Link>
//       </div>
//     </AuthLayout>
//   );
// }
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ use context login

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      // ✅ context handles login + validation + saving everything
      const role = await login(email, password);

      // ✅ redirect based on role
      if (role === "MERCHANT") navigate("/merchant/dashboard", { replace: true });
      else navigate("/products", { replace: true });
    } catch (err) {
      console.error("❌ Login failed:", err);
      setError("Invalid email or password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="auth-title mb-6">Sign in</h1>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {String(error)}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="field-label">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full"
          />
        </div>
        <div>
          <label className="field-label">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full"
          />
        </div>
        <button className="btn w-full" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between">
        <span className="auth-note">New here?</span>
        <Link to="/register" className="btn-secondary px-3 py-2 rounded">
          Create account
        </Link>
      </div>
    </AuthLayout>
  );
}
