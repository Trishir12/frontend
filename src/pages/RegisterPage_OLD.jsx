// import { useState } from "react";
// import axios from "axios";
// import { useNavigate, Link } from "react-router-dom";
// import AuthLayout from "../layouts/AuthLayout";
//
// export default function RegisterPage() {
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//     role: "END_USER",
//   });
//   const navigate = useNavigate();
//   const [error, setError] = useState("");
//
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.post(`${import.meta.env.VITE_USER_SERVICE_URL}/auth/register`, form);
//       navigate("/login");
//     } catch {
//       setError("Registration failed. Try again.");
//     }
//   };
//
//   return (
//     <AuthLayout>
//       <h2 className="text-xl font-semibold mb-4 text-gray-800">Create Account</h2>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <input
//           type="text"
//           placeholder="Name"
//           className="w-full p-2 border border-gray-300 rounded focus:ring focus:ring-amber-300"
//           value={form.name}
//           onChange={(e) => setForm({ ...form, name: e.target.value })}
//           required
//         />
//         <input
//           type="email"
//           placeholder="Email"
//           className="w-full p-2 border border-gray-300 rounded focus:ring focus:ring-amber-300"
//           value={form.email}
//           onChange={(e) => setForm({ ...form, email: e.target.value })}
//           required
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           className="w-full p-2 border border-gray-300 rounded focus:ring focus:ring-amber-300"
//           value={form.password}
//           onChange={(e) => setForm({ ...form, password: e.target.value })}
//           required
//         />
//
//         <select
//           className="w-full p-2 border border-gray-300 rounded"
//           value={form.role}
//           onChange={(e) => setForm({ ...form, role: e.target.value })}
//         >
//           <option value="END_USER">Customer</option>
//           <option value="MERCHANT">Merchant</option>
//         </select>
//
//         {error && <p className="text-red-500 text-sm">{error}</p>}
//
//         <button
//           type="submit"
//           className="w-full bg-amber-400 hover:bg-amber-500 text-white font-semibold py-2 rounded"
//         >
//           Continue
//         </button>
//       </form>
//
//       <p className="text-sm text-center mt-4">
//         Already have an account?{" "}
//         <Link to="/login" className="text-blue-600 hover:underline">
//           Sign in
//         </Link>
//       </p>
//     </AuthLayout>
//   );
// }
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "END_USER",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const onChange = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await axios.post(`${import.meta.env.VITE_USER_SERVICE_URL}/auth/register`, form);
      navigate("/login", { replace: true });
    } catch (err) {
      setError(
        err?.response?.data ||
        err?.message ||
        "Registration failed. Try again."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="auth-title mb-6">Create your account</h1>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {String(error)}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label">Full name</label>
          <input value={form.name} onChange={onChange("name")} required className="w-full" />
        </div>
        <div>
          <label className="field-label">Email</label>
          <input type="email" value={form.email} onChange={onChange("email")} required className="w-full" />
        </div>
        <div>
          <label className="field-label">Password</label>
          <input type="password" value={form.password} onChange={onChange("password")} required className="w-full" />
        </div>

        <div>
          <label className="field-label">Role</label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 rounded border border-border px-3 py-2 cursor-pointer hover:bg-muted">
              <input type="radio" name="role" value="END_USER"
                     checked={form.role === "END_USER"}
                     onChange={onChange("role")} />
              <span>User</span>
            </label>
            <label className="flex items-center gap-2 rounded border border-border px-3 py-2 cursor-pointer hover:bg-muted">
              <input type="radio" name="role" value="MERCHANT"
                     checked={form.role === "MERCHANT"}
                     onChange={onChange("role")} />
              <span>Merchant</span>
            </label>
          </div>
        </div>

        <button className="btn w-full" disabled={busy}>
          {busy ? "Creating…" : "Create account"}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between">
        <span className="auth-note">Already have an account?</span>
        <Link to="/login" className="btn-secondary px-3 py-2 rounded">
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
