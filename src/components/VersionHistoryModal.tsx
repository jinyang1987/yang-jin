import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, FileDown, User, Info } from 'lucide-react';
import { ResourceInstance } from '../types';

interface VersionHistoryModalProps {
  resource: ResourceInstance | null;
  onClose: () => void;
}

export default function VersionHistoryModal({ resource, onClose }: VersionHistoryModalProps) {
  if (!resource) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">版本演进历史</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  {(resource.data as any).name || resource.id}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-full transition-all"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
              {[...(resource.versions || []), { 
                version: resource.currentVersion || 1, 
                url: resource.fileUrl || '', 
                createdAt: resource.updatedAt, 
                createdBy: resource.ownerId || resource.createdBy
              }].reverse().map((ver, idx) => (
                <div key={idx} className="relative pl-8 border-l-2 border-slate-100 last:border-transparent group">
                  <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm transition-all ${idx === 0 ? 'bg-blue-600' : 'bg-slate-200 group-hover:bg-slate-400'}`} />
                  
                  <div className={`p-5 rounded-2xl border transition-all ${idx === 0 ? 'bg-blue-50/50 border-blue-100' : 'bg-slate-50/30 border-transparent hover:border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${idx === 0 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                         V{ver.version} {idx === 0 && ' (最新)'}
                       </span>
                       <span className="text-[10px] font-mono text-slate-400">
                         {new Date(ver.createdAt).toLocaleString()}
                       </span>
                    </div>
                    
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                            <User size={14} className="text-slate-400" />
                         </div>
                         <p className="text-xs font-medium text-slate-600">提交人: {ver.createdBy || '系统用户'}</p>
                      </div>
                      
                      {ver.url && (
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 uppercase tracking-widest transition-all shadow-sm">
                          <FileDown size={14} /> 下载
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {(!resource.versions || resource.versions.length === 0) && (
              <div className="py-12 text-center">
                 <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Info size={24} className="text-slate-200" />
                 </div>
                 <p className="text-sm text-slate-400 italic">暂无历史版本记录</p>
              </div>
            )}
          </div>
          
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
             <button 
              onClick={onClose}
              className="px-6 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-black transition-all"
             >
               关闭窗口
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
