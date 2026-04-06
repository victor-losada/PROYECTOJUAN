<<<<<<< HEAD
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export default async function AdminLayout({
=======
export default function AdminRootLayout({
>>>>>>> afa3ce5 (video en el hero y cambios en las funciones del administrador)
  children,
}: {
  children: React.ReactNode
}) {
<<<<<<< HEAD
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
=======
  return children
>>>>>>> afa3ce5 (video en el hero y cambios en las funciones del administrador)
}
