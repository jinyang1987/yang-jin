import React, { useState, useEffect } from 'react';
import { ResourceCategory, FieldSchema, FieldType } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Trash2, Settings, Save, AlertCircle, GripVertical, 
  ChevronDown, ChevronRight, FolderPlus, MoreVertical, Loader2
} from 'lucide-react';

interface CategoryDesignerProps {
  initialCategories: ResourceCategory[];
  onSave: (categories: ResourceCategory[]) => void;
}

export default function CategoryDesigner({ initialCategories, onSave }: CategoryDesignerProps) {
  const [categories, setCategories] = useState<ResourceCategory[]>(initialCategories);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(initialCategories[0]?.id || null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(initialCategories.map(c => c.id)));
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const lastSyncedRef = React.useRef(JSON.stringify(initialCategories));

  // Sync from props only when they actually change externally (e.g. after a save or global refresh)
  useEffect(() => {
    const stringified = JSON.stringify(initialCategories);
    if (stringified !== lastSyncedRef.current) {
      setCategories(initialCategories);
      lastSyncedRef.current = stringified;
      // Relocate selection if the current one is now invalid
      if (initialCategories.length > 0 && (!selectedCategoryId || !initialCategories.find(c => c.id === selectedCategoryId))) {
        setSelectedCategoryId(initialCategories[0].id);
      }
    }
  }, [initialCategories, selectedCategoryId]);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  const hasChanges = JSON.stringify(categories) !== JSON.stringify(initialCategories);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(categories);
      // SUCCESS: The parent will eventually update initialCategories to match our current categories
    } catch (e: any) {
      console.error("Designer: Save error:", e);
      let errorMsg = '保存失败，请检查模型权限或网络连接';
      try {
        if (e.message && e.message.startsWith('{')) {
          const detailed = JSON.parse(e.message);
          errorMsg = `保存失败: ${detailed.error || '权限不足'}`;
        } else if (e.message) {
          errorMsg = `保存失败: ${e.message}`;
        }
      } catch (parseError) {}
      alert(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedIds(next);
  };

  const handleAddField = () => {
    if (!selectedCategoryId) return;
    const newField: FieldSchema = {
      id: `f-${Math.random().toString(36).substr(2, 9)}`,
      name: '新字段',
      key: `field_${Math.random().toString(36).substr(2, 5)}`,
      type: FieldType.TEXT,
    };
    
    setCategories(prev => prev.map(c => 
      c.id === selectedCategoryId 
        ? { ...c, fields: [...c.fields, newField] }
        : c
    ));
  };

  const handleUpdateField = (fieldId: string, updates: Partial<FieldSchema>) => {
    setCategories(prev => prev.map(c => 
      c.id === selectedCategoryId 
        ? { ...c, fields: c.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f) }
        : c
    ));
  };

  const handleDeleteField = (fieldId: string) => {
    setCategories(prev => prev.map(c => 
      c.id === selectedCategoryId 
        ? { ...c, fields: c.fields.filter(f => f.id !== fieldId) }
        : c
    ));
  };

  const getDepth = (id: string): number => {
    let depth = 1;
    let curr = categories.find(c => c.id === id);
    while (curr?.parentId) {
      depth++;
      curr = categories.find(c => c.id === curr?.parentId);
    }
    return depth;
  };

  const nameInputRef = React.useRef<HTMLInputElement>(null);

  const handleAddCategory = (parentId?: string) => {
    if (parentId) {
      if (getDepth(parentId) >= 3) {
        alert('系统目前仅支持最高三级资源分类纵深');
        return;
      }
    }

    const newId = `cat-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newCat: ResourceCategory = {
      id: newId,
      name: parentId ? '新子分类节点' : '新顶级分类节点',
      icon: 'FileText',
      description: '点击此处编辑模型描述',
      parentId,
      fields: [{ id: 'f-init', name: '资源名称', key: 'name', type: FieldType.TEXT, validation: { required: true } }]
    };
    setCategories([...categories, newCat]);
    setSelectedCategoryId(newId);
    if (parentId) {
      const next = new Set(expandedIds);
      next.add(parentId);
      setExpandedIds(next);
    }
    
    // Focus the name input on next tick
    setTimeout(() => {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }, 100);
  };

  const handleDeleteCategory = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setConfirmDeleteId(id);
  };

  const executeDelete = () => {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    const catToDelete = categories.find(c => c.id === id);
    if (!catToDelete) {
      setConfirmDeleteId(null);
      return;
    }

    // BFS to find all descendants
    const idsToDelete = new Set([id]);
    const stack = [id];
    let safety = 0;
    while (stack.length > 0 && safety < 1000) {
      safety++;
      const pid = stack.pop();
      categories.forEach(c => {
        if (c.parentId === pid && !idsToDelete.has(c.id)) {
          idsToDelete.add(c.id);
          stack.push(c.id);
        }
      });
    }

    const nextCategories = categories.filter(c => !idsToDelete.has(c.id));
    
    // Atomically update state
    setCategories(nextCategories);

    // Relocate selection if necessary
    if (selectedCategoryId && idsToDelete.has(selectedCategoryId)) {
      const parentId = catToDelete.parentId;
      const siblings = nextCategories.filter(c => c.parentId === parentId);
      const nextId = siblings.length > 0 ? siblings[0].id : (parentId || nextCategories[0]?.id || null);
      setSelectedCategoryId(nextId);
    }
    
    setConfirmDeleteId(null);
  };

  const renderTree = (parentId?: string, level = 0) => {
    const children = categories.filter(c => c.parentId === parentId);
    if (children.length === 0 && parentId) return null;

    return (
      <div className={`flex flex-col gap-1 ${level > 0 ? 'ml-4 mt-1 border-l border-slate-100 pl-2' : ''}`}>
        {children.map(cat => {
          const hasChildren = categories.some(c => c.parentId === cat.id);
          const isExpanded = expandedIds.has(cat.id);
          const isSelected = selectedCategoryId === cat.id;

          return (
            <div key={cat.id} className="flex flex-col">
              <div
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-left border cursor-pointer ${
                  isSelected 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                    : 'bg-white border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div onClick={(e) => toggleExpand(cat.id, e)} className="p-0.5 hover:bg-white/20 rounded">
                  {hasChildren ? (
                    isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                  ) : (
                    <div className="w-[14px]" />
                  )}
                </div>
                
                <div className="font-bold text-[11px] truncate flex-1 uppercase tracking-tight">
                  {cat.name}
                </div>

                  <div className={`flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? 'opacity-100' : ''}`}>
                    {getDepth(cat.id) < 3 && (
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleAddCategory(cat.id); 
                        }}
                        className={`p-1.5 rounded-md transition-all ${isSelected ? 'hover:bg-blue-500 text-white' : 'hover:bg-slate-200 text-blue-600'}`}
                        title="添加子分类"
                      >
                        <FolderPlus size={14} />
                      </button>
                    )}
                    <button 
                      onClick={(e) => handleDeleteCategory(cat.id, e)}
                      className={`p-1.5 rounded-md transition-all ${isSelected ? 'hover:bg-blue-500 text-white' : 'hover:bg-red-50 text-red-500'}`}
                      title="删除分类"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
              </div>
              
              <AnimatePresence>
                {isExpanded && renderTree(cat.id, level + 1)}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-210px)] overflow-hidden">
      {/* Category Tree Sidebar */}
      <div className="w-full lg:w-72 flex flex-col gap-4 overflow-hidden">
        <div className="flex justify-between items-center px-1 flex-shrink-0">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">分类纵深架构</h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
                hasChanges 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-400 ring-offset-1' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
              title="提交更改至云端"
            >
              {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              {isSaving ? '提交中' : (hasChanges ? '提交更改' : '已同步')}
            </button>
            <button 
              onClick={() => handleAddCategory()}
              className="p-1.5 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 rounded-md transition-colors"
              title="添加顶级分类"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
          {renderTree()}
          {categories.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-xl text-slate-300 text-[10px] font-bold uppercase tracking-widest leading-loose">
              暂无节点<br/>点击上方按钮创建
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDeleteId(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="p-8">
                <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6 mx-auto rotate-3">
                   <AlertCircle size={28} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 text-center mb-3 uppercase tracking-tight">确定要移除该资源模型吗？</h3>
                <p className="text-xs text-slate-500 text-center leading-relaxed">
                  警告：此操作将从当前架构中移除该节点及其所有子层级。该更改在点击“提交更改”后才会永久保存至云端。
                </p>
              </div>
              <div className="grid grid-cols-2 border-t border-slate-100 bg-slate-50/50">
                <button 
                  onClick={() => setConfirmDeleteId(null)}
                  className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:bg-white transition-all border-r border-slate-100"
                >
                  取消操作
                </button>
                <button 
                  onClick={executeDelete}
                  className="py-4 text-[10px] font-bold text-red-600 uppercase tracking-widest hover:bg-white transition-all hover:text-red-700"
                >
                  确认移除
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm relative">
        {!selectedCategory ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-300">
             <AlertCircle size={48} className="mb-4 opacity-50" />
             <p className="text-sm font-medium italic">请选择左侧资源模型进行配置</p>
          </div>
        ) : (
          <>
            <header className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex-1 mr-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  正在编辑模型节点
                </div>
                <div className="flex gap-4">
                  <div className="w-16">
                    <input 
                      value={selectedCategory.icon}
                      onChange={(e) => setCategories(prev => prev.map(c => c.id === selectedCategory.id ? { ...c, icon: e.target.value } : c))}
                      className="text-center text-xs font-bold bg-white border border-slate-200 rounded-md px-1 py-1 outline-none text-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full shadow-sm"
                      placeholder="图标"
                      title="模型图标类名"
                    />
                  </div>
                  <div className="flex-1">
                    <input 
                      ref={nameInputRef}
                      value={selectedCategory.name}
                      onChange={(e) => setCategories(prev => prev.map(c => c.id === selectedCategory.id ? { ...c, name: e.target.value } : c))}
                      className="text-lg font-bold bg-white border border-slate-200 rounded-md px-3 py-1 outline-none text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full shadow-sm"
                      placeholder="分类节点名称"
                    />
                  </div>
                  <div className="flex-1">
                    <input 
                      value={selectedCategory.description}
                      onChange={(e) => setCategories(prev => prev.map(c => c.id === selectedCategory.id ? { ...c, description: e.target.value } : c))}
                      className="text-xs font-medium bg-white border border-slate-200 rounded-md px-3 py-2 outline-none text-slate-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full shadow-sm"
                      placeholder="分类描述文本"
                    />
                  </div>
                </div>
              </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={(e) => handleDeleteCategory(selectedCategory.id, e)}
                    className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 rounded-md transition-colors border border-transparent hover:border-red-100 group"
                    title="删除此分类节点"
                  >
                    <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">删除节点</span>
                  </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1 h-3 bg-blue-500 rounded-full"></div>
                  字段属性定义 (著录项架构)
                </h4>
                <button 
                  onClick={handleAddField}
                  className="flex items-center gap-1.5 text-[10px] bg-slate-900 text-white px-3 py-1.5 rounded-md font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors"
                >
                  <Plus size={12} /> 新增字段
                </button>
              </div>

              <div className="space-y-3">
                {selectedCategory.fields.map((field, i) => (
                  <motion.div 
                    key={field.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="grid grid-cols-12 gap-4 p-5 bg-white border border-slate-200 rounded-xl items-center group hover:border-blue-200 hover:shadow-sm transition-all"
                  >
                    <div className="col-span-1 text-slate-300 flex justify-center cursor-grab active:cursor-grabbing">
                      <GripVertical size={18} />
                    </div>
                    
                    <div className="col-span-3">
                      <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">显示名称</label>
                      <input 
                        value={field.name}
                        onChange={(e) => handleUpdateField(field.id, { name: e.target.value })}
                        placeholder="显示名称"
                        className="w-full bg-slate-50 border border-slate-100 rounded px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
                      />
                    </div>

                    <div className="col-span-3">
                      <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">字段标识 (Key)</label>
                      <input 
                        value={field.key}
                        onChange={(e) => handleUpdateField(field.id, { key: e.target.value })}
                        placeholder="field_key"
                        className="w-full bg-slate-50 border border-slate-100 rounded px-3 py-2 text-xs font-mono text-blue-600 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
                      />
                    </div>

                    <div className="col-span-3">
                      <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">数据类型</label>
                      <select 
                        value={field.type}
                        onChange={(e) => handleUpdateField(field.id, { type: e.target.value as FieldType })}
                        className="w-full bg-slate-50 border border-slate-100 rounded px-3 py-2 text-[10px] font-bold text-slate-600 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
                      >
                         {Object.values(FieldType).map(t => (
                           <option key={t} value={t}>{t.toUpperCase()}</option>
                         ))}
                      </select>
                    </div>

                    <div className="col-span-2 flex justify-end gap-1">
                       <button className="p-2 text-slate-300 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-all">
                         <Settings size={16} />
                       </button>
                       <button 
                         onClick={() => handleDeleteField(field.id)}
                         className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
