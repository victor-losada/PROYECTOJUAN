'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Plus, Pencil, Trash2, Search, Loader2, Package } from 'lucide-react'
import { toast } from 'sonner'
import { CATEGORIAS, type Producto } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ProductsManagerProps {
  productos: Producto[]
}

type ProductFormData = {
  nombre: string
  descripcion: string
  precio: number
  categoria: string
  imagen_url: string
  stock: number
  activo: boolean
}

const defaultFormData: ProductFormData = {
  nombre: '',
  descripcion: '',
  precio: 0,
  categoria: 'granos',
  imagen_url: '',
  stock: 0,
  activo: true,
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function ProductsManager({ productos }: ProductsManagerProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null)
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData)
  const [isLoading, setIsLoading] = useState(false)

  const filteredProducts = productos.filter((producto) => {
    const matchesSearch = producto.nombre.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || producto.categoria === categoryFilter
    return matchesSearch && matchesCategory
  })

  const openCreateDialog = () => {
    setSelectedProduct(null)
    setFormData(defaultFormData)
    setIsDialogOpen(true)
  }

  const openEditDialog = (producto: Producto) => {
    setSelectedProduct(producto)
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio,
      categoria: producto.categoria,
      imagen_url: producto.imagen_url || '',
      stock: producto.stock,
      activo: producto.activo,
    })
    setIsDialogOpen(true)
  }

  const openDeleteDialog = (producto: Producto) => {
    setSelectedProduct(producto)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = selectedProduct
        ? `/api/admin/products/${selectedProduct.id}`
        : '/api/admin/products'
      const method = selectedProduct ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Error saving product')

      toast.success(selectedProduct ? 'Producto actualizado' : 'Producto creado')
      setIsDialogOpen(false)
      router.refresh()
    } catch {
      toast.error('Error al guardar el producto')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedProduct) return
    setIsLoading(true)

    try {
      const response = await fetch(`/api/admin/products/${selectedProduct.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Error deleting product')

      toast.success('Producto eliminado')
      setIsDeleteDialogOpen(false)
      router.refresh()
    } catch {
      toast.error('Error al eliminar el producto')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Filters & Add Button */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar producto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {CATEGORIAS.filter((c) => c.value !== 'todos').map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Producto
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No se encontraron productos</p>
            </CardContent>
          </Card>
        ) : (
          filteredProducts.map((producto) => (
            <Card key={producto.id} className={cn(!producto.activo && 'opacity-60')}>
              <CardContent className="p-4">
                <div className="aspect-square overflow-hidden rounded-lg bg-secondary mb-3">
                  <img
                    src={producto.imagen_url || '/images/placeholder-coffee.jpg'}
                    alt={producto.nombre}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium line-clamp-1">{producto.nombre}</h3>
                    {!producto.activo && (
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">Inactivo</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {producto.descripcion}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{formatPrice(producto.precio)}</span>
                    <span className="text-sm text-muted-foreground">Stock: {producto.stock}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditDialog(producto)}
                    >
                      <Pencil className="mr-1 h-3 w-3" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => openDeleteDialog(producto)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              {selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripcion</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="precio">Precio (COP) *</Label>
                <Input
                  id="precio"
                  type="number"
                  min="0"
                  value={formData.precio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, precio: Number(e.target.value) }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, stock: Number(e.target.value) }))
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria *</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, categoria: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.filter((c) => c.value !== 'todos').map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imagen_url">URL de Imagen</Label>
              <Input
                id="imagen_url"
                type="url"
                placeholder="https://..."
                value={formData.imagen_url}
                onChange={(e) => setFormData((prev) => ({ ...prev, imagen_url: e.target.value }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="activo">Producto Activo</Label>
              <Switch
                id="activo"
                checked={formData.activo}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, activo: checked }))}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Eliminar Producto</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Estas seguro de eliminar <strong>{selectedProduct?.nombre}</strong>? 
            Esta accion no se puede deshacer.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
