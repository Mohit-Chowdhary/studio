
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, Home, Settings, MonitorPlay, BookOpen } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger } from "@/components/ui/sidebar";

export function AppLayout({ children, title }: { children: React.ReactNode, title: string }) {
  const pathname = usePathname();

  return (
    <div className="flex h-svh bg-background">
      <Sidebar side="left" collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Bot className="w-8 h-8 text-primary" />
            <span className="text-lg font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              SahayakAI
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Home" isActive={pathname === '/'}>
                <Link href="/">
                  <Home />
                  <span>Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Lesson Planner" isActive={pathname.startsWith('/lesson-planner')}>
                <Link href="/lesson-planner">
                  <BookOpen />
                  <span>Lesson Planner</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Classroom" isActive={pathname.startsWith('/teacher') || pathname.startsWith('/student') || pathname.startsWith('/guest')}>
                <Link href="/">
                  <MonitorPlay />
                  <span>Classroom</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Settings" isActive={pathname === '/settings'}>
                <Link href="/settings">
                  <Settings />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <div className="md:hidden flex justify-end p-2">
                <SidebarTrigger />
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="flex items-center justify-between p-4 border-b h-14 shrink-0">
          <h1 className="text-2xl font-bold">{title}</h1>
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
             {children}
            </div>
        </main>
      </SidebarInset>
    </div>
  );
}
