"use client";

import { useEffect, useState } from "react";
import { getRole, type UserRole } from "@/lib/auth";

/**
 * Role from localStorage after mount. Initial value is always `"user"` so the
 * first client render matches SSR (see getRole() when window is undefined).
 */
export function useClientRole(): { role: UserRole; ready: boolean } {
    const [role, setRole] = useState<UserRole>("user");
    const [ready, setReady] = useState(false);

    useEffect(() => {
        // Read localStorage after mount so the first paint matches SSR (see getRole).
        /* eslint-disable react-hooks/set-state-in-effect -- intentional post-hydration sync */
        setRole(getRole());
        setReady(true);
        /* eslint-enable react-hooks/set-state-in-effect */
    }, []);

    return { role, ready };
}
