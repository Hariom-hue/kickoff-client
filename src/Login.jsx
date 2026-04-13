
function Login({ onLogin }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">

      <div className="bg-white p-8 rounded-xl shadow w-80">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 mb-4 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-4 rounded"
        />

        {/* 🔥 IMPORTANT CHANGE */}
        <button
          onClick={onLogin}
          className="w-full bg-black text-white py-2 rounded"
        >
          Login
        </button>

        <p className="text-sm mt-4 text-center">
          Don’t have an account? Signup
        </p>
      </div>

    </div>
  );
}

export default Login;

