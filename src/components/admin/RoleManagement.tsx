import React, { useState, useEffect } from 'react';
import { firestoreService } from '../../services/firestoreService';
import { AppRole, UserProfile, Permission } from '../../types';
import { Shield, UserPlus, Trash2, Edit2, Check, X, ShieldCheck, Settings, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const STATIC_PERMISSIONS: Permission[] = [
  { id: 'res_read', name: '资源查看', module: 'resources', action: 'read', description: '查看资源库条目' },
  { id: 'res_write', name: '资源录入', module: 'resources', action: 'write', description: '录入与修改资源' },
  { id: 'res_delete', name: '资源删除', module: 'resources', action: 'delete', description: '删除资源（至回收站）' },
  { id: 'arc_read', name: '档案查看', module: 'archives', action: 'read', description: '查看纸质档案目录' },
  { id: 'sys_config', name: '系统配置', module: 'system', action: 'config', description: '修改系统参数与模型' },
  { id: 'apr_audit', name: '审批权限', module: 'approvals', action: 'audit', description: '执行流程审核操作' },
];

export default function RoleManagement() {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'roles' | 'users'>('roles');
  const [editingRole, setEditingRole] = useState<Partial<AppRole> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [r, u] = await Promise.all([
      firestoreService.getRoles(),
      firestoreService.getAllUsers()
    ]);
    setRoles(r);
    setUsers(u);
    setLoading(false);
  };

  const handleSaveRole = async () => {
    if (!editingRole?.name) return;
    await firestoreService.saveRole(editingRole);
    setEditingRole(null);
    loadData();
  };

  const handleDeleteRole = async (id: string) => {
    if (window.confirm('确定要删除此角色吗？')) {
      await firestoreService.deleteRole(id);
      loadData();
    }
  };

  const togglePermission = (permId: string) => {
    if (!editingRole) return;
    const current = editingRole.permissions || [];
    const updated = current.includes(permId) 
      ? current.filter(id => id !== permId)
      : [...current, permId];
    setEditingRole({ ...editingRole, permissions: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('roles')}
            className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'roles' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white text-slate-400 border border-slate-200'}`}
          >
            角色权限配置
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white text-slate-400 border border-slate-200'}`}
          >
            成员角色指派
          </button>
        </div>
        {activeTab === 'roles' && (
          <button 
            onClick={() => setEditingRole({ name: '', description: '', permissions: [] })}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-black transition-all"
          >
            <Shield size={16} /> 新建角色
          </button>
        )}
      </div>

      {activeTab === 'roles' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map(role => (
            <motion.div 
              layout
              key={role.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-lg">
                  {role.name.substring(0, 1).toUpperCase()}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingRole(role)} className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors">
                    <Edit2 size={16} />
                  </button>
                  {!role.isSystem && (
                    <button onClick={() => handleDeleteRole(role.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">{role.name}</h3>
              <p className="text-[10px] text-slate-400 font-medium mb-4 uppercase tracking-wider">{role.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {role.permissions.map(pid => {
                  const p = STATIC_PERMISSIONS.find(sp => sp.id === pid);
                  return p ? (
                    <span key={pid} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold uppercase tracking-tighter">
                      {p.name}
                    </span>
                  ) : null;
                })}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">成员</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">部门</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">当前角色</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.uid} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">
                        {user.name.substring(0, 1)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{user.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono italic">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">{user.department}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                      {roles.find(r => r.id === user.role)?.name || user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={user.role}
                      onChange={async (e) => {
                        await firestoreService.updateUserRole(user.uid, e.target.value);
                        loadData();
                      }}
                      className="bg-white border border-slate-200 rounded px-2 py-1 outline-none text-[10px] font-bold uppercase transition-all focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="admin">系统管理员</option>
                      <option value="handler">事业部经办人</option>
                      <option value="user">普通用户</option>
                      {roles.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Role Editor Modal */}
      <AnimatePresence>
        {editingRole && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingRole(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 uppercase">角色定义</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">RBAC Policy Engine v1.0</p>
                  </div>
                </div>
                <button onClick={() => setEditingRole(null)} className="p-2 hover:bg-white rounded-full transition-all text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 overflow-auto space-y-8 flex-1 custom-scrollbar">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">角色名称</label>
                    <input 
                      value={editingRole.name}
                      onChange={e => setEditingRole({ ...editingRole, name: e.target.value })}
                      placeholder="例如：高级资料员"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">角色描述</label>
                    <input 
                      value={editingRole.description}
                      onChange={e => setEditingRole({ ...editingRole, description: e.target.value })}
                      placeholder="简短描述该角色的职能"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] mb-4">权限矩阵指派</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {STATIC_PERMISSIONS.map(p => {
                      const isActive = editingRole.permissions?.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          onClick={() => togglePermission(p.id)}
                          className={`flex items-start gap-4 p-4 rounded-2xl border transition-all text-left group ${isActive ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                        >
                          <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all ${isActive ? 'bg-blue-600 text-white' : 'bg-white border-2 border-slate-200'}`}>
                            {isActive && <Check size={14} />}
                          </div>
                          <div>
                            <p className={`text-xs font-bold transition-colors ${isActive ? 'text-blue-900' : 'text-slate-900'}`}>{p.name}</p>
                            <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider leading-relaxed mt-1">{p.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
                <button 
                  onClick={() => setEditingRole(null)}
                  className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  放弃更改
                </button>
                <button 
                  onClick={handleSaveRole}
                  className="px-10 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                >
                  保存授权规则
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
