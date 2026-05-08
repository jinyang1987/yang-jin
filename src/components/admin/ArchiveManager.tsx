import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  Archive, 
  MapPin, 
  Clock, 
  ChevronRight,
  MoreVertical,
  Trash2,
  Edit,
  Activity,
  History,
  Box
} from 'lucide-react';
import { firestoreService } from '../../services/firestoreService';
import { ArchiveRecord } from '../../types';
import { useAuth } from '../../context/AuthContext';

export default function ArchiveManager() {
  const { user } = useAuth();
  const [archives, setArchives] = useState<ArchiveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newArchive, setNewArchive] = useState<Partial<ArchiveRecord>>({
    code: '',
    title: '',
    type: 'paper',
    location: '',
    status: 'available',
    description: ''
  });

  useEffect(() => {
    fetchArchives();
  }, [user]);

  const fetchArchives = async () => {
    setLoading(true);
    const data = await firestoreService.getArchives(user?.department);
    setArchives(data);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!newArchive.title || !newArchive.code) return;
    try {
      await firestoreService.createArchive({
        title: newArchive.title!,
        code: newArchive.code!,
        type: newArchive.type || 'paper',
        location: newArchive.location || '',
        status: 'available',
        description: newArchive.description || '',
        department: user?.department || 'Default'
      } as any);
      setIsAdding(false);
      setNewArchive({ code: '', title: '', type: 'paper', location: '', status: 'available', description: '' });
      fetchArchives();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = archives.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">档案资产管理</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Physical & Digital Archive Lifecycle Management
          </p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="text-xs font-bold uppercase tracking-wider">新增档案</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Stats */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">库存储备</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">总计档案</span>
                <span className="text-xl font-bold text-slate-900">{archives.length}</span>
              </div>
              <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-[70%]" />
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">今日动态</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Activity size={14} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-white">3 份档案借出中</p>
                  <p className="text-[9px] text-slate-500">截止至 17:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                placeholder="搜索档案编号或标题..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl text-sm transition-all outline-none"
              />
            </div>
            <button className="p-2.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
              <Filter size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((archive) => (
                <motion.div
                  key={archive.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                        <Box size={20} />
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{archive.code}</span>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{archive.title}</h4>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-widest ${
                      archive.status === 'available' ? 'bg-emerald-50 text-emerald-600' :
                      archive.status === 'borrowed' ? 'bg-amber-50 text-amber-600' :
                      'bg-red-50 text-red-600'
                    }`}>
                      {archive.status === 'available' ? '可借用' : archive.status === 'borrowed' ? '借出中' : '遗失'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <MapPin size={12} />
                      <span>{archive.location || '未设置存放位置'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <button className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:text-blue-600 transition-colors flex items-center gap-1">
                      <History size={12} /> 操作流水
                    </button>
                    <div className="flex gap-2">
                       <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"><Edit size={14}/></button>
                       <button className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 -z-10 opacity-50" />
              
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Plus className="text-blue-600" /> 新增档案登记
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">档案编号</label>
                  <input 
                    value={newArchive.code}
                    onChange={(e) => setNewArchive({...newArchive, code: e.target.value})}
                    placeholder="例如: DA-2024-001"
                    className="w-full px-4 py-2.5 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl text-sm transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">档案名称</label>
                  <input 
                    value={newArchive.title}
                    onChange={(e) => setNewArchive({...newArchive, title: e.target.value})}
                    placeholder="输入档案标题..."
                    className="w-full px-4 py-2.5 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl text-sm transition-all outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">档案类型</label>
                    <select 
                      value={newArchive.type}
                      onChange={(e) => setNewArchive({...newArchive, type: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl text-sm transition-all outline-none"
                    >
                      <option value="paper">纸质文档</option>
                      <option value="seal">实体印章</option>
                      <option value="hardware">硬件设备</option>
                      <option value="other">其他</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">存放位置</label>
                    <input 
                      value={newArchive.location}
                      onChange={(e) => setNewArchive({...newArchive, location: e.target.value})}
                      placeholder="如: A-01"
                      className="w-full px-4 py-2.5 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl text-sm transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-3 text-sm font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-all"
                >
                  取消
                </button>
                <button 
                  onClick={handleCreate}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                >
                  确认登记
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
