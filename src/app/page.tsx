import Link from "next/link";
import { ArrowRight, Box, Radio, ShieldCheck, Zap } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="flex min-h-screen flex-col bg-[#f8f7f6] selection:bg-blue-200">
            {/* Navbar */}
            <header className="fixed top-0 z-50 flex w-full items-center justify-between border-b border-neutral-200/50 bg-white/80 px-6 py-4 backdrop-blur-md">
                <div className="flex items-center gap-3 group cursor-pointer relative z-50">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                        <img src="/logo.png" alt="Packetworx" className="h-full w-full object-contain drop-shadow-sm" />
                    </div>
                    <div>
                        <span className="text-lg font-bold tracking-tight text-neutral-900 group-hover:text-blue-600 transition-colors">Packetworx</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
                        Sign In
                    </Link>
                    <Link href="/login" className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 transition-all flex items-center gap-2">
                        Get Started <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 pt-32 pb-16 px-6 relative overflow-hidden flex flex-col items-center text-center">
                {/* Background Decoration */}
                <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-30 blur-[100px] bg-gradient-to-tr from-blue-400 to-indigo-500 rounded-full" />
                
                <div className="animate-fade-in-up flex flex-col items-center">
                    <style dangerouslySetInnerHTML={{__html: `
                        @keyframes float {
                            0% { transform: translateY(0px); }
                            50% { transform: translateY(-12px); }
                            100% { transform: translateY(0px); }
                        }
                    `}} />
                    <div className="relative mb-6 flex h-28 w-28 items-center justify-center cursor-pointer group" style={{ animation: "float 4s ease-in-out infinite" }}>
                        <div className="absolute inset-0 scale-150 rounded-full bg-blue-500/20 blur-2xl animate-pulse group-hover:animate-none group-hover:bg-blue-500/30 transition-colors duration-500" />
                        <img src="/logo.png" alt="Logo" className="relative z-10 h-full w-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" />
                    </div>

                    <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-sm font-medium text-orange-600 mb-8 mt-2">
                        <Zap className="h-4 w-4" /> PWX Enterprise
                    </span>
                    <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-neutral-900 sm:text-7xl mb-8 leading-tight">
                        Intelligent Network <br className="hidden sm:block" /> 
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">Inventory Management</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-neutral-600 mb-10 leading-relaxed">
                        Streamline your infrastructure with the ultimate command center. Track gateways, manage components, monitor stock levels, and provision hardware instantly.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/login" className="w-full sm:w-auto rounded-xl bg-orange-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2">
                            Open Dashboard <ArrowRight className="h-5 w-5" />
                        </Link>
                        <Link href="/login" className="w-full sm:w-auto rounded-xl bg-white px-8 py-4 text-base font-bold text-neutral-700 border border-neutral-200 shadow-sm hover:bg-neutral-50 transition-all flex items-center justify-center">
                            Sign In to Account
                        </Link>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="mx-auto max-w-6xl mt-32 grid gap-8 sm:grid-cols-3">
                    <div className="rounded-2xl border border-neutral-200 bg-white/60 p-8 backdrop-blur-sm text-left shadow-sm hover:shadow-md transition-shadow">
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                            <Radio className="h-6 w-6" />
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-neutral-900">Gateway Tracking</h3>
                        <p className="text-neutral-600">Monitor thousands of LORAWAN gateways across multiple warehouses and client sites.</p>
                    </div>
                    <div className="rounded-2xl border border-neutral-200 bg-white/60 p-8 backdrop-blur-sm text-left shadow-sm hover:shadow-md transition-shadow">
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                            <Box className="h-6 w-6" />
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-neutral-900">Component Catalog</h3>
                        <p className="text-neutral-600">Maintain accurate counts of sensors, microcontrollers, and deployment hardware.</p>
                    </div>
                    <div className="rounded-2xl border border-neutral-200 bg-white/60 p-8 backdrop-blur-sm text-left shadow-sm hover:shadow-md transition-shadow">
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-neutral-900">Secure Requests</h3>
                        <p className="text-neutral-600">Role-based access ensures rigorous vetting for all stock withdrawal requests.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
