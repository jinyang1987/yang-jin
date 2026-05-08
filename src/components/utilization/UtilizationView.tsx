import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CalendarClock, 
  Printer, 
  MessageSquare, 
  BarChart3, 
  ChevronRight,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import PrintApplication from './PrintApplication';
import PhysicalReservation from './PhysicalReservation';

type ModuleId = 'physical-reservation' | 'print-log' | 'sms-alerts' | 'analysis-reports' | null;

export default function UtilizationView() {
  const [activeModule, setActiveModule] = useState<ModuleId>(null);

  const modules = [
    {
      id: 'physical-reservation' as const,
      title: '实物预约登记',
      description: 'Physical Resource Reservation Registration',
      icon: <CalendarClock size={24} className="text-white" />,
      color: 'bg-indigo-600',
    },
    {
      id: 'print-log' as const,
      title: '打印登记',
      description: 'Print Distribution & Usage Log',
      icon: <Printer size={24} className="text-white" />,
      color: 'bg-blue-600',
    },
    {
      id: 'sms-alerts' as const,
      title: '短信提醒',
      description: 'Automated SMS Notification Service',
      icon: <MessageSquare size={24} className="text-white" />,
      color: 'bg-emerald-600',
    },
    {
      id: 'analysis-reports' as const,
      title: '分析报表',
      description: 'Utilization Analysis & Visual Reports',
      icon: <BarChart3 size={24} className="text-white" />,
      color: 'bg-amber-600',
    },
  ];

  if (activeModule === 'print-log') {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setActiveModule(null)}
          className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={16} /> 返回模块列表
        </button>
        <PrintApplication />
      </div>
    );
  }

  if (activeModule === 'physical-reservation') {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setActiveModule(null)}
          className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={16} /> 返回模块列表
        </button>
        <PhysicalReservation />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 mb-2">资源利用模块</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest px-1">
            Resource Utilization Gateway • 四大核心功能模块
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map((mod, idx) => (
          <motion.div
            key={mod.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveModule(mod.id)}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group flex flex-col h-full"
          >
            <div className={`w-12 h-12 ${mod.color} rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
              {mod.icon}
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2 truncate">{mod.title}</h3>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-6 flex-1">
              {mod.description}
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">进入模块</span>
              <ArrowRight size={16} className="text-blue-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 p-12 bg-white/50 border border-dashed border-slate-200 rounded-3xl text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <BarChart3 className="text-slate-300" size={32} />
        </div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">请选择功能模块进行操作</h3>
        <p className="text-xs text-slate-400 italic">点击上方卡片进入对应的业务操作系统，集成 Flowable 工作流引擎与第三方短信网关</p>
      </div>
    </div>
  );
}
