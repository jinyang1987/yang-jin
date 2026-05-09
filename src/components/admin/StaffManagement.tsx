import React, { useState } from 'react';
import { Users, Search, Filter, Mail, Shield, MoreHorizontal, UserPlus, Trash2, Edit3, CheckCircle2 } from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'handler' | 'user';
  department: string;
  status: 'active' | 'inactive';
  lastActive: string;
}

const MOCK_STAFF: StaffMember[] = [
  { id: '1', name: '张经理', email: 'zhang@xiaolu.com', role: 'admin', department: '集成部', status: 'active', lastActive: '2分钟前' },
  { id: '2', name: '李工程', email: 'li@xiaolu.com', role: 'handler', department: '软件部', status: 'active', lastActive: '1小时前' },
  { id: '3', name: '王专员', email: 'wang@xiaolu.com', role: 'user', department: '行政部', status: 'active', lastActive: '昨天' },
  { id: '4', name: '赵测试', email: 'zhao@xiaolu.com', role: 'user', department: '软件部', status: 'inactive', lastActive: '一周前' },
];

export default function StaffManagement() {
  const [staff] = useState<StaffMember[]>(MOCK_STAFF);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
      <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-600/20">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">全域人员管理</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Directory & Identity Registry</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="搜索职员姓名或邮箱..."
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-colors">
            <Filter size={18} />
          </button>
          <button className="px-6 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl hover:bg-amber-700 transition-all active:scale-95 flex items-center gap-2">
            <UserPlus size={16} /> 新增人员
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 italic bg-slate-50/30">
              <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">基本信息</th>
              <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">部门/职能</th>
              <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">安全权重</th>
              <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">当前模态</th>
              <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500 text-right">控制</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr key={member.id} className="group border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 border border-slate-200 uppercase">
                      {member.name.substring(0, 1)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{member.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Mail size={10} /> {member.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-4">
                  <div className="inline-flex items-center px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-600 uppercase tracking-tight">
                    {member.department}
                  </div>
                </td>
                <td className="px-8 py-4">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    member.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                    member.role === 'handler' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                    'bg-slate-50 text-slate-400 border border-slate-100'
                  }`}>
                    <Shield size={10} />
                    {member.role === 'admin' ? '超级管理员' : member.role === 'handler' ? '业务经办人' : '系统用户'}
                  </div>
                </td>
                <td className="px-8 py-4">
                  <div className="space-y-1">
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold ${member.status === 'active' ? 'text-emerald-500' : 'text-slate-300'}`}>
                      <CheckCircle2 size={12} />
                      {member.status === 'active' ? '激活状态' : '已封禁'}
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono">LAs: {member.lastActive}</div>
                  </div>
                </td>
                <td className="px-8 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                      <Edit3 size={16} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 size={16} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest">
        <span>Displaying {staff.length} Active Records</span>
        <div className="flex gap-2">
          <button className="px-2 py-1 text-slate-400 hover:text-slate-900 transition-colors">Prev</button>
          <button className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-900">1</button>
          <button className="px-2 py-1 text-slate-400 hover:text-slate-900 transition-colors">Next</button>
        </div>
      </div>
    </div>
  );
}
