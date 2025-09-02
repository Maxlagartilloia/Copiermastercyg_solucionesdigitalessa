
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { LogOut, LayoutDashboard, Users, Wrench, BrainCircuit, BarChart3, ShieldCheck, UserPlus, FileText } from 'lucide-react';

import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { app, db } from '@/lib/firebase';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const SUPER_ADMIN_EMAIL = "serviciotecnico@copiermastercyg.com.ec";

type UserRole = 'admin' | 'technician' | 'client' | null;

async function getUserRole(userId: string): Promise<UserRole> {
    try {
        const roleDocRef = doc(db, "roles", "userRoles");
        const roleDoc = await getDoc(roleDocRef);
        if (roleDoc.exists()) {
            const roles = roleDoc.data();
            return roles[userId] || null;
        }
        return null;
    } catch (error) {
        console.error("Error getting user role: ", error);
        return null;
    }
}

function AdminHeader() {
  const router = useRouter();

  const handleLogout = async () => {
    const auth = getAuth(app);
    await auth.signOut();
    sessionStorage.removeItem('copyhelp_auth');
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:justify-end">
       <SidebarTrigger className="md:hidden" />
      <Button variant="ghost" size="sm" onClick={handleLogout}>
        <LogOut className="mr-2 h-4 w-4" />
        Cerrar sesión
      </Button>
    </header>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = React.useState(true);
  const [userRole, setUserRole] = React.useState<UserRole>(null);

  React.useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Prioritize Super Admin check
        if (user.email === SUPER_ADMIN_EMAIL || user.email === 'maxlagartilloia@gmail.com') {
            setUserRole('admin');
            setIsLoading(false);
            return;
        }

        try {
          const role = await getUserRole(user.uid);
          
          if (role) { // Check if a role was explicitly found
            setUserRole(role);
            setIsLoading(false);
          } else {
            // No role found, redirect to login
            console.log("User authenticated but has no assigned role. Redirecting to login.");
            router.replace('/login');
          }
        } catch (error) {
          console.error("Error verifying user role:", error);
          router.replace('/login');
        }
      } else {
        // User is not signed in.
        console.log("User is not authenticated. Redirecting to login.");
        router.replace('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <p>Verificando acceso...</p>
      </div>
    );
  }
  
  if (!userRole) {
      // This is a fallback, in case loading finishes but role is still null
      router.replace('/login');
      return (
         <div className="flex h-screen w-full items-center justify-center bg-background">
            <p>Acceso denegado. Redirigiendo...</p>
        </div>
      );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col">
        <Sidebar>
          <SidebarHeader>
             <div className="p-2">
                <Logo />
             </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin'}>
                    <Link href="/admin">
                        <LayoutDashboard />
                        <span>Dashboard</span>
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {userRole === 'client' && (
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/admin/my-reports'}>
                        <Link href="/admin/my-reports">
                            <FileText />
                            <span>Mis Reportes</span>
                        </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
              )}
              {userRole === 'admin' && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/admin/reports'}>
                        <Link href="/admin/reports">
                            <BarChart3 />
                            <span>Reportes Generales</span>
                        </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/admin/knowledge'}>
                        <Link href="/admin/knowledge">
                            <BrainCircuit />
                            <span>Base de Conocimiento</span>
                        </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/admin/clients'}>
                        <Link href="/admin/clients">
                            <Users />
                            <span>Clientes</span>
                        </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/admin/technicians'}>
                        <Link href="/admin/technicians">
                            <Wrench />
                            <span>Técnicos</span>
                        </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/admin/requests'}>
                        <Link href="/admin/requests">
                            <UserPlus />
                            <span>Solicitudes</span>
                        </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/admin/users'}>
                        <Link href="/admin/users">
                            <ShieldCheck />
                            <span>Usuarios y Roles</span>
                        </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="p-2">
                <p className="text-xs text-muted-foreground">&copy; 2024 Copiermaster C&amp;G</p>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-col md:pl-64 group-data-[state=collapsed]/sidebar-wrapper:md:pl-16 transition-all duration-300 ease-in-out">
           <AdminHeader />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
