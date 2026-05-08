import React, { useState } from 'react';
import { FieldSchema, FieldType } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Calendar, ChevronDown, Check, FileUp, FileText, History } from 'lucide-react';

interface DynamicFormProps {
  fields: FieldSchema[];
  onSubmit: (data: Record<string, any>, file: File | null, versionComment?: string) => void;
  initialData?: Record<string, any>;
  existingFileUrl?: string;
  title?: string;
  submitLabel?: string;
}

export default function DynamicForm({ fields, onSubmit, initialData = {}, existingFileUrl, title, submitLabel = '提交' }: DynamicFormProps) {
  const [formData, setFormData] = React.useState<Record<string, any>>(initialData);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [versionComment, setVersionComment] = useState('');

  // Reset form when initialData or fields change
  React.useEffect(() => {
    setFormData(initialData);
    setErrors({});
    setSelectedFile(null);
    setVersionComment('');
  }, [initialData, fields]);

  const validateField = (field: FieldSchema, value: any) => {
    if (field.validation?.required && (!value || value === '')) {
      return field.validation.message || `${field.name}是必填项`;
    }
    if (field.validation?.pattern && value) {
      const regex = new RegExp(field.validation.pattern);
      if (!regex.test(value)) {
        return field.validation.message || `${field.name}格式不正确`;
      }
    }
    return '';
  };

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear error when typing
    if (errors[key]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    fields.forEach(field => {
      const error = validateField(field, formData[field.key]);
      if (error) newErrors[field.key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData, selectedFile, versionComment);
  };

  const isEditing = !!initialData && Object.keys(initialData).length > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
      {title && (
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">{title}</h2>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold uppercase tracking-tighter">MetaData Entry</span>
            {isEditing && (
              <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded font-bold uppercase tracking-tighter">Edition Mode</span>
            )}
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {fields.map((field) => (
            <motion.div 
              key={field.key} 
              layout
              className={`flex flex-col gap-2 ${field.type === FieldType.TEXTAREA ? 'md:col-span-2' : ''}`}
            >
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                {field.name}
                {field.validation?.required && <span className="text-red-500">*</span>}
              </label>
              
              <div className="relative group">
                {renderInput(field, formData[field.key], (val) => handleChange(field.key, val), !!errors[field.key])}
                
                <AnimatePresence>
                  {errors[field.key] && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute right-3 top-3 text-red-500 pointer-events-none"
                    >
                      <AlertCircle size={18} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {errors[field.key] && (
                <p className="text-[10px] font-bold text-red-500 mt-1 uppercase italic">{errors[field.key]}</p>
              )}
              
              {field.description && !errors[field.key] && (
                <p className="text-[10px] text-slate-400 font-medium mt-1">{field.description}</p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Scanner/File Upload Section */}
        <div className="pt-8 border-t border-slate-100">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-4">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <FileUp size={14} /> 扫描件 / 原始凭证上传
              </label>
              <div 
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-4 transition-all group cursor-pointer ${selectedFile ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${selectedFile ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 group-hover:text-blue-600 shadow-sm'}`}>
                  {selectedFile ? <FileText size={24} /> : <FileUp size={24} />}
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-900 mb-1">{selectedFile ? selectedFile.name : '点击或拖拽文件至此'}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">支持 PDF, JPG, PNG | Max 20MB</p>
                </div>
                <input 
                  type="file" 
                  id="file-upload" 
                  className="hidden" 
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </div>
              {existingFileUrl && !selectedFile && (
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <Check size={14} className="text-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">已有原始文件存档</span>
                  <a href={existingFileUrl} target="_blank" rel="noreferrer" className="ml-auto text-[10px] text-blue-600 font-bold hover:underline">点击查阅</a>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="flex-1 space-y-4">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <History size={14} /> 版本变更说明
                </label>
                <textarea
                  value={versionComment}
                  onChange={(e) => setVersionComment(e.target.value)}
                  placeholder="请描述本次信息的变更原因或更新内容..."
                  className="w-full h-32 bg-white border border-slate-200 rounded-xl p-4 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                />
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-3">
                  <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-amber-700 font-medium leading-relaxed uppercase">上传新文件或修改核心著录项将自动触发“版本演进”逻辑，原记录将保留在历史版本中。</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-8 mt-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setFormData(initialData);
              setSelectedFile(null);
              setVersionComment('');
            }}
            className="px-6 py-2 text-sm font-bold border border-slate-200 rounded-md hover:bg-slate-50 text-slate-600 transition-colors uppercase tracking-widest"
          >
            撤离
          </button>
          <button
            type="submit"
            className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md shadow-sm shadow-blue-500/20 transition-all text-sm active:scale-95 uppercase tracking-widest"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

function renderInput(field: FieldSchema, value: any, onChange: (val: any) => void, hasError: boolean) {
  const commonClasses = `w-full bg-slate-50 border ${hasError ? 'border-red-200' : 'border-slate-200 group-hover:border-slate-300 focus:border-blue-500'} rounded-md px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none focus:bg-white focus:ring-1 ${hasError ? 'focus:ring-red-500/20' : 'focus:ring-blue-500/20'}`;

  switch (field.type) {
    case FieldType.TEXT:
    case FieldType.NUMBER:
      return (
        <input
          type={field.type === FieldType.NUMBER ? 'number' : 'text'}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={commonClasses}
        />
      );
    case FieldType.TEXTAREA:
      return (
        <textarea
          rows={4}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={`${commonClasses} resize-none`}
        />
      );
    case FieldType.DATE:
      return (
        <div className="relative">
          <input
            type="date"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className={`${commonClasses} appearance-none pr-10`}
          />
          <Calendar size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
        </div>
      );
    case FieldType.SELECT:
      return (
        <div className="relative">
          <select
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className={`${commonClasses} appearance-none pr-10`}
          >
            <option value="" disabled>{field.placeholder || '-- 请选择 --'}</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
        </div>
      );
    case FieldType.BOOLEAN:
      return (
        <div 
          onClick={() => onChange(!value)}
          className={`flex items-center gap-3 cursor-pointer p-1 rounded-md transition-colors ${value ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <div className={`w-10 h-5 rounded-full relative transition-colors ${value ? 'bg-blue-600' : 'bg-slate-200'}`}>
            <motion.div 
              animate={{ x: value ? 20 : 2 }}
              className="absolute top-1 left-0 w-3 h-3 bg-white rounded-full shadow-sm"
            />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider">{value ? 'ENABLED' : 'DISABLED'}</span>
        </div>
      );
    default:
      return <div className="text-xs text-red-500">不支持的字段类型: {field.type}</div>;
  }
}
