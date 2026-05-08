import { ResourceCategory, FieldType } from './types';

export const MOCK_CATEGORIES: ResourceCategory[] = [
  {
    id: 'bid-doc',
    name: '投标资料',
    icon: 'FileText',
    description: '用于管理所有投标过程中的核心著录项与电子文档',
    fields: [
      {
        id: 'f1',
        name: '项目名称',
        key: 'projectName',
        type: FieldType.TEXT,
        validation: { required: true, message: '必须输入项目名称' },
        placeholder: '请输入正式项目全称'
      },
      {
        id: 'f2',
        name: '所属部门',
        key: 'department',
        type: FieldType.SELECT,
        options: [
          { label: '集成事业部', value: 'integration' },
          { label: '软件事业部', value: 'software' },
          { label: '小鹿云', value: 'cloud' }
        ],
        validation: { required: true }
      },
      {
        id: 'f3',
        name: '投标日期',
        key: 'bidDate',
        type: FieldType.DATE,
        validation: { required: true }
      },
      {
        id: 'f4',
        name: '预算金额',
        key: 'budget',
        type: FieldType.NUMBER,
        placeholder: '单位：万元'
      },
      {
        id: 'f5',
        name: '技术要求摘要',
        key: 'techSummary',
        type: FieldType.TEXTAREA
      }
    ],
    workflow: {
      enabled: true,
      steps: [
        { id: 'draft', name: '草稿', role: 'staff', allowEditFields: ['*'] },
        { id: 'manager-verify', name: '部门经理审核', role: 'manager', allowEditFields: [] },
        { id: 'bid-center', name: '招投标中心备案', role: 'admin', allowEditFields: [] }
      ]
    },
    watermarkConfig: {
      enabled: true,
      textTemplate: 'XIAOLU INTERNAL - ${projectName}'
    }
  },
  {
    id: 'cert',
    name: '资质证书',
    icon: 'Award',
    description: '公司各项业务资质、行业证书及到期预警管理',
    fields: [
      {
        id: 'c1',
        name: '证书名称',
        key: 'certName',
        type: FieldType.TEXT,
        validation: { required: true }
      },
      {
        id: 'c2',
        name: '到期日期',
        key: 'expiryDate',
        type: FieldType.DATE,
        validation: { required: true }
      },
      {
        id: 'c3',
        name: '发证机构',
        key: 'issuer',
        type: FieldType.TEXT
      }
    ]
  },
  {
    id: 'proj-report',
    name: '项目报备',
    icon: 'ClipboardCheck',
    description: '项目售前备案及商机管理',
    fields: [
      {
        id: 'r1',
        name: '客户名称',
        key: 'clientName',
        type: FieldType.TEXT,
        validation: { required: true }
      }
    ]
  },
  {
    id: 'proj-sub',
    parentId: 'proj-report',
    name: '售前方案',
    icon: 'FileText',
    description: '子分类：具体的售前技术方案文档情况',
    fields: [
      { id: 's1', name: '方案版本', key: 'version', type: FieldType.TEXT }
    ]
  }
];

export const MOCK_RESOURCES = [
  {
    id: 'r-001',
    categoryId: 'bid-doc',
    data: {
      projectName: '国家政务云平台二期建设项目',
      department: 'cloud',
      bidDate: '2026-06-15',
      budget: 4500,
      techSummary: '核心需求包括：高可用架构支持、多活机房部署及数据安全合规性要求。'
    },
    status: 'pending',
    createdBy: '张三',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 3600000
  },
  {
    id: 'r-002',
    categoryId: 'bid-doc',
    data: {
      projectName: '数字化生产管理平台软件开发',
      department: 'software',
      bidDate: '2026-05-20',
      budget: 850
    },
    status: 'approved',
    createdBy: '李四',
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000
  },
  {
    id: 'r-003',
    categoryId: 'cert',
    data: {
      certName: '三级等保认证证书',
      expiryDate: '2024-01-01',
      issuer: '公安部信息安全等级保护评估中心'
    },
    status: 'approved',
    createdBy: '王五',
    createdAt: Date.now() - 86400000 * 500,
    updatedAt: Date.now() - 86400000 * 400
  }
];
