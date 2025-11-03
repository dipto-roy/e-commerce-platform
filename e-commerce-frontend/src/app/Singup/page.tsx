"use client";
import React, { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { getUsersApiUrl } from "@/config/api";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: "USER",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    
    // Clear validation error when user starts typing
    if (validationErrors[id as keyof typeof validationErrors]) {
      setValidationErrors({ ...validationErrors, [id]: "" });
    }
    
    // Clear general error
    if (error) {
      setError("");
    }
  };

  // Vanilla JS Validation Functions
  const validateUsername = (username: string): string => {
    if (!username.trim()) return "Username is required";
    if (username.length < 3) return "Username must be at least 3 characters";
    if (username.length > 20) return "Username must be less than 20 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return "Username can only contain letters, numbers, and underscores";
    return "";
  };

  const validateFullName = (fullName: string): string => {
    if (!fullName.trim()) return "Full name is required";
    if (fullName.length < 2) return "Full name must be at least 2 characters";
    if (fullName.length > 50) return "Full name must be less than 50 characters";
    if (!/^[a-zA-Z\s]+$/.test(fullName)) return "Full name can only contain letters and spaces";
    return "";
  };

  const validateEmail = (email: string): string => {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password: string): string => {
    if (!password) return "Password is required";
    if (password.length < 10) return "Password must be at least 10 characters";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/\d/.test(password)) return "Password must contain at least one number";
    return "";
  };

  const validatePhone = (phone: string): string => {
    if (!phone.trim()) return "Phone number is required";
    if (!phone.startsWith("01")) return "Phone number must start with 01";
    if (phone.length < 11) return "Phone number must be at least 11 digits";
    if (!/^\d+$/.test(phone.substring(2))) return "Phone number can only contain digits";
    return "";
  };

  const validateForm = (): boolean => {
    const errors = {
      username: validateUsername(formData.username),
      fullName: validateFullName(formData.fullName),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      phone: validatePhone(formData.phone),
    };

    setValidationErrors(errors);

    // Return true if no errors
    return !Object.values(errors).some(error => error !== "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      // Send role values as uppercase since database enum expects uppercase
      const backendFormData = {
        ...formData,
        role: formData.role // Keep original uppercase values (USER, SELLER, ADMIN)
      };

      console.log("Sending data to backend:", backendFormData);

      const res = await axios.post(`${getUsersApiUrl()}/create`, backendFormData, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });

      const result = res.data as { username: string };
      
      // Show different messages based on role
      if (formData.role === "SELLER") {
        alert("Seller account created successfully! ✅\n\n" +
              "⚠️ IMPORTANT NOTICE: Your account requires admin approval before you can login.\n\n" +
              "📝 What happens next:\n" +
              "1. Admin will review your seller application\n" +
              "2. You'll be notified once approved\n" +
              "3. After approval, you can login to access your seller dashboard\n\n" +
              "💡 If you try to login before approval, you'll see an admin verification message.\n\n" +
              "Thank you for joining us, " + result.username + "!");
      } else {
        alert("Account created successfully! Welcome " + result.username);
      }

      // Reset form
      setFormData({
        username: "",
        fullName: "",
        email: "",
        password: "",
        phone: "",
        role: "USER",
      });
    } catch (err: any) {
      console.error("Signup error:", err);
      
      if (err.response) {
        // Backend responded with error status
        const errorData = err.response.data;
        console.log("Backend error response:", errorData);
        
        if (errorData.message && Array.isArray(errorData.message)) {
          setError("Validation errors: " + errorData.message.join(", "));
        } else {
          setError(errorData.message || `Error: ${err.response.status}`);
        }
      } else if (err.request) {
        // Network error - no response received
        setError("Cannot connect to server. Please check if the backend is running");
      } else {
        // Other error
        setError(err.message || "An error occurred during signup");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Create Account</h2>
          <p className="mt-2 text-gray-400">Sign up to get started with our store</p>
        </div>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className={`mt-2 w-full px-4 py-2 rounded-lg bg-gray-700 text-white border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                validationErrors.username ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {validationErrors.username && (
              <p className="text-red-400 text-xs mt-1">{validationErrors.username}</p>
            )}
          </div>

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-300">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={`mt-2 w-full px-4 py-2 rounded-lg bg-gray-700 text-white border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                validationErrors.fullName ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {validationErrors.fullName && (
              <p className="text-red-400 text-xs mt-1">{validationErrors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={`mt-2 w-full px-4 py-2 rounded-lg bg-gray-700 text-white border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                validationErrors.email ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {validationErrors.email && (
              <p className="text-red-400 text-xs mt-1">{validationErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={`mt-2 w-full px-4 py-2 rounded-lg bg-gray-700 text-white border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                validationErrors.password ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {validationErrors.password && (
              <p className="text-red-400 text-xs mt-1">{validationErrors.password}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">Minimum 10 characters with at least one uppercase, lowercase letter and number</p>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
              Phone
            </label>
            <input
              type="text"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number (must start with 01)"
              className={`mt-2 w-full px-4 py-2 rounded-lg bg-gray-700 text-white border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                validationErrors.phone ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {validationErrors.phone && (
              <p className="text-red-400 text-xs mt-1">{validationErrors.phone}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">Phone must start with 01</p>
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-300">
              Role
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-2 w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="USER">User</option>
              <option value="SELLER">Seller</option>
              
            </select>
          </div>

          {/* Seller Verification Notice */}
          {formData.role === "SELLER" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">⚠️ Seller Account Notice</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Admin approval required:</strong> Your account needs verification before login</li>
                      <li><strong>Cannot login immediately:</strong> Wait for admin approval notification</li>
                      <li><strong>Verification process:</strong> Admin reviews and approves seller applications</li>
                      <li><strong>After approval:</strong> You'll be able to access your seller dashboard</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-400 hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
