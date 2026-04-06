'use client'

import { useState, useRef } from 'react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Pencil, Trash2, Search, Loader2, Package, Upload, X, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { CATEGORIAS, SUBCATEGORIAS, type Producto } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ProductsManagerProps {
  productos: Producto[]
}

type ProductFormData = {
  nombre: string
  descripcion: string
  precio: number
  categoria: string
  subcategoria: string
  imagen_url: string
  stock: number
  activo: boolean
  disponible: boolean
  // Ficha técnica
  origen: string
  nombre_finca: string
  productor: string
  altitud: string
  cosecha: string
  puntaje_sca: number | null
  perfil_sensorial: string
  metodo_secado: string
  tiempo_secado: string
  proceso: string
  presentacion: string
}

const defaultFormData: ProductFormData = {
  nombre: '',
  descripcion: '',
  precio: 0,
  categoria: '',
  subcategoria: '',
  imagen_url: '',
  stock: 0,
  activo: true,
  disponible: true,
  origen: '',
  nombre_finca: '',
  productor: '',
  altitud: '',
  cosecha: '',
  puntaje_sca: null,
  perfil_sensorial: '',
  metodo_secado: '',
  tiempo_secado: '',
  proceso: '',
  presentacion: '',
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null)
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const filteredProducts = productos.filter((producto) => {
    const matchesSearch = producto.nombre.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || producto.categoria === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Get subcategories based on selected category
  const availableSubcategories = formData.categoria 
    ? SUBCATEGORIAS[formData.categoria as keyof typeof SUBCATEGORIAS] || []
    : []

  const openCreateDialog = () => {
    setSelectedProduct(null)
    setFormData(defaultFormData)
    setImagePreview(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (producto: Producto) => {
    setSelectedProduct(producto)
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio,
      categoria: producto.categoria,
      subcategoria: producto.subcategoria || '',
      imagen_url: producto.imagen_url || '',
      stock: producto.stock,
      activo: producto.activo,
      disponible: producto.disponible ?? true,
      origen: producto.origen || '',
      nombre_finca: producto.nombre_finca || '',
      productor: producto.productor || '',
      altitud: producto.altitud || '',
      cosecha: producto.cosecha || '',
      puntaje_sca: producto.puntaje_sca,
      perfil_sensorial: producto.perfil_sensorial || '',
      metodo_secado: producto.metodo_secado || '',
      tiempo_secado: producto.tiempo_secado || '',
      proceso: producto.proceso || '',
      presentacion: producto.presentacion || '',
    })
    setImagePreview(producto.imagen_url || null)
    setIsDialogOpen(true)
  }

  const openDeleteDialog = (producto: Producto) => {
    setSelectedProduct(producto)
    setIsDeleteDialogOpen(true)
  }

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ 
      ...prev, 
      categoria: value,
      subcategoria: '' // Reset subcategory when category changes
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar 5MB')
      return
    }

    setIsUploading(true)
    
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      if (!response.ok) throw new Error('Error uploading image')

      const { url } = await response.json()
      setFormData((prev) => ({ ...prev, imagen_url: url }))
      setImagePreview(url)
      toast.success('Imagen subida correctamente')
    } catch {
      toast.error('Error al subir la imagen')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, imagen_url: '' }))
    setImagePreview(null)
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
      <Card className="border-stone-200">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <Input
                  placeholder="Buscar producto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 border-stone-200"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px] border-stone-200">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorias</SelectItem>
                  {CATEGORIAS.filter((c) => c.value !== 'todos').map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={openCreateDialog} className="bg-stone-800 hover:bg-stone-700">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Producto
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.length === 0 ? (
          <Card className="col-span-full border-stone-200">
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-stone-400 mb-4" />
              <p className="text-stone-500">No se encontraron productos</p>
            </CardContent>
          </Card>
        ) : (
          filteredProducts.map((producto) => (
            <Card key={producto.id} className={cn("border-stone-200 overflow-hidden", !producto.activo && "opacity-60")}>
              <div className="aspect-square overflow-hidden bg-stone-100">
                <img
                  src={producto.imagen_url || '/images/placeholder-coffee.jpg'}
                  alt={producto.nombre}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-stone-800 line-clamp-1">{producto.nombre}</h3>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {!producto.disponible && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">No disponible</span>
                    )}
                    {!producto.activo && (
                      <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded">Inactivo</span>
                    )}
                    {producto.categoria && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">{producto.categoria}</span>
                    )}
                  </div>
                  <p className="text-sm text-stone-500 line-clamp-2">
                    {producto.descripcion || 'Sin descripcion'}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-semibold text-stone-800">{formatPrice(producto.precio)}</span>
                    <span className="text-sm text-stone-500">Stock: {producto.stock}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-stone-200 hover:bg-stone-50"
                      onClick={() => openEditDialog(producto)}
                    >
                      <Pencil className="mr-1 h-3 w-3" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-stone-800">
              {selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="general">Informacion General</TabsTrigger>
                <TabsTrigger value="ficha">Ficha Tecnica</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-4">
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Imagen del producto</Label>
                  <div className="flex items-start gap-4">
                    <div className="relative w-32 h-32 bg-stone-100 rounded-lg overflow-hidden border-2 border-dashed border-stone-300 flex items-center justify-center">
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </>
                      ) : (
                        <ImageIcon className="h-8 w-8 text-stone-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="border-stone-200"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Subiendo...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Subir imagen
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-stone-500">PNG, JPG o WebP. Max 5MB.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del producto *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Ej: Cafe Castillo Coco"
                    className="border-stone-200"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripcion</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
                    placeholder="Descripcion del producto..."
                    rows={3}
                    className="border-stone-200"
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
                      onChange={(e) => setFormData((prev) => ({ ...prev, precio: Number(e.target.value) }))}
                      className="border-stone-200"
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
                      onChange={(e) => setFormData((prev) => ({ ...prev, stock: Number(e.target.value) }))}
                      className="border-stone-200"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria *</Label>
                    <Select
                      value={formData.categoria}
                      onValueChange={handleCategoryChange}
                    >
                      <SelectTrigger className="border-stone-200">
                        <SelectValue placeholder="Seleccionar categoria" />
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
                    <Label htmlFor="subcategoria">Subcategoria</Label>
                    <Select
                      value={formData.subcategoria}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, subcategoria: value }))}
                      disabled={!formData.categoria || availableSubcategories.length === 0}
                    >
                      <SelectTrigger className="border-stone-200">
                        <SelectValue placeholder={formData.categoria ? "Seleccionar subcategoria" : "Selecciona categoria primero"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSubcategories.map((sub) => (
                          <SelectItem key={sub.value} value={sub.value}>
                            {sub.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                  <div>
                    <Label htmlFor="disponible" className="font-medium">Disponible para compra</Label>
                    <p className="text-xs text-stone-500">Si se desactiva, el producto aparecera como &quot;No disponible&quot;</p>
                  </div>
                  <Switch
                    id="disponible"
                    checked={formData.disponible}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, disponible: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                  <div>
                    <Label htmlFor="activo" className="font-medium">Producto Activo</Label>
                    <p className="text-xs text-stone-500">Si se desactiva, el producto no sera visible en la tienda</p>
                  </div>
                  <Switch
                    id="activo"
                    checked={formData.activo}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, activo: checked }))}
                  />
                </div>
              </TabsContent>

              <TabsContent value="ficha" className="space-y-4">
                <p className="text-sm text-stone-500 mb-4">
                  Informacion detallada del cafe para la ficha tecnica del producto.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="origen">Origen</Label>
                    <Input
                      id="origen"
                      value={formData.origen}
                      onChange={(e) => setFormData((prev) => ({ ...prev, origen: e.target.value }))}
                      placeholder="Ej: Colombia, Pitalito-Huila"
                      className="border-stone-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nombre_finca">Nombre de la Finca</Label>
                    <Input
                      id="nombre_finca"
                      value={formData.nombre_finca}
                      onChange={(e) => setFormData((prev) => ({ ...prev, nombre_finca: e.target.value }))}
                      placeholder="Ej: Predio 20 de marzo"
                      className="border-stone-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productor">Productor</Label>
                    <Input
                      id="productor"
                      value={formData.productor}
                      onChange={(e) => setFormData((prev) => ({ ...prev, productor: e.target.value }))}
                      placeholder="Ej: Fabio Guzman"
                      className="border-stone-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="altitud">Altitud</Label>
                    <Input
                      id="altitud"
                      value={formData.altitud}
                      onChange={(e) => setFormData((prev) => ({ ...prev, altitud: e.target.value }))}
                      placeholder="Ej: 1.650 msnm"
                      className="border-stone-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cosecha">Cosecha</Label>
                    <Input
                      id="cosecha"
                      value={formData.cosecha}
                      onChange={(e) => setFormData((prev) => ({ ...prev, cosecha: e.target.value }))}
                      placeholder="Ej: 2026"
                      className="border-stone-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="puntaje_sca">Puntaje SCA</Label>
                    <Input
                      id="puntaje_sca"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.puntaje_sca || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, puntaje_sca: e.target.value ? Number(e.target.value) : null }))}
                      placeholder="Ej: 85.5"
                      className="border-stone-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="perfil_sensorial">Perfil Sensorial</Label>
                  <Textarea
                    id="perfil_sensorial"
                    value={formData.perfil_sensorial}
                    onChange={(e) => setFormData((prev) => ({ ...prev, perfil_sensorial: e.target.value }))}
                    placeholder="Ej: Frutos amarillos, acidez lactica, dulce cana de azucar"
                    rows={2}
                    className="border-stone-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="metodo_secado">Metodo de Secado</Label>
                    <Input
                      id="metodo_secado"
                      value={formData.metodo_secado}
                      onChange={(e) => setFormData((prev) => ({ ...prev, metodo_secado: e.target.value }))}
                      placeholder="Ej: Marquesina"
                      className="border-stone-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tiempo_secado">Tiempo de Secado</Label>
                    <Input
                      id="tiempo_secado"
                      value={formData.tiempo_secado}
                      onChange={(e) => setFormData((prev) => ({ ...prev, tiempo_secado: e.target.value }))}
                      placeholder="Ej: 10 a 15 dias"
                      className="border-stone-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="proceso">Proceso</Label>
                    <Input
                      id="proceso"
                      value={formData.proceso}
                      onChange={(e) => setFormData((prev) => ({ ...prev, proceso: e.target.value }))}
                      placeholder="Ej: Cofermentado, lavado"
                      className="border-stone-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="presentacion">Presentacion</Label>
                    <Input
                      id="presentacion"
                      value={formData.presentacion}
                      onChange={(e) => setFormData((prev) => ({ ...prev, presentacion: e.target.value }))}
                      placeholder="Ej: Tostado, tueste medio"
                      className="border-stone-200"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6 pt-4 border-t border-stone-200">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-stone-200">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-stone-800 hover:bg-stone-700">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar producto'
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
            <DialogTitle className="text-xl font-semibold text-stone-800">Eliminar Producto</DialogTitle>
          </DialogHeader>
          <p className="text-stone-600">
            Estas seguro de eliminar <strong>{selectedProduct?.nombre}</strong>? 
            Esta accion no se puede deshacer.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-stone-200">
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
