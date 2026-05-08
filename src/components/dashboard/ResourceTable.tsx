import React from 'react';
import { ResourceInstance, ResourceCategory } from '../../types';
import { Edit2, Trash2, Eye, RotateCcw, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';

interface ResourceTableProps {
  resources: ResourceInstance[];
  category: ResourceCategory;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  onRestore?: (id: string) => void;
  onViewVersions?: (resource: ResourceInstance) => void;
}

const statusMap = {
  draft: { label: '草稿', color: 'bg-slate-100 text-slate-500 border border-slate-200' },
  pending: { label: '处理中', color: 'bg-amber-50 text-amber-600 border border-amber-200' },
  approved: { label: '已通过', color: 'bg-emerald-50 text-emerald-600 border border-emerald-200' },
  rejected: { label: '已驳回', color: 'bg-red-50 text-red-600 border border-red-200' },
  archived: { label: '已归档', color: 'bg-slate-200 text-slate-500' },
  expired: { label: '无效', color: 'bg-red-600 text-white shadow-lg shadow-red-500/20 px-3' },
  deleted: { label: '回收站', color: 'bg-slate-100 text-slate-400' },
};

export default function ResourceTable({ resources, category, onEdit, onDelete, onView, onRestore, onViewVersions }: ResourceTableProps) {
  const { profile } = useAuth();
  const role = profile?.role || 'user';
  const isAdmin = role === 'admin';
  const isHandler = role === 'handler';
  const isStandardUser = role === 'user';

  // Show key fields + fixed system fields
  const displayFields = category.fields.slice(0, 3); 

  const isExpired = (res: ResourceInstance) => {
    if (res.status === 'expired') return true;
    if (res.expiryDate && typeof res.expiryDate === 'number' && res.expiryDate < Date.now()) return true;
    
    // Also check common data fields for date-based expiry
    const dataExpiry = res.data.expiryDate || res.data.validUntil || res.data.expirationDate;
    if (dataExpiry) {
      const timestamp = typeof dataExpiry === 'number' ? dataExpiry : new Date(dataExpiry).getTime();
      return !isNaN(timestamp) && timestamp > 0 && timestamp < Date.now();
    }
    
    return false;
  };

  const canEdit = (res: ResourceInstance) => {
    if (isAdmin) return true;
    if (isHandler && res.createdBy === profile?.uid) return true;
    return false;
  };

  const canDelete = (res: ResourceInstance) => {
    if (isAdmin) return true;
    if (isHandler && res.createdBy === profile?.uid) return true;
    return false;
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center w-16">ID</th>
              {displayFields.map(field => (
                <th key={field.id} className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {field.name}
                </th>
              ))}
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">状态</th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">修改时间</th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((res, i) => (
              <motion.tr
                key={res.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`group border-b border-slate-100 transition-colors ${isExpired(res) ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-slate-50'}`}
              >
                <td className="p-4 text-xs font-mono text-slate-400 text-center uppercase">
                  {res.id.split('-')[1] || i + 1}
                </td>
                
                {displayFields.map(field => (
                  <td key={field.id} className="p-4 text-sm font-semibold text-slate-700">
                    {formatValue(res.data[field.key])}
                  </td>
                ))}
                
                <td className="p-4 text-center">
                  {isExpired(res) ? (
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold whitespace-nowrap shadow-sm shadow-red-500/10 ${statusMap.expired.color}`}>
                      {statusMap.expired.label}
                    </span>
                  ) : (
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold whitespace-nowrap shadow-sm ${statusMap[res.status].color}`}>
                      {statusMap[res.status].label}
                    </span>
                  )}
                </td>
                
                <td className="p-4 text-xs text-slate-500 text-center font-mono">
                  {new Date(res.updatedAt).toLocaleDateString('zh-CN')}
                </td>
                
                <td className="p-4">
                  <div className="flex justify-end items-center gap-2">
                    <button 
                      onClick={() => onViewVersions?.(res)}
                      title="版本历史"
                      className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-all"
                    >
                      <Clock size={16} />
                    </button>
                    <button 
                      onClick={() => onView?.(res.id)}
                      title="查看详情"
                      className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-all"
                    >
                      <Eye size={16} />
                    </button>
                    
                    {res.status === 'deleted' ? (
                      <>
                        {isAdmin && (
                          <>
                            <button 
                              onClick={() => onRestore?.(res.id)}
                              title="还原"
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-all"
                            >
                              <RotateCcw size={16} />
                            </button>
                            <button 
                              onClick={() => onDelete?.(res.id)}
                              title="彻底删除"
                              className="p-1.5 text-red-400 hover:text-red-700 hover:bg-red-50 rounded transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                        {isHandler && res.createdBy === profile?.uid && (
                           <button 
                             onClick={() => onRestore?.(res.id)}
                             title="还原"
                             className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-all"
                           >
                             <RotateCcw size={16} />
                           </button>
                        )}
                      </>
                    ) : (
                      <>
                        {canEdit(res) && (
                          <button 
                            onClick={() => onEdit?.(res.id)}
                            title="编辑"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                        {canDelete(res) && (
                          <button 
                            onClick={() => onDelete?.(res.id)}
                            title="删除至回收站"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {resources.length === 0 && (
        <div className="p-20 flex flex-col items-center justify-center text-slate-300">
          <p className="text-sm italic">暂无有效记录</p>
        </div>
      )}
    </div>
  );
}

function formatValue(val: any) {
  if (val === null || val === undefined) return '-';
  if (typeof val === 'boolean') return val ? '是' : '否';
  if (Array.isArray(val)) return val.length > 0 ? `[${val.length}]` : '-';
  return String(val);
}
