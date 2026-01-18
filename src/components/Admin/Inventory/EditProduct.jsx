import { useState, useEffect } from 'react'
import { supabase } from '../../../supabaseClient'
import { useNavigate, Link, useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

const EditProduct = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        category_id: '',
        is_clearance: false
    })

    // Image handling
    const [coverImageFile, setCoverImageFile] = useState(null)
    const [currentIconUrl, setCurrentIconUrl] = useState('')
    const [coverPreview, setCoverPreview] = useState(null) // For new uploads

    const [existingGalleryUrls, setExistingGalleryUrls] = useState([])
    const [newGalleryFiles, setNewGalleryFiles] = useState([])
    const [newGalleryPreviews, setNewGalleryPreviews] = useState([])

    useEffect(() => {
        fetchProduct()
    }, [id])

    const fetchProduct = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error

            setFormData({
                name: data.name,
                description: data.description || '',
                price: data.price,
                stock_quantity: data.stock_quantity,
                category_id: data.category_id,
                is_clearance: data.is_clearance
            })

            setCurrentIconUrl(data.image_url)

            // Parse gallery JSON
            try {
                const gallery = data.gallery ? JSON.parse(data.gallery) : []
                if (Array.isArray(gallery)) {
                    setExistingGalleryUrls(gallery)
                }
            } catch (e) {
                console.error("Error parsing gallery JSON", e)
                setExistingGalleryUrls([])
            }

        } catch (error) {
            console.error('Error fetching product:', error)
            alert('Error fetching product details')
            navigate('/admin/inventory')
        } finally {
            setLoading(false)
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
            setCoverImageFile(file)
            setCoverPreview(URL.createObjectURL(file))
        }
    }

    const handleNewGalleryImagesChange = (e) => {
        const files = Array.from(e.target.files)
        setNewGalleryFiles(prev => [...prev, ...files])

        const newPreviews = files.map(file => URL.createObjectURL(file))
        setNewGalleryPreviews(prev => [...prev, ...newPreviews])
    }

    const removeExistingGalleryImage = (indexToRemove) => {
        setExistingGalleryUrls(prev => prev.filter((_, i) => i !== indexToRemove))
    }

    const removeNewGalleryImage = (indexToRemove) => {
        setNewGalleryFiles(prev => prev.filter((_, i) => i !== indexToRemove))
        setNewGalleryPreviews(prev => prev.filter((_, i) => i !== indexToRemove))
    }

    const uploadImage = async (file) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${uuidv4()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('KneexProducts')
            .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data } = supabase.storage
            .from('KneexProducts')
            .getPublicUrl(filePath)

        return data.publicUrl
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            // 1. Handle Cover Image
            let finalCoverUrl = currentIconUrl
            if (coverImageFile) {
                finalCoverUrl = await uploadImage(coverImageFile)
            }

            // 2. Handle Gallery Images
            // Convert new files to URLs
            const newGalleryUrls = []
            for (const file of newGalleryFiles) {
                const url = await uploadImage(file)
                newGalleryUrls.push(url)
            }

            // Combine existing (remaining) + new
            const finalGallery = [...existingGalleryUrls, ...newGalleryUrls]

            // 3. Update Database
            const { error } = await supabase
                .from('products')
                .update({
                    name: formData.name,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    stock_quantity: parseInt(formData.stock_quantity),
                    category_id: formData.category_id,
                    image_url: finalCoverUrl,
                    gallery: JSON.stringify(finalGallery),
                    is_clearance: formData.is_clearance,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)

            if (error) throw error

            alert('Product updated successfully!')
            navigate('/admin/inventory')

        } catch (error) {
            console.error('Error updating product:', error)
            alert('Error updating product: ' + error.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Loading product details...</div>

    return (
        <div className="font-sans text-greyDark">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-extrabold text-greyDark">Edit Product</h2>
                        <p className="mt-2 text-sm text-gray-600">Update product details and images.</p>
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
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        step="0.01"
                                        required
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink focus:border-pink transition"
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
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category ID</label>
                                    <input
                                        type="text"
                                        name="category_id"
                                        required
                                        value={formData.category_id}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink focus:border-pink transition"
                                    />
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                                <div className="flex items-start gap-6">
                                    <div className="flex-1">
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition border-pink/30 bg-pink/5">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <i className="fas fa-cloud-upload-alt text-2xl text-pink mb-2"></i>
                                                <p className="text-xs text-gray-500">Click to change cover image</p>
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleCoverImageChange} />
                                        </label>
                                    </div>

                                    {/* Preview logic: Show new if selected, else show existing */}
                                    {(coverPreview || currentIconUrl) && (
                                        <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-200 shadow-sm relative">
                                            <img
                                                src={coverPreview || currentIconUrl}
                                                alt="Cover Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            {coverPreview && (
                                                <div className="absolute top-0 right-0 bg-yellow-400 text-xs px-1 font-bold">New</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Gallery Images */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Images</label>
                                <div className="mb-4">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <i className="fas fa-images text-2xl text-gray-400 mb-2"></i>
                                            <p className="text-xs text-gray-500">Add more images to gallery</p>
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" multiple onChange={handleNewGalleryImagesChange} />
                                    </label>
                                </div>

                                <div className="space-y-4">
                                    {/* Existing Gallery Images */}
                                    {existingGalleryUrls.length > 0 && (
                                        <div>
                                            <p className="text-xs text-gray-500 mb-2">Existing Gallery Images</p>
                                            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
                                                {existingGalleryUrls.map((url, index) => (
                                                    <div key={`existing-${index}`} className="aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm relative group">
                                                        <img src={url} alt={`Gallery Existing ${index}`} className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeExistingGalleryImage(index)}
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition"
                                                        >
                                                            <i className="fas fa-times"></i>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* New Gallery Images */}
                                    {newGalleryPreviews.length > 0 && (
                                        <div>
                                            <p className="text-xs text-gray-500 mb-2 text-green-600">New Images to Upload</p>
                                            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
                                                {newGalleryPreviews.map((preview, index) => (
                                                    <div key={`new-${index}`} className="aspect-square rounded-lg overflow-hidden border border-green-200 shadow-sm relative group ring-2 ring-green-100">
                                                        <img src={preview} alt={`Gallery New ${index}`} className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeNewGalleryImage(index)}
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition"
                                                        >
                                                            <i className="fas fa-times"></i>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
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
                                disabled={submitting}
                                className="px-6 py-2 bg-gradient-to-r from-pink to-purple text-white rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {submitting && <i className="fas fa-spinner fa-spin"></i>}
                                {submitting ? 'Updating...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default EditProduct
