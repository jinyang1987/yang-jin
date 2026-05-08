import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Box, 
  AlertTriangle,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { firestoreService } from '../../services/firestoreService';
import { ResourceInstance, WorkflowApplication } from '../../types';
import { useAuth } from '../../context/AuthContext';

export default function PhysicalReservation() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [resources, setResources] = useState<ResourceInstance[]>([]);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myReservations, setMyReservations] = useState<WorkflowApplication[]>([]);

  useEffect(() => {
    fetchResources();
    fetchMyReservations();
  }, [user]);

  const fetchResources = async () => {
    const data = await firestoreService.getResources('all');
    setResources(data);
  };

  const fetchMyReservations = async () => {
    const apps = await firestoreService.getApplications('physical_reservation', user?.uid);
    setMyReservations(apps);
  };

  const handleSubmit = async () => {
    if (selectedResources.length === 0 || !startTime || !endTime) return;
    setIsSubmitting(true);
    try {
      await firestoreService.createApplication({
        type: 'physical_reservation',
        applicantId: user!.uid,
        applicantName: user!.name,
        department: user!.department,
        targetResources: selectedResources,
        purpose,
        details: {
          borrowStartTime: new Date(startTime).getTime(),
          borrowEndTime: new Date(endTime).getTime(),
        }
      } as any);
      resetForm();
      fetchMyReservations();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedResources([]);
    setStartTime('');
    setEndTime('');
    setPurpose('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
        {/* Progress Bar */}
        <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex items-center gap-3">
             <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                <Calendar size={20} />
             </div>
             <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= 1 ? 'text-indigo-600' : 'text-slate-400'}`}>时间预约</span>
          </div>
          <div className="h-px w-10 bg-slate-100" />
          <div className="flex items-center gap-3">
             <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                <Box size={20} />
             </div>
             <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= 2 ? 'text-indigo-600' : 'text-slate-400'}`}>资源选择</span>
          </div>
          <div className="h-px w-10 bg-slate-100" />
          <div className="flex items-center gap-3">
             <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                <CheckCircle2 size={20} />
             </div>
             <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= 3 ? 'text-indigo-600' : 'text-slate-400'}`}>确认提交</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1 text-indigo-600">借用开始时间</label>
                  <input 
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-5 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-xl text-sm outline-none transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-2 italic px-1">* 提示: 仅支持工作日 9:00 - 17:00 预约</p>
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">预计归还时间</label>
                   <input 
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-5 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-xl text-sm outline-none transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-2 italic px-1 font-bold">* 最长借用期限: 4 个工作日</p>
                </div>
              </div>
              <div className="flex justify-end pt-6 border-t border-slate-50">
                 <button 
                  disabled={!startTime || !endTime}
                  onClick={() => setStep(2)}
                  className="px-10 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all active:scale-95 flex items-center gap-2"
                 >
                   下一步 <ChevronRight size={14} />
                 </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resources.map(res => (
                  <div 
                    key={res.id}
                    onClick={() => setSelectedResources(prev => 
                      prev.includes(res.id) ? prev.filter(id => id !== res.id) : [...prev, res.id]
                    )}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      selectedResources.includes(res.id) 
                        ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                        : 'bg-slate-50 border-transparent hover:border-slate-200'
                    }`}
                  >
                     <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedResources.includes(res.id) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white text-slate-300'}`}>
                           <Box size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-xs font-bold text-slate-900 truncate">{(res.data as any).name || '未命名资源'}</p>
                           <p className="text-[9px] text-slate-400 truncate">{res.id}</p>
                        </div>
                     </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-6 border-t border-slate-50">
                 <button onClick={() => setStep(1)} className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-xl">上一步</button>
                 <button 
                  disabled={selectedResources.length === 0}
                  onClick={() => setStep(3)}
                  className="px-10 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all active:scale-95 flex items-center gap-2"
                 >
                   检查详情 <ChevronRight size={14} />
                 </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                   <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-6">
                      <h4 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-4">借用行程概要</h4>
                      <div className="flex items-center gap-4 mb-4">
                         <div className="flex-1">
                            <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest">提货时间</p>
                            <p className="text-sm font-bold text-slate-900">{new Date(startTime).toLocaleString()}</p>
                         </div>
                         <ArrowRight className="text-indigo-300" size={16} />
                         <div className="flex-1">
                            <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest">归还截止</p>
                            <p className="text-sm font-bold text-slate-900">{new Date(endTime).toLocaleString()}</p>
                         </div>
                      </div>
                   </div>

                   <div className="bg-slate-50 rounded-3xl p-6">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">所选实物清单 ({selectedResources.length})</h4>
                      <div className="space-y-2">
                         {selectedResources.map(id => {
                           const res = resources.find(r => r.id === id);
                           return (
                             <div key={id} className="flex items-center gap-3 text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-100">
                                <CheckCircle2 className="text-emerald-500" size={14} />
                                {(res?.data as any)?.name || id}
                             </div>
                           );
                         })}
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">借用用途说明</label>
                   <textarea 
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="请输入详细的借用用途，审核时需查阅..."
                    className="w-full px-6 py-4 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-3xl text-sm outline-none transition-all min-h-[160px] resize-none"
                   />
                   <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl border border-red-100">
                      <AlertTriangle size={16} />
                      <p className="text-[9px] font-bold uppercase tracking-widest">领用前需现场手写板电子签名，严禁代领</p>
                   </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-50">
                 <button onClick={() => setStep(2)} className="px-8 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-all">上一步</button>
                 <button 
                  disabled={!purpose || isSubmitting}
                  onClick={handleSubmit}
                  className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                 >
                   {isSubmitting ? '正在提交...' : '完成预约并提交审批'}
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reservation History */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 tracking-[0.2em]">我的预约记录</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {myReservations.map(res => (
             <div key={res.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm group">
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                         <Calendar size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-900 mb-0.5">实物预约 #{res.id.slice(-4)}</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                          {new Date(res.details.borrowStartTime!).toLocaleDateString()}
                        </p>
                      </div>
                   </div>
                   <span className={`px-2 py-1 rounded text-[8px] font-bold uppercase tracking-widest ${
                      res.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                      res.status === 'rejected' ? 'bg-red-50 text-red-600' :
                      'bg-amber-50 text-amber-600'
                   }`}>
                      {res.status === 'approved' ? '已核准' : res.status === 'rejected' ? '已退回' : '待处理'}
                   </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-4 font-medium">
                  {new Date(res.details.borrowStartTime!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(res.details.borrowEndTime!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-50 group-hover:border-indigo-100 transition-colors">
                   <p className="text-[9px] text-slate-400 italic truncate max-w-[150px]">{res.purpose}</p>
                   {res.status === 'pending' && <button className="p-1 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>}
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
