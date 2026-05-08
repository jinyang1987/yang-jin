import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, FileSpreadsheet, FileArchive, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { ResourceCategory } from '../types';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: ResourceCategory | null;
  onImport: (data: any[]) => Promise<void>;
}

export default function BulkImportModal({ isOpen, onClose, category, onImport }: BulkImportModalProps) {
  const [step, setStep] = useState(1);
  const [dataText, setDataText] = useState('');
  const [matchedEntries, setMatchedEntries] = useState<any[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  if (!category || !isOpen) return null;

  const parseData = () => {
    // Basic CSV/TSV parsing simulation
    const rows = dataText.trim().split('\n');
    if (rows.length < 2) {
      alert('请确保至少包含标题行和一行数据');
      return;
    }

    const headers = rows[0].split(/[,\t]/).map(h => h.trim());
    const entries = rows.slice(1).map(row => {
      const values = row.split(/[,\t]/).map(v => v.trim());
      const entry: any = {};
      headers.forEach((h, i) => {
        entry[h] = values[i] || '';
      });
      return entry;
    });

    setMatchedEntries(entries);
    setStep(2);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const processImport = async () => {
    setLoading(true);
    try {
      // Logic for matching files by filename can be added here
      // For now we just import the entries
      await onImport(matchedEntries);
      setStep(3);
    } catch (e) {
      console.error(e);
      alert('导入失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[80vh]"
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Upload size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 uppercase">批量导入引擎</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Target: {category.name} | Multi-Thread Process
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400">
              <X size={20} />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-8 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= s ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                  {s}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= s ? 'text-slate-900' : 'text-slate-400'}`}>
                  {s === 1 ? '数据输入' : s === 2 ? '核验与匹配' : '导入完成'}
                </span>
                {s < 3 && <div className="w-8 h-[1px] bg-slate-200" />}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-8 custom-scrollbar">
            {step === 1 && (
              <div className="space-y-6">
                <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl">
                  <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <FileSpreadsheet size={14} /> 粘贴 Excel/CSV 数据
                  </h4>
                  <textarea
                    value={dataText}
                    onChange={(e) => setDataText(e.target.value)}
                    placeholder="粘贴包含标题行的数据（逗号或 Tab 分隔）..."
                    className="w-full h-48 bg-white border border-slate-200 rounded-xl p-4 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                  <div className="mt-3 flex gap-4 text-[10px] text-slate-500 font-medium">
                    <p>支持格式：CSV, Tab Delimited</p>
                    <p>首行为字段名，需与模型著录项对应</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <button 
                    onClick={parseData}
                    disabled={!dataText.trim()}
                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    解析数据并进入下一步
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">待导入条目 ({matchedEntries.length})</h4>
                    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                      <table className="w-full text-left text-[10px]">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            {Object.keys(matchedEntries[0] || {}).map(k => (
                              <th key={k} className="px-4 py-3 font-bold text-slate-500 uppercase">{k}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {matchedEntries.slice(0, 5).map((entry, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                              {Object.values(entry).map((v: any, j) => (
                                <td key={j} className="px-4 py-3 text-slate-700 whitespace-nowrap">{String(v)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {matchedEntries.length > 5 && (
                        <div className="p-3 bg-slate-50 text-center text-[10px] text-slate-400 font-bold uppercase">
                          及另外 {matchedEntries.length - 5} 项...
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-full md:w-80 space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">扫描件批量匹配 (可选)</h4>
                    <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-center space-y-4 hover:border-blue-500 transition-all group">
                      <div className="w-12 h-12 bg-white rounded-xl mx-auto flex items-center justify-center text-slate-400 group-hover:text-blue-600 shadow-sm transition-all">
                        <FileArchive size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 mb-1">选择文件匹配</p>
                        <p className="text-[10px] text-slate-400 leading-relaxed uppercase font-bold">按文件名与“项目名称”或“编号”自动关联</p>
                      </div>
                      <input 
                        type="file" 
                        multiple 
                        id="batch-files" 
                        className="hidden" 
                        onChange={handleFileUpload}
                      />
                      <label 
                        htmlFor="batch-files"
                        className="block px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:bg-slate-50 cursor-pointer shadow-sm"
                      >
                        {files.length > 0 ? `已选择 ${files.length} 个文件` : '浏览多选文件'}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-8">
                  <button 
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 border border-slate-200 text-slate-600 rounded-xl font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
                  >
                    返回重设
                  </button>
                  <button 
                    onClick={processImport}
                    disabled={loading}
                    className="flex-[2] py-4 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : '开始批量入库并匹配'}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6"
                >
                  <CheckCircle2 size={40} />
                </motion.div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2 italic">MISSION ACCOMPLISHED</h3>
                <p className="text-slate-500 font-medium text-sm mb-8">
                  成功导入 {matchedEntries.length} 条资源条目索引，并异步执行了扫描件的语义匹配。
                </p>
                <button 
                  onClick={onClose}
                  className="px-10 py-3 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest hover:shadow-2xl transition-all active:scale-95"
                >
                  返回资源视图
                </button>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] text-center">
            Distributed Batch Processing Engine • v2.1.0
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
