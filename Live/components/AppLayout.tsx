"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import AdminBottomNav from "@/components/admin/AdminBottomNav";
import SplashScreen from "@/components/SplashScreen";
import MaintenancePage from "@/app/maintenance/page";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMaintenance, setIsMaintenance] = useState(false);
    const [checked, setChecked] = useState(false);

    const isMaster = pathname?.startsWith("/master");
    const isAdmin = pathname?.startsWith("/admin") || pathname?.startsWith("/admin-login");

    useEffect(() => {
        const checkSystem = async () => {
            try {
                const res = await fetch(`/api/master/settings?t=${Date.now()}`, { cache: 'no-store' });
                const data = await res.json();
                if (data.success && data.settings) {
                    setIsMaintenance(data.settings.maintenanceMode);
                }
            } catch (err) {
                console.error('System Health Check Fail:', err);
            } finally {
                setChecked(true);
            }
        };

        checkSystem();
    }, [pathname]);

    const isAdminLogin = pathname === "/admin-login";

    const nav = useMemo(() => {
        if (isMaster || isMaintenance) return null; // Master has its own navigation, Maintenance has none
        if (isAdmin) return isAdminLogin ? null : <AdminBottomNav />;
        return <BottomNav />;
    }, [isAdmin, isAdminLogin, isMaster, isMaintenance]);

    const splash = useMemo(() => {
        return !isAdmin && !isMaster && !isMaintenance ? <SplashScreen /> : null;
    }, [isAdmin, isMaster, isMaintenance]);

    // Locked View for Public
    if (checked && isMaintenance && !isMaster && !isAdmin) {
        return <MaintenancePage />;
    }

    return (
        <div className={`${isMaster ? 'max-w-none' : 'max-w-[414px] mx-auto'} h-[100dvh] w-full relative bg-background sm:border-x sm:border-white/10 shadow-2xl overflow-hidden flex flex-col`}>
            {/* Persist children container to prevent remounting sub-trees */}
            {splash}
            
            <div className={`flex-1 overflow-y-auto overflow-x-hidden no-scrollbar ${isMaster || isMaintenance ? '' : 'pb-[90px]'} w-full h-full`}>
                {children}
            </div>

            {/* Memoized Sticky Bottom Nav */}
            {nav}
        </div>
    );
}
