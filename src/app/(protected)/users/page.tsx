"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Filter, Shield, MoreVertical, Trash2, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AddUserDialog, UserAccount } from "./add_user";
import { getRole } from "@/lib/auth";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const initialUsers: UserAccount[] = [
    { name: "Admin Setup", email: "admin@pwx.system", role: "Co-Admin", status: "Active" },
    { name: "John Doe", email: "john@example.com", role: "User", status: "Active" },
    { name: "Jane Smith", email: "jane@example.com", role: "User", status: "Inactive" },
];

export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<UserAccount[]>(initialUsers);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<"All" | "Co-Admin" | "User">("All");

    useEffect(() => {
        if (getRole() !== "admin") {
            router.replace("/");
        }
    }, [router]);

    if (getRole() !== "admin") return null;

    const handleAddUser = (newUser: UserAccount) => {
        setUsers((prev) => [...prev, newUser]);
    };

    const handleDeleteUser = (email: string) => {
        setUsers((prev) => prev.filter((u) => u.email !== email));
    };

    const handleEditRole = (email: string) => {
        setUsers((prev) =>
            prev.map((u) =>
                u.email === email
                    ? { ...u, role: u.role === "Co-Admin" ? "User" : "Co-Admin" }
                    : u
            )
        );
    };

    const filtered = users.filter((u) => {
        const matchesSearch =
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            u.role.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === "All" || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
                        User Management
                    </h1>
                    <p className="mt-1 text-neutral-500">
                        Create accounts and manage user roles
                    </p>
                </div>
                <AddUserDialog onAdd={handleAddUser} />
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                    <Input
                        placeholder="Search users by name, role, or email..."
                        className="border-neutral-200 bg-white pl-9 text-neutral-900 placeholder:text-neutral-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className={`border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 ${
                                roleFilter !== "All" ? "border-amber-400 bg-amber-50 text-amber-700 hover:bg-amber-100" : ""
                            }`}
                        >
                            <Filter className="mr-2 h-4 w-4" />
                            {roleFilter === "All" ? "Filter Roles" : roleFilter}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 bg-white border-neutral-200 shadow-lg">
                        {(["All", "Co-Admin", "User"] as const).map((r) => (
                            <DropdownMenuItem
                                key={r}
                                onClick={() => setRoleFilter(r)}
                                className={`cursor-pointer text-sm ${
                                    roleFilter === r
                                        ? "bg-amber-50 text-amber-700 font-semibold"
                                        : "text-neutral-700 hover:bg-neutral-50"
                                }`}
                            >
                                {r === "All" ? "All Roles" : r}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Users List */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((user, index) => (
                    <Card
                        key={`${user.email}-${index}`}
                        className="border-neutral-200 bg-white shadow-sm transition-all hover:border-neutral-300 hover:shadow-md"
                    >
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                                    <Users className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="flex gap-2">
                                    <Badge
                                        variant="secondary"
                                        className={
                                            user.role === "Co-Admin"
                                                ? "border-violet-200 bg-violet-50 text-violet-700"
                                                : "border-blue-200 bg-blue-50 text-blue-700"
                                        }
                                    >
                                        {user.role === "Co-Admin" && <Shield className="mr-1 h-3 w-3" />}
                                        {user.role}
                                    </Badge>
                                </div>
                            </div>
                            <CardTitle className="mt-4 text-lg text-neutral-900">{user.name}</CardTitle>
                            <CardDescription className="text-neutral-500">
                                {user.email}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mt-2 pt-4 border-t border-neutral-100">
                                <Badge
                                    variant="outline"
                                    className={
                                        user.status === "Active"
                                            ? "border-emerald-200 text-emerald-600"
                                            : "border-neutral-200 text-neutral-500"
                                    }
                                >
                                    <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-neutral-400'}`}></span>
                                    {user.status}
                                </Badge>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-neutral-900">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-44 bg-white border-neutral-200 shadow-lg">
                                        <DropdownMenuItem
                                            className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer hover:bg-neutral-50 focus:bg-neutral-50"
                                            onClick={() => handleEditRole(user.email)}
                                        >
                                            <Pencil className="h-3.5 w-3.5 text-neutral-500" />
                                            Edit Role
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-neutral-100" />
                                        <DropdownMenuItem
                                            className="flex items-center gap-2 text-sm text-red-600 cursor-pointer hover:bg-red-50 focus:bg-red-50"
                                            onClick={() => handleDeleteUser(user.email)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Delete User
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
