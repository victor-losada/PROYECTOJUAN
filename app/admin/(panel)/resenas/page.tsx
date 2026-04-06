import { createClient } from '@/lib/supabase/server'
import { ReviewsManager } from '@/components/admin/reviews-manager'

async function getReviews() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('resenas')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching reviews:', error)
    return []
  }

  return data || []
}

export default async function AdminResenasPage() {
  const resenas = await getReviews()

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-stone-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-stone-800">Resenas</h1>
        <p className="text-stone-500 mt-1">
          Modera las resenas de los clientes
        </p>
      </div>

      <ReviewsManager resenas={resenas} />
    </div>
  )
}
