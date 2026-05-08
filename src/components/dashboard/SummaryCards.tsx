import React from 'react';
import { motion } from 'motion/react';
import { FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface SummaryCardsProps {
  total: number;
  pending: number;
  approved: number;
  expired: number;
}

export default function SummaryCards({ total, pending, approved, expired }: SummaryCardsProps) {
  const stats = [
    { label: '载入资源总数', value: total.toLocaleString(), icon: <FileText className="text-blue-600" />, color: 'blue' },
    { label: '待处理审批项', value: pending.toString(), icon: <Clock className="text-amber-600" />, color: 'amber' },
    { label: '已核准状态项', value: approved.toString(), icon: <CheckCircle className="text-emerald-600" />, color: 'emerald' },
    { label: '到期预警风险', value: expired.toString(), icon: <AlertTriangle className="text-red-600" />, color: 'red' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white border border-slate-200 p-6 rounded-2xl hover:shadow-md hover:border-blue-200 transition-all shadow-sm group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors`}>
              {stat.icon}
            </div>
            <span className="text-2xl font-bold font-mono tracking-tighter text-slate-900">{stat.value}</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
          <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: '70%' }}
               className={`h-full bg-${stat.color}-600/60`} 
             />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
