import { useState, useEffect } from 'react'
import { supabase } from '../../../supabaseClient'
import { Link } from 'react-router-dom'

const ProductList = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setProducts(data || [])
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id)

            if (error) throw error

            // Optimistic update
            setProducts(products.filter(product => product.id !== id))
        } catch (error) {
            console.error('Error deleting product:', error)
            alert('Error deleting product')
        }
    }

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink"></div>
            </div>
        )
    }

    return (
        <div className="font-sans text-greyDark">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink to-purple">
                        Inventory
                    </h1>
                    <p className="text-gray-500 mt-2">Manage your products, prices, and stock.</p>
                </div>
                <Link
                    to="/admin/inventory/add"
                    className="bg-gradient-to-r from-pink to-purple text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition duration-300 flex items-center gap-2"
                >
                    <i className="fas fa-plus"></i> Add New Product
                </Link>
            </div>

            {/* Search / Filter Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex items-center gap-4 border border-gray-100">
                <div className="flex-1 relative">
                    <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <input
                        type="text"
                        placeholder="Search products by name..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink/20 focus:border-pink transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                <th className="p-4">Product</th>
                                <th className="p-4">Price</th>
                                <th className="p-4">Stock</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map(product => (
                                    <tr key={product.id} className="hover:bg-gray-50 transition duration-150">
                                        <td className="p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                                                    {product.image_url ? (
                                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <i className="fas fa-image text-xl"></i>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-greyDark">{product.name}</h3>
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{product.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium text-greyDark">
                                            Ksh.{product.price?.toFixed(2)}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.stock_quantity > 10 ? 'bg-green-100 text-green-700' : product.stock_quantity > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                {product.stock_quantity} in stock
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {product.is_clearance && (
                                                <span className="px-2 py-1 rounded-md bg-pink/10 text-pink text-xs font-bold uppercase">
                                                    Clearance
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link
                                                    to={`/admin/inventory/edit/${product.id}`}
                                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition duration-200"
                                                    title="Edit"
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition duration-200"
                                                    title="Delete"
                                                >
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">
                                        No products found. Start by adding one!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default ProductList
