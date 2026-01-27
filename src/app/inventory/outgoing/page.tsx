import { getProducts } from '@/app/actions/product'
import OutgoingForm from '@/components/OutgoingForm'

export default async function OutgoingPage() {
  const products = await getProducts()
  
  // Sort products by name for better UX
  const sortedProducts = products.sort((a: any, b: any) => a.name.localeCompare(b.name))

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Form Bahan Keluar (Usage)</h1>
        <p className="text-gray-500">Catat penggunaan bahan dapur atau barang keluar lainnya di sini. Stok akan berkurang otomatis.</p>
      </div>
      
      <OutgoingForm products={sortedProducts} />
    </div>
  )
}
