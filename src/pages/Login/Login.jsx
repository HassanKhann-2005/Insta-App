import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { loginUser } from '../../app/features/auth/authSlice';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [value, setValue] = useState({
    email: '', // used as identifier field (email or username)
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  console.log(value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = await dispatch(loginUser(value));
    if (loginUser.fulfilled.match(action)) {
      setValue({ email: '', password: '' });
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Login successful!',
        confirmButtonText: 'OK',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/'); // Redirect to home or dashboard
        }
      });
    } else {
      const message = action.payload || 'Login failed';
      Swal.fire({ icon: 'error', title: 'Error', text: message });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="bg-[#262626] p-8 rounded-lg shadow-md w-full max-w-sm">
        {/* Instagram Logo */}
        <h1 className="text-white text-3xl font-bold text-center mb-6 font-lobster">
          Instagram
        </h1>
        {/* Login Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="email"
            value={value.email}
            onChange={handleChange}
            placeholder="Phone number, username, or email"
            className="w-full p-2 bg-[#333333] border border-gray-600 rounded-md text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={value.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full p-2 pr-10 bg-[#333333] border border-gray-600 rounded-md text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-2 flex items-center text-gray-300 hover:text-white"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <AiOutlineEyeInvisible size={20} />
              ) : (
                <AiOutlineEye size={20} />
              )}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded-md text-sm font-semibold hover:bg-blue-600 transition"
          >
            Log In
          </button>
        </form>
        {/* Forgot Password and Sign Up Link */}
        <div className="mt-4 text-center text-sm text-gray-300">
          <a href="#" className="text-blue-400 hover:underline">
            Forgot password?
          </a>
          <p className="mt-2">
            Don't have an account?{' '}
            <a href="/users/register" className="text-blue-400 font-semibold hover:underline">
              Sign up
            </a>
          </p>
        </div>
        {/* Divider */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-300">
            <div className="h-px bg-gray-600 w-1/4"></div>
            <span>OR</span>
            <div className="h-px bg-gray-600 w-1/4"></div>
          </div>
          {/* Facebook Login Button */}
          <button
            className="mt-4 flex items-center justify-center w-full p-2 text-blue-400 font-semibold text-sm hover:underline"
            onClick={() => alert('Facebook login not implemented')}
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
            </svg>
            Log in with Facebook
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;