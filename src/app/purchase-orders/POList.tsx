'use client'

import { useState } from 'react'
import { POStatus, PurchaseOrder as PrismaPO } from '@prisma/client'
import POStatusBadge from '../../components/POStatusBadge'
import POActions from '../../components/POActions'

// Define a type for the PO that matches what comes from the server action/Prisma
type PurchaseOrder = PrismaPO & {
  supplier: {
    name: string
  }
  items: any[]
}

export default function POList({ purchaseOrders }: { purchaseOrders: PurchaseOrder[] }) {
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null)

  // Group POs by Supplier Name
  const groupedPOs = purchaseOrders.reduce((acc, po) => {
    const supplierName = po.supplier.name
    if (!acc[supplierName]) {
      acc[supplierName] = []
    }
    acc[supplierName].push(po)
    return acc
  }, {} as Record<string, PurchaseOrder[]>)

  const suppliers = Object.keys(groupedPOs).sort()

  if (selectedSupplier) {
    const supplierPOs = groupedPOs[selectedSupplier] || []
    return (
      <div>
        <button 
          onClick={() => setSelectedSupplier(null)}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Daftar Supplier
        </button>

        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <svg className="w-8 h-8 mr-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
             <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
          {selectedSupplier}
        </h2>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. PO</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Nilai</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {supplierPOs.map((po) => (
                <tr key={po.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{po.poNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(po.date).toLocaleDateString('id-ID')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.items.length} items</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(po.totalAmount))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <POStatusBadge status={po.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <POActions po={po} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {suppliers.map((supplierName) => {
        const count = groupedPOs[supplierName].length
        const totalValue = groupedPOs[supplierName].reduce((sum: number, po: PurchaseOrder) => sum + Number(po.totalAmount), 0)
        
        return (
          <div 
            key={supplierName}
            onClick={() => setSelectedSupplier(supplierName)}
            className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center text-center group"
          >
            <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{supplierName}</h3>
            <p className="text-sm text-gray-500 mb-4">{count} Purchase Order</p>
            <div className="mt-auto w-full border-t pt-4">
              <p className="text-xs text-gray-500 uppercase">Total Nilai</p>
              <p className="font-bold text-green-600">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalValue)}
              </p>
            </div>
          </div>
        )
      })}
      
      {suppliers.length === 0 && (
        <div className="col-span-full text-center py-12 text-gray-500">
          Belum ada Purchase Order yang dibuat.
        </div>
      )}
    </div>
  )
}
