import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  FileText, 
  ClipboardCheck, 
  Bell, 
  User, 
  Menu,
  X,
  Plus,
  ChevronRight,
  BarChart3,
  Archive,
  FolderOpen,
  ChevronDown,
  Layers,
  Shield,
  Network,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResourceCategory } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  collapsed?: boolean;
  hasSubmenu?: boolean;
  isSubmenuOpen?: boolean;
}

const SidebarItem = ({ icon, label, active, onClick, collapsed, hasSubmenu, isSubmenuOpen }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-blue-600 text-white shadow-lg' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <div className="flex-shrink-0">{icon}</div>
    {!collapsed && <span className="font-medium truncate text-sm flex-1 text-left">{label}</span>}
    {hasSubmenu && !collapsed && (
      <ChevronDown 
        size={14} 
        className={`transition-transform duration-200 ${isSubmenuOpen ? 'rotate-180' : ''}`} 
      />
    )}
  </button>
);

export default function Layout({ 
  children, 
  activeTab, 
  onTabChange,
  onApplyChanges,
  categories = [],
  selectedCategoryId,
  onCategorySelect
}: { 
  children: React.ReactNode,
  activeTab: string,
  onTabChange: (id: string) => void,
  onApplyChanges?: () => void,
  categories?: ResourceCategory[],
  selectedCategoryId?: string,
  onCategorySelect?: (id: string) => void
}) {
  const { profile } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(true);
  const [isSystemOpen, setIsSystemOpen] = useState(false);

  const role = profile?.role || 'user';

  const menuItems = [
    { id: 'dashboard', label: '面板概览', icon: <LayoutDashboard size={20} />, roles: ['admin', 'handler', 'user'] },
    { id: 'resources', label: '资源库', icon: <FileText size={20} />, hasSubmenu: true, roles: ['admin', 'handler', 'user'] },
    { id: 'utilization', label: '资源利用', icon: <BarChart3 size={20} />, roles: ['admin'] },
    { id: 'archives', label: '档案管理', icon: <Archive size={20} />, roles: ['admin', 'handler'] },
    { id: 'projects', label: '项目资料', icon: <FolderOpen size={20} />, roles: ['admin', 'handler'] },
    { id: 'approvals', label: '审批引擎', icon: <ClipboardCheck size={20} />, roles: ['admin'] },
    { id: 'system', label: '系统管理', icon: <Settings size={20} />, hasSubmenu: true, roles: ['admin'] },
  ].filter(item => item.roles.includes(role));

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar - Desktop */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 256 }}
        className="hidden md:flex flex-col bg-slate-900 text-white z-30"
      >
        <div className="p-6 border-b border-slate-800 cursor-pointer" onClick={() => setCollapsed(!collapsed)}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-lg italic shrink-0">
              XL
            </div>
            {!collapsed && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-semibold tracking-tight text-lg"
              >
                XiaoLu Engine
              </motion.div>
            )}
          </div>
          {!collapsed && (
            <div className="mt-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold">Metadata-Driven v2.0</div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1 mt-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <div key={item.id} className="space-y-1">
              <SidebarItem
                icon={item.icon}
                label={item.label}
                active={activeTab === item.id}
                onClick={() => {
                  if (item.id === 'resources') {
                    setIsResourcesOpen(!isResourcesOpen);
                  }
                  if (item.id === 'system') {
                    setIsSystemOpen(!isSystemOpen);
                  }
                  onTabChange(item.id);
                }}
                collapsed={collapsed}
                hasSubmenu={item.hasSubmenu}
                isSubmenuOpen={item.id === 'resources' ? isResourcesOpen : (item.id === 'system' ? isSystemOpen : false)}
              />
              
              {item.id === 'resources' && isResourcesOpen && !collapsed && (
                <div className="ml-6 space-y-1 mt-1 border-l border-slate-800">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        onTabChange('resources');
                        onCategorySelect?.(cat.id);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-1.5 rounded-r-lg transition-all duration-200 text-xs font-bold uppercase tracking-wider ${
                        activeTab === 'resources' && selectedCategoryId === cat.id
                          ? 'text-blue-500 bg-blue-500/10 border-l-2 border-blue-500'
                          : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <Layers size={14} className="shrink-0" />
                      <span className="truncate">{cat.name}</span>
                    </button>
                  ))}
                  {categories.length === 0 && (
                    <p className="px-4 py-2 text-[10px] text-slate-600 italic">尚未配置分类</p>
                  )}
                </div>
              )}

              {item.id === 'system' && isSystemOpen && !collapsed && (
                <div className="ml-6 space-y-1 mt-1 border-l border-slate-800">
                  <button
                    onClick={() => onTabChange('designer')}
                    className={`w-full flex items-center gap-3 px-4 py-1.5 rounded-r-lg transition-all duration-200 text-xs font-bold uppercase tracking-wider ${
                      activeTab === 'designer'
                        ? 'text-blue-500 bg-blue-500/10 border-l-2 border-blue-500'
                        : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Settings size={14} className="shrink-0" />
                    <span className="truncate">模型设计</span>
                  </button>
                  <button
                    onClick={() => onTabChange('rbac')}
                    className={`w-full flex items-center gap-3 px-4 py-1.5 rounded-r-lg transition-all duration-200 text-xs font-bold uppercase tracking-wider ${
                      activeTab === 'rbac'
                        ? 'text-blue-500 bg-blue-500/10 border-l-2 border-blue-500'
                        : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Shield size={14} className="shrink-0" />
                    <span className="truncate">权限引擎</span>
                  </button>
                  <button
                    onClick={() => onTabChange('org')}
                    className={`w-full flex items-center gap-3 px-4 py-1.5 rounded-r-lg transition-all duration-200 text-xs font-bold uppercase tracking-wider ${
                      activeTab === 'org'
                        ? 'text-blue-500 bg-blue-500/10 border-l-2 border-blue-500'
                        : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Network size={14} className="shrink-0" />
                    <span className="truncate">组织架构</span>
                  </button>
                  <button
                    onClick={() => onTabChange('staff')}
                    className={`w-full flex items-center gap-3 px-4 py-1.5 rounded-r-lg transition-all duration-200 text-xs font-bold uppercase tracking-wider ${
                      activeTab === 'staff'
                        ? 'text-blue-500 bg-blue-500/10 border-l-2 border-blue-500'
                        : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Users size={14} className="shrink-0" />
                    <span className="truncate">人员管理</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="p-4 bg-slate-800/30 border-t border-slate-800">
          <div className={`flex items-center justify-between mb-2 ${collapsed ? 'hidden' : 'flex'}`}>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Cloud Engine Status</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs ring-2 ring-blue-500/20">
              {profile?.name?.substring(0, 2).toUpperCase() || 'XL'}
            </div>
            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold truncate">{profile?.name || '用户'}</p>
                <p className="text-[9px] text-slate-500 font-mono uppercase">
                  {role === 'admin' ? '系统管理员' : role === 'handler' ? '事业部经办人' : '普通用户'}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 min-h-screen relative overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-600"
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
              <span className="text-slate-400">XiaoLu System</span>
              <ChevronRight size={12} className="text-slate-300" />
              <span className="text-slate-900">{activeTab}</span>
              {activeTab === 'resources' && selectedCategoryId && (
                <>
                  <ChevronRight size={12} className="text-slate-300" />
                  <span className="text-blue-600">{categories.find(c => c.id === selectedCategoryId)?.name}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex gap-4 items-center">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            </button>
            <div className="h-4 w-[1px] bg-slate-200"></div>
            <div className="flex gap-3">
              <button 
                onClick={() => onTabChange('resources')}
                className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest border border-slate-200 rounded-md hover:bg-slate-50 text-slate-600 transition-colors"
              >
                文档全集
              </button>
              <button 
                onClick={() => onApplyChanges?.()}
                className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-blue-600 text-white rounded-md shadow-sm shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
              >
                模型发布
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8 custom-scrollbar bg-slate-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>

        {/* Footer */}
        <footer className="h-10 bg-white border-t border-slate-200 flex items-center justify-between px-8 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
          <div className="flex gap-6 uppercase tracking-widest">
            <span>Server: <span className="text-emerald-600">Stable</span></span>
            <span>Region: <span className="text-blue-600">North Asia-1</span></span>
          </div>
          <div>Distributed Registry v3.4.0</div>
        </footer>
      </main>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              onClick={(e) => e.stopPropagation()}
              className="w-4/5 h-full bg-slate-900 p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                <div className="font-bold text-xl text-blue-500 italic tracking-tighter">XL CORE</div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400">
                  <X size={24} />
                </button>
              </div>
              <nav className="flex-1 space-y-1 overflow-y-auto">
                {menuItems.map((item) => (
                  <div key={item.id} className="space-y-1">
                    <SidebarItem
                      icon={item.icon}
                      label={item.label}
                      active={activeTab === item.id}
                      onClick={() => {
                        if (item.id === 'resources') {
                          setIsResourcesOpen(!isResourcesOpen);
                        } else if (item.id === 'system') {
                          setIsSystemOpen(!isSystemOpen);
                        } else {
                          onTabChange(item.id);
                          setIsMobileMenuOpen(false);
                        }
                      }}
                      hasSubmenu={item.hasSubmenu}
                      isSubmenuOpen={item.id === 'resources' ? isResourcesOpen : (item.id === 'system' ? isSystemOpen : false)}
                    />
                    {item.id === 'resources' && isResourcesOpen && (
                      <div className="ml-6 space-y-1 mt-1 border-l border-slate-800">
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => {
                              onTabChange('resources');
                              onCategorySelect?.(cat.id);
                              setIsMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2 rounded-r-lg transition-all duration-200 text-xs font-bold uppercase tracking-wider ${
                              activeTab === 'resources' && selectedCategoryId === cat.id
                                ? 'text-blue-500 bg-blue-500/10'
                                : 'text-slate-500'
                            }`}
                          >
                            <Layers size={14} className="shrink-0" />
                            <span className="truncate">{cat.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {item.id === 'system' && isSystemOpen && (
                      <div className="ml-6 space-y-1 mt-1 border-l border-slate-800">
                        <button
                          onClick={() => {
                            onTabChange('designer');
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2 rounded-r-lg transition-all duration-200 text-xs font-bold uppercase tracking-wider ${
                            activeTab === 'designer' ? 'text-blue-500 bg-blue-500/10' : 'text-slate-500'
                          }`}
                        >
                          <Settings size={14} className="shrink-0" />
                          <span className="truncate">模型设计</span>
                        </button>
                        <button
                          onClick={() => {
                            onTabChange('rbac');
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2 rounded-r-lg transition-all duration-200 text-xs font-bold uppercase tracking-wider ${
                            activeTab === 'rbac' ? 'text-blue-500 bg-blue-500/10' : 'text-slate-500'
                          }`}
                        >
                          <Shield size={14} className="shrink-0" />
                          <span className="truncate">权限引擎</span>
                        </button>
                        <button
                          onClick={() => {
                            onTabChange('org');
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2 rounded-r-lg transition-all duration-200 text-xs font-bold uppercase tracking-wider ${
                            activeTab === 'org' ? 'text-blue-500 bg-blue-500/10' : 'text-slate-500'
                          }`}
                        >
                          <Network size={14} className="shrink-0" />
                          <span className="truncate">组织架构</span>
                        </button>
                        <button
                          onClick={() => {
                            onTabChange('staff');
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2 rounded-r-lg transition-all duration-200 text-xs font-bold uppercase tracking-wider ${
                            activeTab === 'staff' ? 'text-blue-500 bg-blue-500/10' : 'text-slate-500'
                          }`}
                        >
                          <Users size={14} className="shrink-0" />
                          <span className="truncate">人员管理</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
