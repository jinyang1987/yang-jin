import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  FolderOpen, 
  FileText, 
  ChevronRight,
  Filter,
  MoreVertical,
  Calendar,
  User,
  Star,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import ProjectDocumentsModal from './ProjectDocumentsModal';

interface ProjectRecord {
  id: string;
  name: string;
  code: string;
  department: string;
  status: 'ongoing' | 'completed' | 'archived';
  updateTime: string;
  manager: string;
  tags: string[];
}

export default function ProjectManager() {
  const { user } = useAuth();
  const [viewingProject, setViewingProject] = useState<ProjectRecord | null>(null);
  const [projects, setProjects] = useState<ProjectRecord[]>([
    {
      id: 'p-1',
      name: '2024年市政枢纽智慧监控系统集成项目',
      code: 'PROJ-SZ-2405',
      department: '智慧城市事业部',
      status: 'ongoing',
      updateTime: '2024-05-01',
      manager: '张建国',
      tags: ['系统集成', '重点工程']
    },
    {
      id: 'p-2',
      name: '省图书馆数字化升级采购项目',
      code: 'PROJ-WH-2403',
      department: '文化教育业务部',
      status: 'completed',
      updateTime: '2024-04-15',
      manager: '李晓华',
      tags: ['软件研发']
    },
    {
      id: 'p-3',
      name: '2024小鹿云底座技术支持年度服务',
      code: 'PROJ-XL-2401',
      department: '小鹿云事业部',
      status: 'ongoing',
      updateTime: '2024-05-04',
      manager: '刘建平',
      tags: ['年度运维', '云计算']
    },
    {
      id: 'p-4',
      name: '轨道交通1号线AFC自动售检票系统',
      code: 'PROJ-JT-2408',
      department: '交通事业部',
      status: 'archived',
      updateTime: '2023-12-20',
      manager: '陈勇',
      tags: ['AFC系统', '硬件集成']
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">项目资料全生命周期管理</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Project Documents • Bid Notices • Acceptance Reports • Appreciation Letters
          </p>
        </div>
        <button 
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-black text-white rounded-xl shadow-xl shadow-slate-200 transition-all active:scale-95 group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="text-xs font-bold uppercase tracking-wider">立项录入</span>
        </button>
      </header>

      {/* Global Filter Bar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            placeholder="搜索项目名称、编号或负责人..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl text-sm transition-all outline-none"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-4 py-3 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
            <Filter size={16} /> 筛选
          </button>
          <button className="flex-1 md:flex-none px-4 py-3 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
             导出清单
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project, idx) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all group border-l-4 border-l-blue-600"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest">{project.code}</span>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {project.name}
                </h3>
              </div>
              <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${
                project.status === 'ongoing' ? 'bg-blue-50 text-blue-600' :
                project.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                'bg-slate-50 text-slate-500'
              }`}>
                {project.status === 'ongoing' ? '执行中' : project.status === 'completed' ? '已收尾' : '已归档'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 p-3 rounded-2xl">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                  <User size={10} /> 项目负责人
                </p>
                <p className="text-xs font-bold text-slate-700">{project.manager}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Calendar size={10} /> 更新于
                </p>
                <p className="text-xs font-bold text-slate-700">{project.updateTime}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8 uppercase tracking-tighter">
              {project.tags.map(tag => (
                <span key={tag} className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                   #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center">
                    <FileText size={12} className="text-slate-400" />
                  </div>
                ))}
                <div className="w-7 h-7 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-[8px] font-bold text-white">
                  +5
                </div>
              </div>
              <button 
                onClick={() => setViewingProject(project)}
                className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest hover:translate-x-1 transition-transform group/btn"
              >
                查看资料全集 <ChevronRight size={16} className="group-hover/btn:scale-125 transition-transform" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <ProjectDocumentsModal 
        project={viewingProject} 
        onClose={() => setViewingProject(null)} 
      />

      {/* Empty State / Hint */}
      <div className="mt-8 p-12 bg-white/50 border border-dashed border-slate-200 rounded-3xl text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpen className="text-blue-200" size={32} />
        </div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">项目库已与 OA 系统同步</h3>
        <p className="text-xs text-slate-400 italic">点击卡片可查看立项报告、中标通知书及最终验收文档，所有导出操作均有日志追踪</p>
      </div>
    </div>
  );
}
