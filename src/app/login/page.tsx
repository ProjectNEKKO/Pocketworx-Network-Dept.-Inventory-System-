"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { login } from "@/lib/auth";
import "./login.css";

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Client-side lockout state
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [lockoutTime, setLockoutTime] = useState<number | null>(null);

    const MAX_FAILED_ATTEMPTS = 5;
    const LOCKOUT_DURATION_MS = 30000;

    useEffect(() => {
        if (lockoutTime && Date.now() < lockoutTime) {
            const timer = setTimeout(() => {
                setLockoutTime(null);
                setFailedAttempts(0);
            }, lockoutTime - Date.now());
            return () => clearTimeout(timer);
        }
    }, [lockoutTime]);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    });

    const onSubmit = async (data: LoginFormValues) => {
        if (lockoutTime && Date.now() < lockoutTime) {
            setError("root", {
                type: "manual",
                message: "Too many failed attempts. Please try again later.",
            });
            return;
        }

        setIsLoading(true);

        if (process.env.NODE_ENV === "development") {
            console.log("[AUTH DEBUG] Attempting login:", { email: data.email, password: data.password });
        }

        try {
            await login(data.email, data.password);

            if (data.rememberMe) {
                // UI hint only; the real secure JWT cookie handles persistence securely now
                localStorage.setItem("pwx_remember_me", "true");
            }

            router.push("/dashboard");
        } catch (error: unknown) {
            const newAttempts = failedAttempts + 1;
            setFailedAttempts(newAttempts);

            if (newAttempts >= MAX_FAILED_ATTEMPTS) {
                setLockoutTime(Date.now() + LOCKOUT_DURATION_MS);
            }

            // Standard generic error response but pass rate limit messages through
            const errorMessage = error instanceof Error 
                ? error.message 
                : "Invalid credentials";

            setError("root", {
                type: "manual",
                message: errorMessage,
            });
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full font-display login-theme overflow-hidden">
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary/10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-primary/40 opacity-90 z-10"></div>
                <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAYupUCNGKaEB2y7oNyI-Vx_jSpbk6ZrIM2zndWYcI-Ys72LAiggd-4M2Ekc62hLXmaHRuYFShuI5-EZpkV92dLMRaMkqFi_03mmZ9XpBigvwHzsxzhewEp9R_0JDZ_xp397AjgO87LTX0Zz6RrbXW8jrbmjJ6dvNYhu64fB2KvNVgDlElTi_0iRTvMAzSo3mmH97UYtRmDksFA8FRI6WoOMRm0R0-A5FAJRaNiZpjn8UC6BMz5aemY7rQZYOwt8JGbYShiFN9luRE')" }}></div>
                <div className="relative z-20 flex flex-col justify-between p-16 w-full text-white">
                    <div className="flex items-center gap-3 animate-fade-in-up delay-100">
                        <div className="size-10 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-3xl">flare</span>
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">Packetworx Inc.</h2>
                    </div>
                    <div className="max-w-md animate-fade-in-up delay-200">
                        <h1 className="text-5xl font-extrabold leading-tight mb-6">WE CONNECT THINGS</h1>
                        <p className="text-lg text-white/80 font-medium">Leverage the power of Internet of Things with LORAWAN® connectivity and devices.</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/60 animate-fade-in-up delay-300">
                        <p>© 2026 Packetworx Inc. Technology Hub</p>
                        <span className="size-1 bg-white/40 rounded-full"></span>
                        <p>Terms of Service</p>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 md:p-16 lg:p-24" style={{ backgroundColor: '#f8f7f6' }}>
                <div className="w-full max-w-md">
                    <div className="lg:hidden flex items-center gap-3 mb-12 animate-fade-in-up delay-100">
                        <div className="size-10 bg-primary rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-2xl">flare</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Packetworx</h2>
                    </div>

                    <div className="space-y-4 mb-10 animate-fade-in-up delay-100">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
                        <p className="text-slate-500 text-lg">Please enter your credentials to access your account.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-fade-in-up delay-200">
                        {errors.root && (
                            <div className="p-3 rounded-xl bg-red-100 text-red-600 text-sm font-medium border border-red-200 text-center animate-fade-in-up">
                                {errors.root.message}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1" htmlFor="email">Email address</label>
                            <div className="relative group">
                                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${errors.email ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary'}`}>
                                    <span className="material-symbols-outlined text-xl">mail</span>
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    {...register("email")}
                                    autoComplete="username"
                                    className={`w-full pl-11 pr-4 py-4 bg-slate-50 border rounded-xl focus:ring-2 outline-none transition-all text-slate-900 placeholder:text-slate-400 ${errors.email ? 'border-red-400 focus:ring-red-200 focus:border-red-500' : 'border-slate-200 focus:ring-primary/20 focus:border-primary'}`}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-500 text-xs font-medium ml-1 mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-bold text-slate-700" htmlFor="password">Password</label>
                                <a className="text-sm font-bold text-primary hover:text-primary/80 transition-colors" href="#">Forgot password?</a>
                            </div>
                            <div className="relative group">
                                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${errors.password ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary'}`}>
                                    <span className="material-symbols-outlined text-xl">lock</span>
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    {...register("password")}
                                    autoComplete="current-password"
                                    className={`w-full pl-11 pr-12 py-4 bg-slate-50 border rounded-xl focus:ring-2 outline-none transition-all text-slate-900 placeholder:text-slate-400 ${errors.password ? 'border-red-400 focus:ring-red-200 focus:border-red-500' : 'border-slate-200 focus:ring-primary/20 focus:border-primary'}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-primary transition-colors focus:outline-none"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        {showPassword ? "visibility_off" : "visibility"}
                                    </span>
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-xs font-medium ml-1 mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-3 py-2">
                            <input
                                id="rememberMe"
                                type="checkbox"
                                {...register("rememberMe")}
                                className="size-5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                            />
                            <label className="text-sm font-medium text-slate-600 cursor-pointer" htmlFor="rememberMe">Keep me logged in</label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !!lockoutTime}
                            className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100 disabled:cursor-not-allowed"
                        >
                            <span>{isLoading ? "Signing In…" : "Sign In"}</span>
                            {isLoading ? (
                                <span className="login-spinner"></span>
                            ) : (
                                <span className="material-symbols-outlined text-xl">arrow_forward</span>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
