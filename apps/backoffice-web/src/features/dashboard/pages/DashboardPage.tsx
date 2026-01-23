'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { Activity, Shield, Key, User, Laptop } from 'lucide-react';

export function DashboardPage() {
  const { actorType, actorId, sessionId } = useAuth();

  return (
    // 1. PAGE CONTAINER (Matches Categories Page)
    <div className="min-h-screen bg-background p-6 md:p-8 font-sans animate-in fade-in duration-500">
      
      {/* 2. HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard Overview
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          System health and active session data
        </p>
      </div>

      {/* 3. STATS GRID */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* CARD 1: SESSION STATUS */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Session Status
            </div>
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-foreground">Active</div>
            {/* Decorative Bar */}
            <div className="mt-3 h-1.5 w-full max-w-[60px] rounded-full bg-primary" />
          </div>
        </div>

        {/* CARD 2: ROLE TYPE */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Role Type
            </div>
            <Shield className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-foreground capitalize">
              {actorType || 'Unknown'}
            </div>
            {/* Decorative Bar (Blue) */}
            <div className="mt-3 h-1.5 w-full max-w-[60px] rounded-full bg-blue-500" />
          </div>
        </div>
        
      </div>

      {/* 4. DETAILED INFO SECTION */}
      <div className="mt-8 rounded-xl border border-border bg-card shadow-sm">
        {/* Section Header */}
        <div className="border-b border-border bg-muted/30 px-6 py-4">
          <div className="flex items-center gap-2">
            <Laptop className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Active Session Details
            </h3>
          </div>
        </div>

        {/* Section Body */}
        <div className="p-6">
          <div className="flex flex-col gap-6 md:flex-row">
            
            {/* DATA POINT 1: Actor ID */}
            <div className="flex-1 rounded-lg border border-border bg-muted/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <User size={14} className="text-muted-foreground" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Actor Identifier
                </span>
              </div>
              <div className="font-mono text-sm font-semibold text-foreground break-all">
                {actorId}
              </div>
            </div>

            {/* DATA POINT 2: Session Token */}
            <div className="flex-1 rounded-lg border border-border bg-muted/20 p-4">
               <div className="flex items-center gap-2 mb-2">
                <Key size={14} className="text-muted-foreground" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Session Token
                </span>
              </div>
              <div className="font-mono text-sm font-bold text-primary break-all">
                {sessionId}
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}