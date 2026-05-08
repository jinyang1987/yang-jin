import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  FileText, 
  CheckCircle2, 
  Clock, 
  LayoutGrid,
  List,
  ChevronRight,
  Send,
  AlertCircle,
  Printer
} from 'lucide-react';
import { firestoreService } from '../../services/firestoreService';
import { ResourceInstance, ArchiveRecord, WorkflowApplication } from '../../types';
import { useAuth } from '../../context/AuthContext';

export default function PrintApplication() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [resources, setResources] = useState<ResourceInstance[]>([]);
  const [archives, setArchives] = useState<ArchiveRecord[]>([]);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [selectedArchives, setSelectedArchives] = useState<string[]>([]);
  const [purpose, setPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myApplications, setMyApplications] = useState<WorkflowApplication[]>([]);

  useEffect(() => {
    fetchData();
    fetchMyApplications();
  }, [user]);

  const fetchData = async () => {
    const resData = await firestoreService.getResources('all'); // Need to handle 'all' or categories
    const archData = await firestoreService.getArchives(user?.department);
    setResources(resData);
    setArchives(archData);
  };

  const fetchMyApplications = async () => {
    const apps = await firestoreService.getApplications('print', user?.uid);
    setMyApplications(apps);
  };

  const handleSubmit = async () => {
    if (selectedResources.length === 0 && selectedArchives.length === 0) return;
    setIsSubmitting(true);
    try {
      await firestoreService.createApplication({
        type: 'print',
        applicantId: user!.uid,
        applicantName: user!.name,
        department: user!.department,
        targetResources: selectedResources,
        targetArchives: selectedArchives,
        purpose,
        details: {
          printQuantity: 1,
          watermarkText: `${user?.name} - ${new Date().toLocaleDateString()}`
        }
      } as any);
      setStep(1);
      setSelectedResources([]);
      setSelectedArchives([]);
      setPurpose('');
      fetchMyApplications();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-6 mb-10">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${step === 1 ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-slate-100 text-slate-400'}`}>
            <LayoutGrid size={24} />
          </div>
          <div className="w-12 h-0.5 bg-slate-100" />
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${step === 2 ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-slate-100 text-slate-400'}`}>
            <Send size={24} />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {step === 1 ? '选择打印资源' : '完善申请信息'}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {step === 1 ? 'Step 1: Resource Selection' : 'Step 2: Submit Details'}
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText size={14} /> 投标资源名单
                  </h3>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {resources.map(res => (
                      <div 
                        key={res.id}
                        onClick={() => setSelectedResources(prev => 
                          prev.includes(res.id) ? prev.filter(id => id !== res.id) : [...prev, res.id]
                        )}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          selectedResources.includes(res.id) 
                            ? 'bg-blue-50 border-blue-200 shadow-sm' 
                            : 'bg-slate-50 border-transparent hover:border-slate-200'
                        }`}
                      >
                         <div className="flex items-center gap-3">
                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedResources.includes(res.id) ? 'bg-blue-600 text-white' : 'bg-white text-slate-400'}`}>
                             {selectedResources.includes(res.id) ? <CheckCircle2 size={16} /> : <FileText size={16} />}
                           </div>
                           <span className="text-sm font-medium text-slate-700">{(res.data as any).name || res.id}</span>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <LayoutGrid size={14} /> 档案资产名单
                  </h3>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {archives.map(arch => (
                      <div 
                        key={arch.id}
                        onClick={() => setSelectedArchives(prev => 
                          prev.includes(arch.id) ? prev.filter(id => id !== arch.id) : [...prev, arch.id]
                        )}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          selectedArchives.includes(arch.id) 
                            ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                            : 'bg-slate-50 border-transparent hover:border-slate-200'
                        }`}
                      >
                         <div className="flex items-center gap-3">
                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedArchives.includes(arch.id) ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400'}`}>
                             {selectedArchives.includes(arch.id) ? <CheckCircle2 size={16} /> : <LayoutGrid size={16} />}
                           </div>
                           <span className="text-sm font-medium text-slate-700">{arch.title}</span>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-slate-50">
                <button 
                  disabled={selectedResources.length === 0 && selectedArchives.length === 0}
                  onClick={() => setStep(2)}
                  className="px-8 py-3 bg-slate-900 hover:bg-black text-white text-sm font-bold uppercase tracking-widest rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  继续填写细节
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">申请用途 / 打印说明</label>
                <textarea 
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="请输入本次打印的具体用途，如：用于 XX 投标项目..."
                  className="w-full px-6 py-4 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 rounded-3xl text-sm transition-all outline-none min-h-[150px] resize-none"
                />
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
                <AlertCircle className="text-amber-500 flex-shrink-0" size={20} />
                <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                  安全提示：所有打印文件将自动加盖带有您个人信息的数字水印。审核通过后，打印权限仅在 <span className="font-bold underline">1 个自然日</span> 内有效。
                </p>
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-50">
                <button 
                  onClick={() => setStep(1)}
                  className="px-8 py-3 text-sm font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-all"
                >
                  上一步
                </button>
                <button 
                  disabled={!purpose || isSubmitting}
                  onClick={handleSubmit}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? '提交中...' : (
                    <>
                      <Send size={18} /> 提交申请
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Application History */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">申请历史纪录</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {myApplications.map(app => (
             <div key={app.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                         <Printer size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">打印申请 #{app.id.slice(-4)}</p>
                        <p className="text-[9px] text-slate-400 font-medium">提交于 {new Date(app.createdAt).toLocaleString()}</p>
                      </div>
                   </div>
                   <span className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-widest ${
                      app.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                      app.status === 'rejected' ? 'bg-red-50 text-red-600' :
                      'bg-amber-50 text-amber-600'
                   }`}>
                      {app.status === 'approved' ? '已核准' : app.status === 'rejected' ? '已拒绝' : '审核中'}
                   </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-4 bg-slate-50 p-2 rounded-lg truncate">
                   <FileText size={12} />
                   资源: {app.targetResources.length} | 档案: {app.targetArchives?.length || 0}
                </div>
                <div className="flex justify-between items-center">
                   <p className="text-[10px] text-slate-400 italic truncate max-w-[200px]">{app.purpose}</p>
                   {app.status === 'approved' && (
                     <button className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1">
                        立即打印 <ChevronRight size={12} />
                     </button>
                   )}
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
