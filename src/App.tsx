/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Layout from './components/layout/Layout';
import SummaryCards from './components/dashboard/SummaryCards';
import ResourceTable from './components/dashboard/ResourceTable';
import DynamicForm from './components/dynamic/DynamicForm';
import CategoryDesigner from './components/admin/CategoryDesigner';
import UtilizationView from './components/utilization/UtilizationView';
import ArchiveManager from './components/admin/ArchiveManager';
import ProjectManager from './components/admin/ProjectManager';
import ApprovalEngine from './components/admin/ApprovalEngine';
import RoleManagement from './components/admin/RoleManagement';
import OrgManagement from './components/admin/OrgManagement';
import StaffManagement from './components/admin/StaffManagement';
import VersionHistoryModal from './components/VersionHistoryModal';
import BulkImportModal from './components/BulkImportModal';
import { MOCK_CATEGORIES, MOCK_RESOURCES } from './constants';
import { ResourceCategory, ResourceInstance } from './types';
import { Plus, Filter, Search, ChevronRight, ArrowLeft, LogIn, Loader2, FileText, Trash2, Upload, Settings, Shield, Network, Users as UsersIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { firestoreService } from './services/firestoreService';

function MainApp() {
  const { user, profile, loading, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [resources, setResources] = useState<ResourceInstance[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [viewingVersionResource, setViewingVersionResource] = useState<ResourceInstance | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Expiry check logic for global alerts
  const expiredCount = useMemo(() => {
    return resources.filter(res => {
      if (res.status === 'expired') return true;
      if (res.expiryDate && typeof res.expiryDate === 'number' && res.expiryDate < Date.now()) return true;
      
      // Also check common data fields for date-based expiry
      const dataExpiry = res.data.expiryDate || res.data.validUntil || res.data.expirationDate;
      if (dataExpiry) {
        const timestamp = typeof dataExpiry === 'number' ? dataExpiry : new Date(dataExpiry).getTime();
        return !isNaN(timestamp) && timestamp > 0 && timestamp < Date.now();
      }
      return false;
    }).length;
  }, [resources]);

  // Combined filtering logic moved below for cleaner structure

  // Fetch initial data
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (user && profile && !hasInitialized.current) {
      const init = async () => {
        try {
          const cats = await firestoreService.getCategories();
          if (cats.length > 0) {
            setCategories(cats);
          } else if (profile?.role === 'admin') {
            // First time setup: populate with MOCK_CATEGORIES
            for (const cat of MOCK_CATEGORIES) {
              await firestoreService.saveCategory(cat);
            }
            const fetched = await firestoreService.getCategories();
            setCategories(fetched);

            // Also populate some mock archives and applications for demo
            await firestoreService.createArchive({
              code: 'XL-2024-DA001',
              title: '2024年度小鹿数字化转型战略合作协议',
              type: 'paper',
              location: '档案馆-A区-12架',
              status: 'available',
              description: '核心战略协议原件',
              department: profile.department || 'strategic'
            } as any);

            const apps = await firestoreService.getApplications();
            if (apps.length === 0) {
              await firestoreService.createApplication({
                type: 'print',
                applicantId: user.uid,
                applicantName: profile.name || 'Admin',
                department: profile.department || 'strategic',
                targetResources: ['r-001'],
                purpose: '项目投标文书正式打印盖章申请',
                details: { printQuantity: 5 }
              });
            }

            // Populate mock resources
            const existingResources = await firestoreService.getResources(cats[0].id);
            if (existingResources.length === 0) {
              for (const res of MOCK_RESOURCES) {
                // Determine category ID based on name or just use the first for now
                const catId = cats.find(c => c.name.includes('集成') || c.name.includes('文档'))?.id || cats[0].id;
                await firestoreService.createResource(catId, res.data, profile.department || 'integration');
              }
              const updatedRes = await firestoreService.getResources(selectedCategoryId || cats[0].id);
              setResources(updatedRes);
            }
          }
          hasInitialized.current = true;
        } catch (e) {
          console.error("Initialization error:", e);
        }
      };
      init();
    }
  }, [user, profile]);

  // Fetch resources when category changes
  useEffect(() => {
    if (user && selectedCategoryId) {
      const fetchRes = async () => {
        const data = await firestoreService.getResources(selectedCategoryId);
        setResources(data);
      };
      fetchRes();
    }
  }, [user, selectedCategoryId]);

  // Ensure a category is selected if available
  useEffect(() => {
    if (categories.length > 0 && (!selectedCategoryId || !categories.find(c => c.id === selectedCategoryId))) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  const selectedCategory = useMemo(() => 
    categories.find(c => c.id === selectedCategoryId),
  [categories, selectedCategoryId]);

  const filteredResources = useMemo(() => {
    let list = resources.filter(r => r.categoryId === selectedCategoryId);
    
    // Role-based data isolation
    if (profile?.role === 'handler') {
      list = list.filter(r => r.createdBy === profile.uid || r.status === 'approved');
    } else if (profile?.role === 'user') {
      // Standard users only see approved resources
      list = list.filter(r => r.status === 'approved');
    }

    if (showDeleted) {
      return list.filter(r => r.status === 'deleted');
    }
    return list.filter(r => r.status !== 'deleted');
  }, [resources, selectedCategoryId, showDeleted, profile]);

  const handleCreateResource = async (data: Record<string, any>, file: File | null) => {
    if (!profile) return;
    try {
      const fileUrl = file ? URL.createObjectURL(file) : ''; // Mock upload
      const categoryId = selectedCategoryId;
      await firestoreService.createResource(categoryId, { ...data, fileUrl }, profile.department);
      const updated = await firestoreService.getResources(selectedCategoryId);
      setResources(updated);
      setActiveTab('resources');
    } catch (e) {
      console.error(e);
      alert('创建失败');
    }
  };

  const handleUpdateResource = async (data: Record<string, any>, file: File | null, comment?: string) => {
    if (!editingResourceId || !profile) return;
    try {
      const existing = currentEditingResource;
      if (!existing) return;

      const fileUrl = file ? URL.createObjectURL(file) : existing.fileUrl; // Mock upload
      
      // If file changed or some important data changed, we can trigger versioning
      if (file || comment) {
        await firestoreService.addResourceVersion(editingResourceId, {
          version: (existing.versions?.length || 0) + 1,
          url: existing.fileUrl || '',
          name: existing.data['name'] || 'Old Version',
          createdBy: profile.name || 'Admin',
          comment: comment || 'Update'
        } as any);
      }

      await firestoreService.updateResource(editingResourceId, { data, fileUrl } as any);
      const updated = await firestoreService.getResources(selectedCategoryId);
      setResources(updated);
      setEditingResourceId(null);
      setActiveTab('resources');
    } catch (e) {
      console.error(e);
      alert('更新失败');
    }
  };

  const handleBulkImport = async (entries: any[]) => {
    if (!profile || !selectedCategoryId) return;
    try {
      await firestoreService.batchCreateResources(selectedCategoryId, entries, profile.department);
      const updated = await firestoreService.getResources(selectedCategoryId);
      setResources(updated);
      setIsImportModalOpen(false);
      alert('批量导入任务已加入队列并成功执行');
    } catch (e) {
      console.error(e);
      alert('批量处理失败');
    }
  };

  const currentEditingResource = useMemo(() => 
    editingResourceId ? resources.find(r => r.id === editingResourceId) : null,
  [resources, editingResourceId]);

  if (loading || (user && fetching && !hasInitialized.current)) {
    return (
      <div className="h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="animate-pulse font-bold tracking-widest text-[10px] uppercase text-slate-400">Initializing System MetaData...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-10 shadow-2xl text-center"
        >
          <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-8 shadow-lg shadow-blue-500/20">
             <span className="text-4xl font-bold italic text-white">XL</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">小鹿灵动资管</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-10">Meta-Driven Resource Management System</p>
          
          <button 
            onClick={login}
            className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/10"
          >
            <LogIn size={20} />
            使用 Google 账号登录
          </button>
          
          <p className="mt-8 text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-loose">
            仅限小鹿内部员工授权访问。系统基于元数据模型驱动。
          </p>
        </motion.div>
      </div>
    );
  }

  const handleSaveModels = async (updated: ResourceCategory[]) => {
    if (profile?.role !== 'admin') {
      alert('只有管理员可以保存模型配置');
      return;
    }
    
    try {
      setFetching(true);
      
      // Identify categories that were deleted in the designer
      const updatedIds = new Set(updated.map(u => u.id));
      const deletedCategoriesIds = categories
        .filter(c => !updatedIds.has(c.id))
        .map(c => c.id);
      
      console.log("Saving categories in batch. Updating:", updated.length, "Deleting:", deletedCategoriesIds);
      
      await firestoreService.saveCategoriesBatch(updated, deletedCategoriesIds);
      
      // Update local state with the newly saved configuration
      setCategories(updated);
      
      // If the currently selected category was deleted, select the first available one
      if (selectedCategoryId && !updatedIds.has(selectedCategoryId)) {
        setSelectedCategoryId(updated[0]?.id || '');
      }
      
      alert('资源节点模型与纵深架构已成功保存至云端');
    } catch (e) {
      console.error("Save models error:", e);
      alert('保存失败，请检查模型权限或网络连接');
    } finally {
      setFetching(false);
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      onApplyChanges={() => {
        if (activeTab === 'designer') {
          // In a real app we'd trigger the save from designer, 
          // for now we show status or redirect to let user use the explicit Save button
          alert('请点击设计器页面内的“保存模型”按钮以提交更改');
        } else {
          setActiveTab('designer');
        }
      }}
      categories={categories}
      selectedCategoryId={selectedCategoryId}
      onCategorySelect={setSelectedCategoryId}
    >
      <div className="space-y-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 mb-2 leading-tight">
                    下午好, <span className="text-blue-600">{profile?.name || user.displayName}</span>
                  </h1>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest px-1">
                    {profile?.department === 'integration' ? '集成部' : profile?.department === 'software' ? '软件部' : '小鹿云'} • {profile?.role === 'admin' ? '系统管理员' : profile?.role === 'handler' ? '事业部经办人' : '普通用户'}
                  </p>
                </div>
                {profile?.role !== 'user' && (
                  <button 
                    onClick={() => {
                      setEditingResourceId(null);
                      setActiveTab('create');
                      if (!selectedCategoryId && categories.length > 0) {
                        setSelectedCategoryId(categories[0].id);
                      }
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 transition-all active:scale-95"
                  >
                    <Plus size={20} /> 新建录入
                  </button>
                )}
              </div>

              <SummaryCards 
                total={resources.length}
                pending={resources.filter(r => r.status === 'pending').length}
                approved={resources.filter(r => r.status === 'approved').length}
                expired={expiredCount}
              />

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-widest">
                    最近动态
                  </h2>
                  <button 
                    onClick={() => setActiveTab('resources')}
                    className="text-[10px] uppercase font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1 group transition-colors"
                  >
                    查看全部 <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                
                {selectedCategory ? (
                   <ResourceTable 
                     resources={resources.slice(0, 5)} 
                     category={selectedCategory} 
                     onView={(id) => {
                       setEditingResourceId(id);
                       setActiveTab('create');
                     }}
                   />
                ) : (
                  <div className="p-12 border border-dashed border-slate-200 rounded-xl text-center text-slate-300 italic text-sm">
                    暂未配置资源分类
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'resources' && (
            <motion.div
              key="resources"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">资源库</h1>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest px-1">
                    Records: {resources.length} | Category: {selectedCategory?.name || 'Loading...'}
                  </p>
                </div>
                
                <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0">
                  {profile?.role !== 'user' && (
                    <>
                      <button 
                        onClick={() => {
                          setEditingResourceId(null);
                          setActiveTab('create');
                          if (!selectedCategoryId && categories.length > 0) {
                            setSelectedCategoryId(categories[0].id);
                          }
                          // Ensure we are at the top when navigating to form
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 transition-all active:scale-95 shrink-0 whitespace-nowrap"
                      >
                        <Plus size={18} />
                        <span className="text-xs">著录增补</span>
                      </button>
                      <button 
                        onClick={() => setIsImportModalOpen(true)}
                        className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors shadow-sm group"
                        title="批量导入"
                      >
                        <Upload size={18} className="group-hover:scale-110 transition-transform" />
                      </button>
                      {profile?.role === 'admin' && (
                        <button 
                          onClick={() => setShowDeleted(!showDeleted)}
                          className={`p-1.5 border rounded-md transition-all shadow-sm ${showDeleted ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-900 group'}`}
                          title={showDeleted ? '查看正常资源' : '查看回收站'}
                        >
                          <Trash2 size={18} className={showDeleted ? '' : 'group-hover:scale-110'} />
                        </button>
                      )}
                    </>
                  )}
                  <button className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm">
                    <Filter size={18} />
                  </button>
                </div>
              </div>

              {/* Category Header Info */}
              <div className="flex items-center gap-2 py-4 border-y border-slate-100 mb-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  当前视图：{selectedCategory?.name || '所有资源'}
                </span>
              </div>

              {selectedCategory ? (
                <ResourceTable 
                  resources={filteredResources} 
                  category={selectedCategory}
                  onView={(id) => {
                    setEditingResourceId(id);
                    setActiveTab('create');
                  }}
                  onEdit={(id) => {
                    setEditingResourceId(id);
                    setActiveTab('create');
                  }}
                  onDelete={async (id) => {
                    const msg = showDeleted ? '确定要永久物理删除此资源记录吗？此操作不可撤销。' : '确定要将此项移入回收站吗？';
                    if (window.confirm(msg)) {
                      try {
                        if (showDeleted) {
                          // Permanent delete or keep soft deleted for now
                          alert('只有系统管理员可以直接物理删除数据库记录');
                        } else {
                          await firestoreService.softDeleteResource(id);
                          const updated = await firestoreService.getResources(selectedCategoryId);
                          setResources(updated);
                        }
                      } catch (e) {
                        console.error("Delete error:", e);
                        alert('删除失败，可能由于权限不足。');
                      }
                    }
                  }}
                  onRestore={async (id) => {
                    try {
                      await firestoreService.restoreResource(id);
                      const updated = await firestoreService.getResources(selectedCategoryId);
                      setResources(updated);
                      alert('资源已成功从回收站还原');
                    } catch (e) {
                      console.error(e);
                      alert('还愿失败');
                    }
                  }}
                  onViewVersions={(res) => setViewingVersionResource(res)}
                />
              ) : (
                <div className="text-center py-20 text-slate-300 italic text-sm">加载分类数据中...</div>
              )}
            </motion.div>
          )}

          {activeTab === 'utilization' && (
            <motion.div
              key="utilization"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <UtilizationView />
            </motion.div>
          )}

          {activeTab === 'archives' && (
            <motion.div
              key="archives"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ArchiveManager />
            </motion.div>
          )}

          {activeTab === 'projects' && (
            <motion.div
              key="projects"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ProjectManager />
            </motion.div>
          )}

          {activeTab === 'approvals' && (
            <motion.div
              key="approvals"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ApprovalEngine />
            </motion.div>
          )}

          {activeTab === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    setActiveTab('dashboard');
                    setEditingResourceId(null);
                  }}
                  className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-400 hover:text-slate-900 transition-colors shadow-sm"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 leading-none mb-1">
                    {editingResourceId ? "编辑资源信息" : "新建资源录入"}
                  </h1>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    Category: {selectedCategory?.name || '未选择分类'}
                  </p>
                </div>
              </div>

              {selectedCategory ? (
                <DynamicForm 
                  title={editingResourceId ? "著录项更新" : "资源著录备案"}
                  submitLabel={editingResourceId ? "更新并保存" : "提交至待审"}
                  fields={selectedCategory.fields}
                  initialData={currentEditingResource?.data || {}}
                  existingFileUrl={currentEditingResource?.fileUrl}
                  onSubmit={(data, file, comment) => {
                    if (editingResourceId) {
                      handleUpdateResource(data, file, comment);
                    } else {
                      handleCreateResource(data, file);
                    }
                  }}
                />
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-16 text-center text-slate-400 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                    <FileText size={32} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">尚未定义资源分类</p>
                    <p className="text-xs">请先在模型设计器中创建一个资源分类，然后开始著录录入。</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('designer')}
                    className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-md text-xs font-bold hover:bg-blue-700 transition-colors"
                  >
                    前往模型设计器
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'system' && (
            <motion.div
              key="system"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">系统设置与管理</h1>
                <p className="text-sm text-slate-500 font-medium font-sans">全局参数配置、业务模型定义以及安全权限控制中心。</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <button
                  onClick={() => setActiveTab('designer')}
                  className="group relative bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200 transition-all text-left overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                    <Settings size={120} />
                  </div>
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <Settings size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">模型设计器</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    定义资源架构、层级关系及动态审批表单，构建业务数据蓝图。
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all">
                    立即进入 <ChevronRight size={14} />
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('rbac')}
                  className="group relative bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-200 transition-all text-left overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                    <Shield size={120} />
                  </div>
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <Shield size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">权限引擎</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    精细化角色权限矩阵、用户职能分配及数据访问隔离策略。
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all">
                    立即进入 <ChevronRight size={14} />
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('org')}
                  className="group relative bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-200 transition-all text-left overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                    <Network size={120} />
                  </div>
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <Network size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">组织架构</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    定义机构树、部门层级及隶属关系，映射企业实体运作逻辑。
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all">
                    立即进入 <ChevronRight size={14} />
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('staff')}
                  className="group relative bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-200 transition-all text-left overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                    <UsersIcon size={120} />
                  </div>
                  <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <UsersIcon size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">人员管理</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    维护员工档案、账号状态、岗位置换及入离职全生命周期。
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all">
                    立即进入 <ChevronRight size={14} />
                  </div>
                </button>

                <div className="bg-slate-50/50 p-8 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                    <Plus size={20} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">更多模块</h3>
                  <p className="text-xs text-slate-400 mt-2">更多管理工具正在接入中...</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'designer' && (
            <motion.div
              key="designer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">模型设计器</h1>
                  <p className="text-sm text-slate-500 font-medium font-sans">配置资源分类节点、纵深层级架构、著录项属性以及动态审批流程。</p>
                </div>
                {profile?.role === 'admin' && (
                  <div className="px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-md text-blue-600 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                    模型编辑权限已激活
                  </div>
                )}
              </div>

              <CategoryDesigner 
                initialCategories={categories} 
                onSave={handleSaveModels} 
              />
            </motion.div>
          )}

          {activeTab === 'rbac' && (
            <motion.div
              key="rbac"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">权限与角色引擎</h1>
                  <p className="text-sm text-slate-500 font-medium font-sans">定义自定义角色、映射权限矩阵以及指派用户职能。实现企业级细粒度访问控制。</p>
                </div>
              </div>

              <RoleManagement />
            </motion.div>
          )}
          
          {activeTab === 'org' && (
            <motion.div
              key="org"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">组织架构管理</h1>
                  <p className="text-sm text-slate-500 font-medium font-sans">设计和维护企业的法律实体、业务部门及班组层级。</p>
                </div>
              </div>
              <OrgManagement />
            </motion.div>
          )}

          {activeTab === 'staff' && (
            <motion.div
              key="staff"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">全域人员管理</h1>
                  <p className="text-sm text-slate-500 font-medium font-sans">管理员工账号生命周期、部门归属以及基本人事档案。</p>
                </div>
              </div>
              <StaffManagement />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <VersionHistoryModal 
        resource={viewingVersionResource} 
        onClose={() => setViewingVersionResource(null)} 
      />
      <BulkImportModal 
        isOpen={isImportModalOpen}
        category={selectedCategory || null}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleBulkImport}
      />
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}


