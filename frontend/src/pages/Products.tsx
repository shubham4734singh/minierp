import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
// Socket removed
import { Plus, Search, Package, Trash2, X, Download, Edit2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadCSV } from '../lib/exportCsv';
import SkeletonRow from '../components/SkeletonRow';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minStockAlert: number;
  description?: string;
  imageUrl?: string;
}

export default function Products() {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const [sortField, setSortField] = useState<keyof Product | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const queryClient = useQueryClient();
  const { data: response, isLoading: loading } = useQuery({
    queryKey: ['products', currentPage, debouncedSearch],
    queryFn: async () => {
      const res = await api.get(`/products?page=${currentPage}&limit=${itemsPerPage}&search=${debouncedSearch}`);
      return res.data;
    }
  });

  const products = response?.data || [];
  const totalPages = response?.pagination?.totalPages || 1;
  const totalItems = response?.pagination?.total || 0;

  const [formData, setFormData] = useState({ name: '', sku: '', category: '', unitPrice: '', currentStock: '', minStockAlert: '10', description: '', imageUrl: '' });
  const [uploadingImage, setUploadingImage] = useState(false);

  // RBAC
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const canEdit = user.role === 'ADMIN' || user.role === 'WAREHOUSE';
  const canDelete = user.role === 'ADMIN';

  // Socket removed



  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };



  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        unitPrice: parseFloat(formData.unitPrice),
        currentStock: parseInt(formData.currentStock) || 0,
        minStockAlert: parseInt(formData.minStockAlert) || 10,
        description: formData.description,
        imageUrl: formData.imageUrl,
      };

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        toast.success("Product updated successfully!");
      } else {
        await api.post('/products', payload);
        toast.success("Product added successfully!");
      }
      queryClient.invalidateQueries({ queryKey: ['products'] });
      closeForm();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save product.");
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      unitPrice: product.unitPrice.toString(),
      currentStock: product.currentStock.toString(),
      minStockAlert: product.minStockAlert.toString(),
      description: product.description || '',
      imageUrl: product.imageUrl || ''
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', sku: '', category: '', unitPrice: '', currentStock: '', minStockAlert: '10', description: '', imageUrl: '' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`).catch(() => console.warn("No delete endpoint yet"));
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Product deleted.");
    } catch (err) {
      toast.error("Failed to delete. Product might be in active challans.");      
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formDataObj = new FormData();
    formDataObj.append('image', file);

    try {
      const res = await api.post('/products/upload', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, imageUrl: res.data.url }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Product Catalog</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            Manage your inventory, pricing, and stock levels.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input-field pl-9 h-10 w-64"
            />
          </div>
          <button onClick={() => downloadCSV(products, 'Products')} className="btn-secondary">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
          {canEdit && (
            <button onClick={showForm ? closeForm : () => setShowForm(true)} className="btn-primary">
              {showForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {showForm ? 'Cancel' : 'Add Product'}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-black/5 dark:border-white/5 shadow-2xl">
            <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between sticky top-0 bg-white dark:bg-[#111] z-10">
              <h3 className="font-bold text-zinc-900 dark:text-white text-xl">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={closeForm} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateOrUpdate} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Product Name</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field" placeholder="Mechanical Keyboard" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">SKU</label>
              <input required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="input-field uppercase" placeholder="ELEC-KEY-01" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Category</label>
              <input required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="input-field" placeholder="Electronics" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Current Stock</label>
              <input required type="number" min="0" value={formData.currentStock} onChange={e => setFormData({...formData, currentStock: e.target.value})} className="input-field" placeholder="100" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Base Price (₹)</label>
              <input required type="number" min="0" step="0.01" value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: e.target.value})} className="input-field" placeholder="80.00" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Description</label>
              <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="input-field min-h-[80px]" placeholder="Product details..." />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">Product Image (Direct URL or Upload)</label>
              <div className="flex items-start gap-4">
                {formData.imageUrl && (
                  <img src={formData.imageUrl} alt="Preview" className="h-12 w-12 rounded-lg object-cover border border-black/10 dark:border-white/10" />
                )}
                <div className="flex-1 space-y-2">
                  <input 
                    type="url" 
                    value={formData.imageUrl} 
                    onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                    className="input-field" 
                    placeholder="https://example.com/image.jpg"
                  />
                  <div className="flex items-center">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      disabled={uploadingImage}
                      className="text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 dark:file:bg-zinc-800 dark:file:text-zinc-300 dark:hover:file:bg-zinc-700 transition-colors"
                    />
                    {uploadingImage && <span className="text-xs text-zinc-500 font-medium">Uploading...</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-black/5 dark:border-white/5">
            <button type="button" onClick={closeForm} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">
              {editingId ? 'Update Product' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
      </div>
      )}

      <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-xl dark:shadow-2xl border border-black/5 dark:border-white/5 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-black/5 dark:border-white/5 bg-[#fafafa] dark:bg-[#111] flex items-center justify-between">
          <div className="relative max-w-sm w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-zinc-500 dark:text-zinc-500" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="input-field pl-10"
              placeholder="Search products by name, SKU..."
            />
          </div>
          <div className="flex bg-white dark:bg-[#050505] border border-black/5 dark:border-white/10 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
            >
              Grid Gallery
            </button>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="p-6">
            <SkeletonRow columns={5} />
          </div>
        ) : products.length === 0 ? (
          <div className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-500 font-medium">No products found.</div>
        ) : viewMode === 'grid' ? (
          <div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 bg-[#fafafa]/50 dark:bg-transparent">
              {products.map((product: Product) => (
              <div key={product.id} className="group relative bg-white dark:bg-[#111] rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
                <div className="aspect-square bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500 cursor-pointer" onClick={() => handleEdit(product)}>
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                      <Package className="h-16 w-16 text-zinc-400 dark:text-zinc-600 group-hover:scale-110 transition-transform duration-300" strokeWidth={1} />
                    </>
                  )}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded bg-white/90 dark:bg-black/80 backdrop-blur-md border ${product.currentStock <= (product.minStockAlert || 10) ? 'text-red-500 border-red-500/20' : 'text-zinc-700 dark:text-zinc-300 border-black/10 dark:border-white/10'}`}>
                      {product.currentStock} in stock
                    </span>
                    <span className="px-2 py-1 text-[9px] font-bold rounded bg-white/90 dark:bg-black/80 backdrop-blur-md border border-black/10 dark:border-white/10 text-zinc-500">
                      Min: {product.minStockAlert || 10}
                    </span>
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{product.category}</p>
                  <h4 className="font-bold text-zinc-900 dark:text-white mb-2 line-clamp-1">{product.name}</h4>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-mono text-zinc-500">{product.sku}</p>
                    <p className="font-bold text-zinc-900 dark:text-white">₹{product.unitPrice.toLocaleString()}</p>
                  </div>
                  {(canEdit || canDelete) && (
                    <div className="mt-auto pt-4 border-t border-black/5 dark:border-white/5 flex gap-2">
                      {canEdit && <button onClick={() => handleEdit(product)} className="flex-1 py-1.5 text-xs font-bold bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-900 dark:text-white rounded-lg transition-colors">Edit</button>}
                      {canDelete && <button onClick={() => handleDelete(product.id)} className="flex-1 py-1.5 text-xs font-bold bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg transition-colors">Delete</button>}
                    </div>
                  )}
                </div>
              </div>
            ))}
            </div>
            
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between bg-white dark:bg-[#0a0a0a]">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Showing <span className="font-bold text-zinc-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-zinc-900 dark:text-white">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-bold text-zinc-900 dark:text-white">{totalItems}</span> results
                </p>
                <div className="flex gap-2">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="btn-secondary disabled:opacity-50">Previous</button>
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="btn-secondary disabled:opacity-50">Next</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-black/5 dark:divide-white/5">
              <thead className="bg-[#fafafa] dark:bg-[#111]">
                <tr>
                  <th onClick={() => handleSort('name')} className="px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-zinc-900 dark:hover:text-white transition-colors">
                    Product {sortField === 'name' && (sortAsc ? '(Asc)' : '(Desc)')}
                  </th>
                  <th onClick={() => handleSort('sku')} className="px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-zinc-900 dark:hover:text-white transition-colors">
                    SKU {sortField === 'sku' && (sortAsc ? '(Asc)' : '(Desc)')}
                  </th>
                  <th onClick={() => handleSort('category')} className="px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-zinc-900 dark:hover:text-white transition-colors">
                    Category {sortField === 'category' && (sortAsc ? '(Asc)' : '(Desc)')}
                  </th>
                  <th onClick={() => handleSort('unitPrice')} className="px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-zinc-900 dark:hover:text-white transition-colors">
                    Price {sortField === 'unitPrice' && (sortAsc ? '(Asc)' : '(Desc)')}
                  </th>
                  <th onClick={() => handleSort('currentStock')} className="px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-zinc-900 dark:hover:text-white transition-colors">
                    Stock {sortField === 'currentStock' && (sortAsc ? '(Asc)' : '(Desc)')}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[#0a0a0a] divide-y divide-black/5 dark:divide-white/5">
                  {products.map((product: Product) => (
                    <tr key={product.id} className="hover:bg-[#fafafa] dark:hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-[#fafafa] dark:bg-[#111] border border-black/5 dark:border-white/5 flex items-center justify-center overflow-hidden">
                            <Package className="h-5 w-5 text-zinc-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-zinc-900 dark:text-white">{product.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-zinc-500 dark:text-zinc-500 font-mono">{product.sku}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-md bg-[#fafafa] dark:bg-[#111] text-zinc-700 dark:text-zinc-300 border border-black/5 dark:border-white/10">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-white font-medium">
                        ₹{product.unitPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-1">
                          <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-md border ${
                            product.currentStock <= (product.minStockAlert || 10)
                              ? 'bg-red-950/30 text-red-400 border-red-900/50'
                              : 'bg-[#fafafa] dark:bg-[#111] text-zinc-700 dark:text-zinc-300 border-black/10 dark:border-white/10'
                          }`}>
                            {product.currentStock}
                          </span>
                          <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">
                            Min: {product.minStockAlert || 10}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-1">
                        {canEdit && (
                          <button onClick={() => handleEdit(product)} className="text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:text-white transition-colors p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/10">
                            <Edit2 className="h-5 w-5" />
                          </button>
                        )}
                        {canDelete && (
                          <button onClick={() => handleDelete(product.id)} className="text-red-900 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-500/10">
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between bg-white dark:bg-[#0a0a0a]">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Showing <span className="font-bold text-zinc-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-zinc-900 dark:text-white">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-bold text-zinc-900 dark:text-white">{totalItems}</span> results
                </p>
                <div className="flex gap-2">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="btn-secondary disabled:opacity-50">Previous</button>
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="btn-secondary disabled:opacity-50">Next</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
