"use client";
import React, { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { ShoppingBag, User, Store, Check, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { getUsersApiUrl } from "@/config/api";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";

const ROLES = [
  { value: "USER", label: "Customer", icon: User, desc: "Browse & buy products" },
  { value: "SELLER", label: "Seller", icon: Store, desc: "List & sell products" },
];

export default function SignUpPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    username: "", fullName: "", email: "", password: "", phone: "", role: "USER",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    username: "", fullName: "", email: "", password: "", phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    if (validationErrors[id as keyof typeof validationErrors]) {
      setValidationErrors({ ...validationErrors, [id]: "" });
    }
  };

  const validateUsername = (v: string) => {
    if (!v.trim()) return "Username is required";
    if (v.length < 3) return "At least 3 characters";
    if (v.length > 20) return "Max 20 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(v)) return "Letters, numbers & underscores only";
    return "";
  };
  const validateFullName = (v: string) => {
    if (!v.trim()) return "Full name is required";
    if (v.length < 2) return "At least 2 characters";
    if (!/^[a-zA-Z\s]+$/.test(v)) return "Letters and spaces only";
    return "";
  };
  const validateEmail = (v: string) => {
    if (!v.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Valid email required";
    return "";
  };
  const validatePassword = (v: string) => {
    if (!v) return "Password is required";
    if (v.length < 10) return "At least 10 characters";
    if (!/[a-z]/.test(v)) return "Include a lowercase letter";
    if (!/[A-Z]/.test(v)) return "Include an uppercase letter";
    if (!/\d/.test(v)) return "Include a number";
    return "";
  };
  const validatePhone = (v: string) => {
    if (!v.trim()) return "Phone is required";
    if (!v.startsWith("01")) return "Must start with 01";
    if (v.length < 11) return "At least 11 digits";
    if (!/^\d+$/.test(v)) return "Digits only";
    return "";
  };

  const validateForm = () => {
    const errors = {
      username: validateUsername(formData.username),
      fullName: validateFullName(formData.fullName),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      phone: validatePhone(formData.phone),
    };
    setValidationErrors(errors);
    return !Object.values(errors).some(e => e !== "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${getUsersApiUrl()}/create`, formData, {
        headers: { "Content-Type": "application/json", Accept: "application/json" },
      });
      const result = res.data as { username: string };

      if (formData.role === "SELLER") {
        addToast(
          "Seller accounts need admin approval before login. You'll be notified once your application is reviewed.",
          "warning"
        );
        setFormData({ username: "", fullName: "", email: "", password: "", phone: "", role: "USER" });
      } else {
        // Auto-login after registration — Facebook-style flow
        addToast(`Welcome, ${result.username}! Your account is ready. You can now sign in.`, "success");
        router.push("/login");
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string | string[] } }; request?: unknown; message?: string };
      if (axiosErr.response?.data?.message) {
        const msg = axiosErr.response.data.message;
        addToast(Array.isArray(msg) ? msg.join(", ") : msg, "error");
      } else if (axiosErr.request) {
        addToast("Cannot connect to server. Please check your connection.", "error");
      } else {
        addToast(axiosErr.message || "An error occurred", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div
        className="hidden md:flex flex-col justify-between w-5/12 p-12 text-white"
        style={{ background: 'linear-gradient(160deg, var(--accent-600) 0%, var(--accent-800) 100%)' }}
      >
        <div className="flex items-center gap-2 text-xl font-bold">
          <ShoppingBag className="w-6 h-6" />
          ShopNest
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-3 leading-tight">
            Start selling or<br />shopping today
          </h2>
          <p className="text-white/70 text-sm mb-8">
            Create your free account and join thousands of users on ShopNest.
          </p>
          <ul className="space-y-3">
            {["Free to join — no hidden fees", "Seller dashboard with analytics", "Secure payments & buyer protection"].map(f => (
              <li key={f} className="flex items-center gap-3 text-sm text-white/90">
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-white/40 text-xs">© {new Date().getFullYear()} ShopNest</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-[var(--bg-tertiary)] overflow-y-auto">
        <div className="flex items-center gap-2 mb-6 md:hidden font-bold text-xl" style={{ color: 'var(--accent-600)' }}>
          <ShoppingBag className="w-5 h-5" />
          ShopNest
        </div>

        <div className="w-full max-w-md">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Create account</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Fill in the details to get started</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {ROLES.map(({ value, label, icon: Icon, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFormData({ ...formData, role: value })}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  formData.role === value
                    ? 'border-[var(--accent-500)] bg-[var(--accent-50)]'
                    : 'border-[var(--border)] bg-white hover:border-[var(--accent-200)]'
                }`}
              >
                <Icon className={`w-5 h-5 mb-2 ${formData.role === value ? 'text-[var(--accent-600)]' : 'text-[var(--text-muted)]'}`} />
                <p className={`font-semibold text-sm ${formData.role === value ? 'text-[var(--accent-700)]' : 'text-[var(--text-primary)]'}`}>{label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
              </button>
            ))}
          </div>

          {/* Seller notice */}
          {formData.role === "SELLER" && (
            <div className="alert alert-warning mb-5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong>Seller accounts need admin approval</strong> before login.
                You&apos;ll be notified once your application is reviewed.
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row: username + fullName */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="input-group">
                <label htmlFor="username" className="label">Username</label>
                <input id="username" type="text" value={formData.username} onChange={handleChange}
                  className={`input ${validationErrors.username ? 'input-error' : ''}`}
                  placeholder="e.g. john_doe" />
                {validationErrors.username && <p className="field-error">{validationErrors.username}</p>}
              </div>
              <div className="input-group">
                <label htmlFor="fullName" className="label">Full Name</label>
                <input id="fullName" type="text" value={formData.fullName} onChange={handleChange}
                  className={`input ${validationErrors.fullName ? 'input-error' : ''}`}
                  placeholder="John Doe" />
                {validationErrors.fullName && <p className="field-error">{validationErrors.fullName}</p>}
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="email" className="label">Email Address</label>
              <input id="email" type="email" value={formData.email} onChange={handleChange}
                className={`input ${validationErrors.email ? 'input-error' : ''}`}
                placeholder="you@example.com" autoComplete="email" />
              {validationErrors.email && <p className="field-error">{validationErrors.email}</p>}
            </div>

            <div className="input-group">
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} value={formData.password}
                  onChange={handleChange}
                  className={`input pr-10 ${validationErrors.password ? 'input-error' : ''}`}
                  placeholder="Min 10 chars, upper, lower, number" autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} tabIndex={-1}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {validationErrors.password && <p className="field-error">{validationErrors.password}</p>}
            </div>

            <div className="input-group">
              <label htmlFor="phone" className="label">Phone Number</label>
              <input id="phone" type="text" value={formData.phone} onChange={handleChange}
                className={`input ${validationErrors.phone ? 'input-error' : ''}`}
                placeholder="01XXXXXXXXX" maxLength={15} />
              {validationErrors.phone && <p className="field-error">{validationErrors.phone}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-full btn-lg">
              {loading ? <><span className="spinner" /> Creating account…</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: 'var(--accent-600)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
