import React, { useState } from 'react';
import { Network, Plus, Trash2, Edit3, ChevronRight, ChevronDown, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OrgNode {
  id: string;
  name: string;
  type: 'company' | 'department' | 'team';
  children?: OrgNode[];
}

const INITIAL_ORG: OrgNode[] = [
  {
    id: 'root',
    name: '小鹿集团总部',
    type: 'company',
    children: [
      {
        id: 'dept-1',
        name: '集成中心',
        type: 'department',
        children: [
          { id: 'team-1', name: '方案组', type: 'team' },
          { id: 'team-2', name: '实施组', type: 'team' }
        ]
      },
      {
        id: 'dept-2',
        name: '研发中心',
        type: 'department',
        children: [
          { id: 'team-3', name: '前端架构组', type: 'team' },
          { id: 'team-4', name: '后端系统组', type: 'team' }
        ]
      }
    ]
  }
];

export default function OrgManagement() {
  const [org, setOrg] = useState<OrgNode[]>(INITIAL_ORG);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['root', 'dept-1', 'dept-2']));

  const toggleExpand = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedIds(next);
  };

  const renderNode = (node: OrgNode, level = 0) => {
    const isExpanded = expandedIds.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="select-none">
        <div 
          className="flex items-center gap-2 group p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          style={{ paddingLeft: `${level * 24 + 8}px` }}
          onClick={() => hasChildren && toggleExpand(node.id)}
        >
          <div className="w-5 h-5 flex items-center justify-center text-slate-400">
            {hasChildren ? (
              isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
            ) : null}
          </div>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            node.type === 'company' ? 'bg-blue-100 text-blue-600' :
            node.type === 'department' ? 'bg-emerald-100 text-emerald-600' :
            'bg-amber-100 text-amber-600'
          }`}>
            <Building2 size={16} />
          </div>
          <div className="flex-1">
            <span className="text-sm font-bold text-slate-800">{node.name}</span>
            <span className="ml-2 text-[10px] uppercase font-bold text-slate-400 tracking-widest">
              {node.type === 'company' ? '企业总部' : node.type === 'department' ? '一级部门' : '业务单元'}
            </span>
          </div>
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
            <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
              <Plus size={14} />
            </button>
            <button className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors">
              <Edit3 size={14} />
            </button>
            <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        
        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="ml-4 border-l border-slate-100">
                {node.children!.map(child => renderNode(child, level + 1))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
      <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <Network size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">组织架构映射</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Entity Heirarchy Descriptor</p>
          </div>
        </div>
        
        <button className="px-6 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2">
          <Plus size={16} /> 初始化根节点
        </button>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl">
          {org.map(node => renderNode(node))}
        </div>
      </div>

      <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest">
        <div className="flex gap-4">
          <span>Total Nodes: 7</span>
          <span>Max Depth: 3</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Tree In Sync
        </div>
      </div>
    </div>
  );
}
