import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  User, 
  MessageSquare,
  ChevronRight,
  Filter,
  Search,
  ArrowRight,
  FileText,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { firestoreService } from '../../services/firestoreService';
import { WorkflowApplication } from '../../types';
import { useAuth } from '../../context/AuthContext';

export default function ApprovalEngine() {
  const { user, profile } = useAuth();
  const [applications, setApplications] = useState<WorkflowApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    fetchApplications();
  }, [user, filter]);

  const fetchApplications = async () => {
    setLoading(true);
    // In a real multi-user scenario, admins would see all, staff see 
    // their department or items they are assigned to.
    // For now, we fetch all applications for the admin/manager to review.
    const allApps = await firestoreService.getApplications(undefined, undefined); 
    setApplications(allApps.filter(a => a.status === filter));
    setLoading(false);
  };

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    if (!profile) return;
    try {
      if (status === 'approved') {
        await firestoreService.approveApplication(id, user!.uid, profile.name || 'Admin', '审批通过');
      } else {
        // Simple rejection logic: just update status for now
        await firestoreService.updateResourceStatus(id, 'rejected');
      }
      alert(`已成功执行：${status === 'approved' ? '批准' : '驳回'}`);
      fetchApplications();
    } catch (e) {
      console.error(e);
      alert('审批失败：' + (e instanceof Error ? e.message : String(e)));
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">著录审批与流转引擎</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Institutional Workflow • Multi-level Approval • Audit Trails
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
           {(['pending', 'approved', 'rejected'] as const).map(f => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                 filter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
               }`}
             >
               {f === 'pending' ? '待审核' : f === 'approved' ? '已核准' : '已退回'}
             </button>
           ))}
        </div>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4 group hover:border-amber-200 transition-all">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
               <Clock size={24} />
            </div>
            <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">本周待处理</p>
               <p className="text-xl font-bold text-slate-900">12 份申请</p>
            </div>
         </div>
         <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4 group hover:border-emerald-200 transition-all">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
               <CheckCircle2 size={24} />
            </div>
            <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">今日已核准</p>
               <p className="text-xl font-bold text-slate-900">34 项变更</p>
            </div>
         </div>
         <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4 group hover:border-blue-200 transition-all">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
               <Zap size={24} />
            </div>
            <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">平均处理效率</p>
               <p className="text-xl font-bold text-slate-900">4.2 小时</p>
            </div>
         </div>
      </div>

      {loading ? (
        <div className="py-20 text-center animate-pulse text-slate-300 italic text-sm">
           同步工作流状态中...
        </div>
      ) : (
        <div className="space-y-4">
           {applications.map((app, idx) => (
             <motion.div
               key={app.id}
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: idx * 0.05 }}
               className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center gap-6"
             >
                <div className="flex items-center gap-4 flex-1">
                   <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      {app.type === 'print' ? <FileText size={20}/> : <ShieldCheck size={20}/>}
                   </div>
                   <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                         <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                           {app.type === 'print' ? '打印授权' : app.type === 'physical_reservation' ? '实物领用' : '资源变更'}
                         </span>
                         <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">#{app.id.slice(-6)}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 truncate">申请人: {app.applicantName} ({app.department})</h4>
                      <p className="text-[10px] text-slate-400 italic truncate max-w-[300px]">{app.purpose}</p>
                   </div>
                </div>

                <div className="flex items-center gap-6 px-6 border-x border-slate-50">
                   <div className="text-center">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">申请资源数</p>
                      <p className="text-sm font-bold text-slate-700">{app.targetResources.length}</p>
                   </div>
                   <div className="text-center">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">提交时间</p>
                      <p className="text-sm font-bold text-slate-700">{new Date(app.createdAt).toLocaleDateString()}</p>
                   </div>
                </div>

                <div className="flex items-center gap-3">
                   {filter === 'pending' ? (
                     <>
                        <button 
                          onClick={() => handleAction(app.id, 'rejected')}
                          className="px-4 py-2 text-[10px] font-bold text-red-500 uppercase tracking-widest hover:bg-red-50 rounded-lg transition-all"
                        >
                          驳回
                        </button>
                        <button 
                          onClick={() => handleAction(app.id, 'approved')}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                        >
                          核准
                        </button>
                     </>
                   ) : (
                     <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">
                        <Clock size={14}/> {filter === 'approved' ? '已于当日处理完成' : '已根据流程要求退回'}
                     </div>
                   )}
                   <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                      <MoreVertical size={18} />
                   </button>
                </div>
             </motion.div>
           ))}

           {applications.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center text-slate-300">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <ClipboardCheck size={32} className="text-slate-200" />
                 </div>
                 <p className="text-sm italic font-medium">当前队列无待处理任务</p>
              </div>
           )}
        </div>
      )}
    </div>
  );
}

function MoreVertical(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}
