"use client";

import { Suspense } from "react";
import { BOMManagementInner } from "../bom-management-inner";

export default function ArchivedBOMPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-[240px] items-center justify-center text-neutral-500">
                    Loading…
                </div>
            }
        >
            <BOMManagementInner variant="archived" />
        </Suspense>
    );
}
