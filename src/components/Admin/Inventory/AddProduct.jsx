import { useState, useEffect } from 'react'
import { supabase } from '../../../supabaseClient'
import { useNavigate, Link } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

const AddProduct = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState([])
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        category_id: '', // Using text input for now as categories table isn't specified
        is_clearance: false
    })
    const [coverImage, setCoverImage] = useState(null)
    const [galleryImages, setGalleryImages] = useState([])
    const [coverPreview, setCoverPreview] = useState(null)
    const [galleryPreviews, setGalleryPreviews] = useState([])

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name', { ascending: true })

            if (error) throw error
            setCategories(data || [])
        } catch (error) {
            console.error('Error fetching categories:', error)
            // Optional: alert('Could not load categories')
        }
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleCoverImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setCoverImage(file)
            setCoverPreview(URL.createObjectURL(file))
        }
    }

    const handleGalleryImagesChange = (e) => {
        const files = Array.from(e.target.files)
        setGalleryImages(prev => [...prev, ...files])

        const newPreviews = files.map(file => URL.createObjectURL(file))
        setGalleryPreviews(prev => [...prev, ...newPreviews])
    }

    const removeGalleryImage = (index) => {
        setGalleryImages(prev => prev.filter((_, i) => i !== index))
        setGalleryPreviews(prev => prev.filter((_, i) => i !== index))
    }

    const uploadImage = async (file) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${uuidv4()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('KneexProducts') // Ensure this bucket exists
            .upload(filePath, file)

        if (uploadError) {
            throw uploadError
        }

        const { data } = supabase.storage
            .from('KneexProducts')
            .getPublicUrl(filePath)

        return data.publicUrl
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Upload Cover Image
            let coverImageUrl = ''
            if (coverImage) {
                coverImageUrl = await uploadImage(coverImage)
            }

            // Upload Gallery Images
            const galleryUrls = []
            for (const file of galleryImages) {
                const url = await uploadImage(file)
                galleryUrls.push(url)
            }

            // Insert into Database
            const { error } = await supabase
                .from('products')
                .insert([
                    {
                        name: formData.name,
                        description: formData.description,
                        price: parseFloat(formData.price),
                        stock_quantity: parseInt(formData.stock_quantity),
                        category_id: formData.category_id, // Assuming string/UUID input logic
                        image_url: coverImageUrl,
                        gallery: JSON.stringify(galleryUrls), // Storing array as JSON string
                        is_clearance: formData.is_clearance,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                ])

            if (error) throw error

            alert('Product added successfully!')
            navigate('/admin/inventory')

        } catch (error) {
            console.error('Error adding product:', error)
            alert('Error adding product: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-greyDark">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-extrabold text-greyDark">Add New Product</h2>
                        <p className="mt-2 text-sm text-gray-600">Create a new item in your inventory.</p>
                    </div>
                    <Link to="/admin/inventory" className="text-pink hover:text-purple font-medium flex items-center gap-2">
                        <i className="fas fa-arrow-left"></i> Back to Inventory
                    </Link>
                </div>

                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Basic Info */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink focus:border-pink transition"
                                        placeholder="e.g. Nike Air Max"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        rows="4"
                                        required
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink focus:border-pink transition"
                                        placeholder="Product details..."
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (Ksh.)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        step="0.01"
                                        required
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink focus:border-pink transition"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                                    <input
                                        type="number"
                                        name="stock_quantity"
                                        required
                                        value={formData.stock_quantity}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink focus:border-pink transition"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        name="category_id"
                                        required
                                        value={formData.category_id}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink focus:border-pink transition bg-white"
                                    >
                                        <option value="">Select a Category</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center h-full pt-6">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="is_clearance"
                                            checked={formData.is_clearance}
                                            onChange={handleChange}
                                            className="w-5 h-5 text-pink border-gray-300 rounded focus:ring-pink"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Mark as Clearance Item</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Product Images</h3>

                            {/* Cover Image */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image (Required)</label>
                                <div className="flex items-start gap-6">
                                    <div className="flex-1">
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition border-pink/30 bg-pink/5">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <i className="fas fa-cloud-upload-alt text-2xl text-pink mb-2"></i>
                                                <p className="text-xs text-gray-500">Click to upload cover</p>
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleCoverImageChange} required />
                                        </label>
                                    </div>
                                    {coverPreview && (
                                        <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-200 shadow-sm relative group">
                                            <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => { setCoverImage(null); setCoverPreview(null); }}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                                            >
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Gallery Images */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Images (Optional)</label>
                                <div className="mb-4">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <i className="fas fa-images text-2xl text-gray-400 mb-2"></i>
                                            <p className="text-xs text-gray-500">Click to upload multiple images</p>
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" multiple onChange={handleGalleryImagesChange} />
                                    </label>
                                </div>
                                {galleryPreviews.length > 0 && (
                                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
                                        {galleryPreviews.map((preview, index) => (
                                            <div key={index} className="aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm relative group">
                                                <img src={preview} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeGalleryImage(index)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition"
                                                >
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit Actions */}
                        <div className="pt-6 border-t flex justify-end gap-4">
                            <Link
                                to="/admin/inventory"
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-gradient-to-r from-pink to-purple text-white rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading && <i className="fas fa-spinner fa-spin"></i>}
                                {loading ? 'Saving...' : 'Create Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AddProduct
