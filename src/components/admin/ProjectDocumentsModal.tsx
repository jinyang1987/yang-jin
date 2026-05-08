import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Download, ExternalLink, Filter, Search, BookOpen } from 'lucide-react';

interface ProjectDocumentsModalProps {
  project: { id: string, name: string, code: string } | null;
  onClose: () => void;
}

export default function ProjectDocumentsModal({ project, onClose }: ProjectDocumentsModalProps) {
  const mockDocs = [
    { name: '立项申请报告_V1.pdf', type: 'PDF', size: '2.4MB', date: '2024-04-10', category: '立项资料' },
    { name: '中标通知书_扫描件.jpg', type: 'IMAGE', size: '1.2MB', date: '2024-04-15', category: '招投标' },
    { name: '系统设计方案最终稿.docx', type: 'DOCX', size: '4.8MB', date: '2024-04-20', category: '技术文档' },
    { name: '第一阶段验收报告.pdf', type: 'PDF', size: '1.1MB', date: '2024-05-05', category: '验收资料' },
  ];

  return (
    <AnimatePresence>
      {project && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md cursor-pointer"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10"
          >
          {/* Header */}
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                <BookOpen size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{project.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest leading-none">
                    {project.code}
                  </span>
                  <span className="w-1 h-1 bg-slate-200 rounded-full" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    全量资料档案库
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-full transition-all"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex">
            {/* Sidebar - Categories */}
            <div className="w-48 border-r border-slate-100 p-6 space-y-2 bg-slate-50/30">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">资料分类</p>
              {['全部资料', '立项资料', '招投标', '技术文档', '验收资料', '其他汇报'].map((cat, i) => (
                <button 
                  key={cat}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    i === 0 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Main Grid */}
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-white">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                <div className="flex-1 relative w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    placeholder="在当前项目资料中检索..."
                    className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl text-sm transition-all outline-none"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
                  <Filter size={14} /> 筛选排序
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mockDocs.map((doc, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group bg-slate-50/50 border border-slate-100 p-4 rounded-2xl hover:bg-white hover:shadow-xl hover:border-blue-100 transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                        <FileText size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate mb-1 group-hover:text-blue-600 transition-colors">{doc.name}</h4>
                        <div className="flex items-center gap-2">
                           <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-widest">{doc.type}</span>
                           <span className="text-[9px] font-medium text-slate-400">{doc.size}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                       <p className="text-[9px] font-mono text-slate-400">{doc.date} 著录</p>
                       <div className="flex gap-2">
                          <button className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                             <Download size={14} />
                          </button>
                          <button className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                             <ExternalLink size={14} />
                          </button>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
             <p className="text-[10px] text-slate-400 italic">共计 12 个资料文件，占用空间 45.2MB</p>
             <div className="flex gap-3">
                <button 
                  onClick={onClose}
                  className="px-6 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-100 rounded-xl transition-all"
                >
                  返回
                </button>
                <button className="px-8 py-2.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-black transition-all shadow-xl shadow-slate-200">
                  一键导出申请
                </button>
             </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
}
