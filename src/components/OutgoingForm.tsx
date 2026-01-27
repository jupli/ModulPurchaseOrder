'use client'

import { useState } from 'react'
import { createGoodsIssue } from '@/app/actions/inventory'
import { useRouter } from 'next/navigation'

export default function OutgoingForm({ products }: { products: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<{ productId: string, quantity: number }[]>([
    { productId: '', quantity: 0 }
  ])
  const [description, setDescription] = useState('')
  const [reference, setReference] = useState('')

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

  async function handleSubmit(e: React.FormEvent) {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-red-500 focus:border-red-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Referensi (Opsional)</label>
            <input
              type="text"
              value={reference}
              onChange={e => setReference(e.target.value)}
              placeholder="No. Order / Shift"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-red-500 focus:border-red-500 sm:text-sm"
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
                          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-red-500 focus:border-red-500 sm:text-sm"
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
          className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 font-bold shadow-lg"
        >
          {loading ? 'Memproses...' : 'Simpan Barang Keluar'}
        </button>
      </div>
    </form>
  )
}
