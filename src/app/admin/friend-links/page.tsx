'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Plus, Edit, Trash2, X, Save, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';

interface FriendLink {
    id: string;
    name: string;
    url: string;
    logo: string | null;
    sortOrder: number;
    isActive: boolean;
}

export default function FriendLinksPage() {
    const [links, setLinks] = useState<FriendLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    // 编辑状态
    const [currentLink, setCurrentLink] = useState<Partial<FriendLink>>({
        name: '',
        url: '',
        logo: '',
        sortOrder: 0,
        isActive: true,
    });

    const fetchLinks = async () => {
        try {
            const res = await fetch('/api/friend-links?admin=true');
            const data = await res.json();
            if (data.success) {
                setLinks(data.data);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLinks();
    }, []);

    const handleOpenModal = (link?: FriendLink) => {
        if (link) {
            setCurrentLink(link);
        } else {
            setCurrentLink({
                name: '',
                url: '',
                logo: '',
                sortOrder: 0,
                isActive: true,
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSaving(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const method = currentLink.id ? 'PUT' : 'POST';
            const url = currentLink.id ? `/api/friend-links/${currentLink.id}` : '/api/friend-links';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentLink),
            });
            const data = await res.json();

            if (data.success) {
                handleCloseModal();
                fetchLinks();
            } else {
                alert(data.error || '操作失败');
            }
        } catch (error) {
            alert('操作失败');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('确定要删除这个链接吗？')) return;

        try {
            const res = await fetch(`/api/friend-links/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setLinks(prev => prev.filter(l => l.id !== id));
            } else {
                alert('删除失败');
            }
        } catch (error) {
            alert('删除失败');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <AdminSidebar />

            <main className="flex-1 ml-64 p-8">
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">友情链接</h1>
                            <p className="text-gray-500 mt-1">管理网站底部的友情链接</p>
                        </div>
                        <button
                            onClick={() => handleOpenModal()}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            添加链接
                        </button>
                    </div>

                    {/* List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">名称/Logo</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">链接</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">排序</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">状态</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">加载中...</td></tr>
                                ) : links.length === 0 ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">暂无友情链接</td></tr>
                                ) : (
                                    links.map(link => (
                                        <tr key={link.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {link.logo ? (
                                                        <img src={link.logo} alt={link.name} className="w-8 h-8 rounded object-cover bg-gray-100" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs">Logo</div>
                                                    )}
                                                    <span className="font-medium text-gray-900">{link.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-blue-600 truncate max-w-xs">
                                                <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                    {link.url}
                                                </a>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {link.sortOrder}
                                            </td>
                                            <td className="px-6 py-4">
                                                {link.isActive ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <CheckCircle className="w-3 h-3" /> 启用
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        <XCircle className="w-3 h-3" /> 禁用
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleOpenModal(link)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(link.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Edit/Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-900">
                                {currentLink.id ? '编辑链接' : '添加友情链接'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">网站名称 <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={currentLink.name}
                                    onChange={e => setCurrentLink(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="例如：BuySoft"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">链接地址 <span className="text-red-500">*</span></label>
                                <input
                                    type="url"
                                    required
                                    value={currentLink.url}
                                    onChange={e => setCurrentLink(prev => ({ ...prev, url: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="https://..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL (可选)</label>
                                <input
                                    type="url"
                                    value={currentLink.logo || ''}
                                    onChange={e => setCurrentLink(prev => ({ ...prev, logo: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="https://.../logo.png"
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">排序权重</label>
                                    <input
                                        type="number"
                                        value={currentLink.sortOrder}
                                        onChange={e => setCurrentLink(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                                    <select
                                        value={currentLink.isActive ? 'true' : 'false'}
                                        onChange={e => setCurrentLink(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="true">启用</option>
                                        <option value="false">禁用</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    {saving && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
                                    保存
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
