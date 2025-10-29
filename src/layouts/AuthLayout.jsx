// export default function AuthLayout({ children }) {
//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-amber-100">
//       <div className="flex flex-col items-center mb-6">
//         <img
//           src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
//           alt="Amazon Logo"
//           className="h-10 mb-2"
//         />
//       </div>
//       <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md border border-gray-200">
//         {children}
//       </div>
//     </div>
//   );
// }
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(180deg,#f8f8f8,transparent),linear-gradient(0deg,#ffffff,transparent)]">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center">
          <div className="text-2xl font-bold tracking-tight text-brand">shop<span className="text-gray-900">.x</span></div>
        </div>
        <div className="card p-8">
          {children}
        </div>
        <p className="text-center text-xs text-gray-500 mt-6">
          By continuing, you agree to our <span className="text-brand">Terms</span> and <span className="text-brand">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
