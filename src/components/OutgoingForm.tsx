'use client'

import { useState } from 'react'
import { createGoodsIssue } from '@/app/actions/inventory'
import { cookMenu } from '@/app/actions/recipe'
import { useRouter } from 'next/navigation'

interface OutgoingFormProps {
  products: any[]
  recipes: any[]
}

export default function OutgoingForm({ products, recipes }: OutgoingFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Mode: 'manual' or 'cooking'
  const [mode, setMode] = useState<'manual' | 'cooking'>('manual')

  // Manual Mode State
  const [items, setItems] = useState<{ productId: string, quantity: number }[]>([
    { productId: '', quantity: 0 }
  ])
  const [description, setDescription] = useState('')
  const [reference, setReference] = useState('')

  // Cooking Mode State
  const [selectedRecipeId, setSelectedRecipeId] = useState('')
  const [portions, setPortions] = useState(1)

  // -- Manual Mode Handlers --

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 0 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: 'productId' | 'quantity', value: any) => {
    const newItems = [...items]
    // @ts-ignore
    newItems[index][field] = value
    setItems(newItems)
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Validate
    const validItems = items.filter(i => i.productId && i.quantity > 0)
    if (validItems.length === 0) {
      alert('Mohon masukkan minimal satu barang dengan jumlah > 0')
      return
    }

    if (!description) {
      alert('Mohon isi keterangan penggunaan')
      return
    }

    if (!confirm('Pastikan data sudah benar. Kurangi stok?')) return

    setLoading(true)

    try {
      const result = await createGoodsIssue({
        items: validItems,
        description,
        reference
      })

      if (result.success) {
        alert('Stok berhasil dikurangi!')
        setItems([{ productId: '', quantity: 0 }])
        setDescription('')
        setReference('')
        router.refresh()
      } else {
        alert('Gagal mengurangi stok: ' + result.error)
      }
    } catch (error) {
      console.error(error)
      alert('Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  // -- Cooking Mode Handlers --

  async function handleCookSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!selectedRecipeId) {
      alert('Mohon pilih menu yang akan dimasak')
      return
    }
    if (portions <= 0) {
      alert('Jumlah porsi harus lebih dari 0')
      return
    }

    const recipeName = recipes.find(r => r.id === selectedRecipeId)?.name || 'Menu'
    if (!confirm(`Konfirmasi masak ${portions} porsi ${recipeName}?\nStok bahan-bahan akan dikurangi otomatis.`)) return

    setLoading(true)

    try {
      const result = await cookMenu(selectedRecipeId, portions)
      
      if (result.success) {
        alert(`Berhasil! Bahan-bahan untuk ${recipeName} telah dikurangi dari stok.`)
        setSelectedRecipeId('')
        setPortions(1)
        router.refresh()
      } else {
        alert('Gagal memproses masakan: ' + result.error)
      }
    } catch (error) {
      console.error(error)
      alert('Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  // Helper to get selected recipe details
  const selectedRecipe = recipes.find(r => r.id === selectedRecipeId)

  return (
    <div className="space-y-6">
      
      {/* Mode Switcher */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setMode('manual')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'manual' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          📝 Manual (Bahan Lepas)
        </button>
        <button
          onClick={() => setMode('cooking')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'cooking' 
              ? 'bg-orange-600 text-white shadow-md' 
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          🍳 Masak Menu (Otomatis)
        </button>
      </div>

      {mode === 'manual' ? (
        // --- MANUAL FORM ---
        <form onSubmit={handleManualSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Keterangan Penggunaan</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Contoh: Penggunaan Dapur Hari Ini"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Referensi (Opsional)</label>
                <input
                  type="text"
                  value={reference}
                  onChange={e => setReference(e.target.value)}
                  placeholder="No. Order / Shift"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Daftar Barang Keluar</h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700"
                >
                  + Tambah Baris
                </button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Barang</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok Saat Ini</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah Keluar</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Satuan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item, index) => {
                      const selectedProduct = products.find(p => p.id === item.productId)
                      return (
                        <tr key={index}>
                          <td className="px-6 py-4">
                            <select
                              value={item.productId}
                              onChange={e => updateItem(index, 'productId', e.target.value)}
                              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                              <option value="">-- Pilih Barang --</option>
                              {products.map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {selectedProduct ? selectedProduct.quantity : '-'}
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              min="0"
                              value={item.quantity}
                              onChange={e => updateItem(index, 'quantity', Number(e.target.value))}
                              className="w-24 border border-gray-300 rounded-md px-2 py-1"
                            />
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {selectedProduct ? selectedProduct.unit : '-'}
                          </td>
                          <td className="px-6 py-4">
                            {items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Hapus
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-bold shadow-lg"
            >
              {loading ? 'Memproses...' : 'Simpan Barang Keluar'}
            </button>
          </div>
        </form>
      ) : (
        // --- COOKING FORM ---
        <form onSubmit={handleCookSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow border-t-4 border-orange-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Pilih Menu Masakan</label>
                <select
                  required
                  value={selectedRecipeId}
                  onChange={e => setSelectedRecipeId(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500 sm:text-lg font-medium"
                >
                  <option value="">-- Pilih Menu --</option>
                  {recipes.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                {recipes.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">Belum ada resep yang tersimpan.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Jumlah Porsi</label>
                <div className="flex items-center mt-1">
                    <input
                      type="number"
                      required
                      min="1"
                      value={portions}
                      onChange={e => setPortions(Number(e.target.value))}
                      className="block w-32 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500 sm:text-lg font-bold text-center"
                    />
                    <span className="ml-3 text-gray-500">Porsi</span>
                </div>
              </div>
            </div>

            {/* Recipe Preview */}
            {selectedRecipe && (
              <div className="mt-6 bg-orange-50 p-4 rounded-md border border-orange-200">
                <h4 className="text-md font-bold text-orange-800 mb-3">
                    Rincian Bahan yang Akan Digunakan ({portions} Porsi):
                </h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-orange-200">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-orange-700 uppercase">Bahan</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-orange-700 uppercase">Per Porsi</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-orange-700 uppercase">Total Dibutuhkan</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-orange-700 uppercase">Stok Tersedia</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-orange-700 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-orange-200">
                            {selectedRecipe.ingredients.map((ing: any) => {
                                const totalRequired = ing.quantity * portions
                                const isEnough = ing.product.quantity >= totalRequired
                                return (
                                    <tr key={ing.id} className={isEnough ? '' : 'bg-red-100'}>
                                        <td className="px-4 py-2 text-sm text-gray-900">{ing.product.name}</td>
                                        <td className="px-4 py-2 text-sm text-gray-600">{ing.quantity} {ing.unit}</td>
                                        <td className="px-4 py-2 text-sm font-bold text-gray-900">{totalRequired} {ing.unit}</td>
                                        <td className="px-4 py-2 text-sm text-gray-600">{ing.product.quantity} {ing.unit}</td>
                                        <td className="px-4 py-2 text-sm">
                                            {isEnough ? (
                                                <span className="text-green-600 font-bold">✓ Cukup</span>
                                            ) : (
                                                <span className="text-red-600 font-bold">✕ Kurang</span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !selectedRecipeId}
              className="bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700 font-bold shadow-lg text-lg flex items-center"
            >
              {loading ? 'Sedang Memproses...' : '🍳 Masak Sekarang & Kurangi Stok'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}