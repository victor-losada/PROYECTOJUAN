import { ContentManager } from '@/components/admin/content-manager'

export default function AdminContenidoPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6 bg-stone-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-stone-800">Contenido</h1>
        <p className="text-stone-500 mt-1">
          Gestiona el contenido multimedia de las secciones principales
        </p>
      </div>

      <ContentManager />
    </div>
  )
}
