"use client";

import { useState, useRef, useEffect } from "react";
import {
    User,
    Mail,
    ShieldCheck,
    Camera,
    Edit2,
    Check,
    X,
    Eye,
    EyeOff,
    KeyRound,
    UserCircle2,
    BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useClientRole } from "@/lib/use-client-role";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";



export default function ProfilePage() {
    const { role: clientRole } = useClientRole();
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        role: "",
    });
    const [tempProfile, setTempProfile] = useState({ ...profile });
    const [image, setImage] = useState<string | null>(null);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [password, setPassword] = useState({ current: "", newPw: "", confirm: "" });
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch profile data on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    
                    // Normalize role for display (capitalize it)
                    const displayRole = data.role 
                        ? data.role.split('-').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join('-') 
                        : "User";

                    const updatedProfile = {
                        name: data.name || "User",
                        email: data.email,
                        role: displayRole,
                    };
                    setProfile(updatedProfile);
                    setTempProfile(updatedProfile);
                }
            } catch (err) {
                console.error("Failed to fetch profile:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);


    const initials = (profile.name || "??")
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const roleToUpdate = tempProfile.role !== profile.role ? tempProfile.role : undefined;
            const nameToUpdate = tempProfile.name !== profile.name ? tempProfile.name : undefined;

            if (!roleToUpdate && !nameToUpdate) {
                setIsEditing(false);
                setIsLoading(false);
                return;
            }

            const res = await fetch(`/api/users/${encodeURIComponent(profile.email)}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: nameToUpdate,
                    role: roleToUpdate,
                }),
            });

            if (res.ok) {
                setProfile({ ...tempProfile });
                toast.success("Profile updated successfully");
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to update profile");
            }
        } catch (error) {
            console.error("Failed to update profile", error);
            toast.error("Failed to update profile");
        } finally {
            setIsEditing(false);
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setTempProfile({ ...profile });
        setIsEditing(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setImage(URL.createObjectURL(file));
    };

    return (
        <div className="max-w-2xl mx-auto py-4 pb-16 space-y-8">

            {/* Page heading */}
            <div>
                <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">User Profile</h1>
                <p className="text-sm text-neutral-500 mt-0.5">Manage your name, email, password, and role.</p>
            </div>

            {/* ── PROFILE CARD ───────────────────────────────── */}
            <div className="bg-white border border-neutral-100 rounded-3xl shadow-sm overflow-hidden">

                {/* Top banner */}
                <div className="relative h-28 bg-black overflow-hidden">
                    <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-blue-500/20 blur-2xl" />
                    <div className="absolute -bottom-8 left-12 h-32 w-32 rounded-full bg-indigo-500/25 blur-2xl" />
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
                            backgroundSize: "24px 24px",
                        }}
                    />
                </div>

                {/* Avatar row */}
                <div className="px-8 -mt-12 mb-6 flex items-end justify-between">
                    <div className="relative group">
                        <div className="h-24 w-24 rounded-2xl ring-4 ring-white shadow-xl bg-gradient-to-br from-amber-500 to-orange-500 overflow-hidden flex items-center justify-center">
                            {image ? (
                                <img src={image} alt="avatar" className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-3xl font-black text-white select-none">{initials}</span>
                            )}
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-1.5 -right-1.5 h-8 w-8 flex items-center justify-center rounded-xl bg-white border border-neutral-100 shadow-md text-amber-600 hover:bg-amber-50 transition-all hover:scale-110"
                        >
                            <Camera className="h-3.5 w-3.5" />
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </div>

                    {/* Edit / Save buttons */}
                    <div className="flex gap-2 pb-1">
                        {isLoading ? (
                            <Skeleton className="h-9 w-28 rounded-xl" />
                        ) : !isEditing ? (
                            <Button
                                onClick={() => setIsEditing(true)}
                                className="bg-black hover:bg-neutral-800 text-white h-9 px-4 rounded-xl font-bold text-sm gap-2 shadow-sm transition-all hover:-translate-y-0.5"
                            >
                                <Edit2 className="h-3.5 w-3.5" /> Edit Profile
                            </Button>
                        ) : (
                            <>
                                <Button
                                    onClick={handleCancel}
                                    variant="outline"
                                    className="h-9 px-4 rounded-xl border-neutral-200 text-neutral-600 text-sm gap-2"
                                >
                                    <X className="h-3.5 w-3.5" /> Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-4 rounded-xl font-bold text-sm gap-2 shadow-sm transition-all hover:-translate-y-0.5"
                                >
                                    <Check className="h-3.5 w-3.5" /> Save
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* ── Fields ── */}
                <div className="px-8 pb-8 space-y-6">

                    {/* Name */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                            <User className="h-3.5 w-3.5" /> Full Name
                        </label>
                        {isLoading ? (
                            <Skeleton className="h-11 rounded-xl" />
                        ) : isEditing ? (
                            <Input
                                value={tempProfile.name}
                                onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                                className="h-11 rounded-xl border-neutral-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-semibold"
                            />
                        ) : (
                            <div className="h-11 flex items-center px-4 rounded-xl bg-neutral-50 border border-neutral-100 font-semibold text-neutral-900 text-sm">
                                {profile.name}
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                            <Mail className="h-3.5 w-3.5" /> Email Address
                        </label>
                        {isLoading ? (
                            <Skeleton className="h-11 rounded-xl" />
                        ) : isEditing ? (
                            <Input
                                value={tempProfile.email}
                                onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                                className="h-11 rounded-xl border-neutral-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-semibold"
                            />
                        ) : (
                            <div className="h-11 flex items-center gap-3 px-4 rounded-xl bg-neutral-50 border border-neutral-100 text-sm">
                                <span className="flex-1 text-neutral-600 font-medium truncate">{profile.email}</span>
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-bold uppercase shrink-0">
                                    <BadgeCheck className="h-3 w-3" /> Verified
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                            <ShieldCheck className="h-3.5 w-3.5" /> Role
                        </label>
                        {isLoading ? (
                            <Skeleton className="h-11 rounded-xl" />
                        ) : isEditing && clientRole === "admin" ? (
                            <Select
                                value={tempProfile.role}
                                onValueChange={(value) => setTempProfile({ ...tempProfile, role: value })}
                            >
                                <SelectTrigger className="w-full h-11 rounded-xl border-neutral-200 font-semibold text-neutral-900 bg-white">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border border-neutral-100 shadow-xl bg-white text-neutral-900">
                                    <SelectItem value="Admin" className="cursor-pointer focus:bg-neutral-50">Admin</SelectItem>
                                    <SelectItem value="Co-Admin" className="cursor-pointer focus:bg-neutral-50">Co-Admin</SelectItem>
                                    <SelectItem value="User" className="cursor-pointer focus:bg-neutral-50">User</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="h-11 flex items-center gap-3 px-4 rounded-xl bg-neutral-50 border border-neutral-100">
                                <Badge className={`${profile.role === "Admin" ? "bg-red-100 text-red-700 border-red-200 hover:bg-red-100" : profile.role === "Co-Admin" ? "bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-100" : "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100"} font-semibold text-xs px-2.5 py-0.5 gap-1`}>
                                    <ShieldCheck className="h-3 w-3" /> {profile.role || "User"}
                                </Badge>
                            </div>
                        )}
                    </div>

                    <Separator className="bg-neutral-100" />

                    {/* Change Password */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <KeyRound className="h-4 w-4 text-neutral-400" />
                            <p className="text-sm font-bold text-neutral-800">Change Password</p>
                        </div>

                        <div className="space-y-3">
                            <PasswordInput
                                label="Current Password"
                                value={password.current}
                                show={showCurrent}
                                onToggle={() => setShowCurrent(!showCurrent)}
                                onChange={(v) => setPassword({ ...password, current: v })}
                                placeholder="Enter current password"
                            />
                            <PasswordInput
                                label="New Password"
                                value={password.newPw}
                                show={showNew}
                                onToggle={() => setShowNew(!showNew)}
                                onChange={(v) => setPassword({ ...password, newPw: v })}
                                placeholder="Enter new password"
                            />
                            <PasswordInput
                                label="Confirm New Password"
                                value={password.confirm}
                                show={showConfirm}
                                onToggle={() => setShowConfirm(!showConfirm)}
                                onChange={(v) => setPassword({ ...password, confirm: v })}
                                placeholder="Re-enter new password"
                            />
                        </div>

                        <Button className="bg-black hover:bg-neutral-800 text-white h-10 px-5 rounded-xl font-bold text-sm gap-2 shadow-sm mt-1">
                            <KeyRound className="h-4 w-4" /> Update Password
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Password Input helper ── */
function PasswordInput({
    label,
    value,
    show,
    onToggle,
    onChange,
    placeholder,
}: {
    label: string;
    value: string;
    show: boolean;
    onToggle: () => void;
    onChange: (v: string) => void;
    placeholder: string;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">{label}</label>
            <div className="relative">
                <Input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="h-11 border-neutral-200 rounded-xl pr-11 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-medium text-sm"
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
        </div>
    );
}
