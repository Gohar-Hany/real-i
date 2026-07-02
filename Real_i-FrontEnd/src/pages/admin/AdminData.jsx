import { useState, useEffect } from 'react';
import DataTable from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { useToast } from '@/components/common/Toast';
import { getProjects, getAssets, getGuidelines, saveGuideline, deleteGuideline, deleteProject, deleteAsset } from '@/services/api';
import { Loader2 } from 'lucide-react';

const TABS = [
  { key: 'guidelines', label: 'Guidelines' },
  { key: 'projects', label: 'Projects' },
  { key: 'assets', label: 'Assets' },
];

const COLUMN_DEFS = {
  guidelines: [
    { key: 'task_id', label: 'Task ID', editable: false },
    { key: 'task_type', label: 'Type', render: (v) => (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">{v}</span>
    )},
    { key: 'description', label: 'Description' },
    { key: 'course', label: 'Course', render: (v, row) => row.project_id || v || 'General' },
    { key: 'priority', label: 'Priority', render: (v) => {
      const colors = { High: 'bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400', Medium: 'bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400', Low: 'bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400' };
      return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[v] || ''}`}>{v}</span>;
    }},
    { key: 'status', label: 'Status', render: (v) => {
      const colors = { Pending: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', Completed: 'bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400', 'In Progress': 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' };
      return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[v] || ''}`}>{v}</span>;
    }},
    { key: 'is_active', label: 'Active', render: (v) => (
      <span className={`w-2.5 h-2.5 rounded-full inline-block ${v ? 'bg-accent-500' : 'bg-surface-300'}`} />
    )},
  ],
  projects: [
    { key: 'project_id', label: 'Project ID' },
  ],
  assets: [
    { key: 'asset_name', label: 'File Name', editable: false },
    { key: 'asset_type', label: 'Type' },
    { key: 'asset_size', label: 'Size', render: (v) => {
      const kb = v / 1024;
      return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;
    }},
    { key: 'project', label: 'Project' },
  ],
};

export default function AdminData() {
  const [activeTab, setActiveTab] = useState('guidelines');
  const [data, setData] = useState({ guidelines: [], projects: [], assets: [] });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRow, setNewRow] = useState({});
  const toast = useToast();

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [guidelinesList, projectsList, assetsList] = await Promise.all([
        getGuidelines(),
        getProjects(),
        getAssets(),
      ]);
      setData({
        guidelines: guidelinesList,
        projects: projectsList,
        assets: assetsList,
      });
    } catch (err) {
      toast.error(`Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleEdit = async (row, colKey, newValue) => {
    if (activeTab !== 'guidelines') {
      toast.error('Only guidelines are editable in this screen.');
      return;
    }
    try {
      const payload = { ...row, [colKey]: newValue };
      await saveGuideline(payload);
      setData(prev => ({
        ...prev,
        guidelines: prev.guidelines.map(r => r.task_id === row.task_id ? payload : r)
      }));
      toast.success('Record updated');
    } catch (err) {
      toast.error(`Edit failed: ${err.message}`);
    }
  };

  const handleDelete = async (row) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      if (activeTab === 'guidelines') {
        await deleteGuideline(row.task_id);
        setData(prev => ({
          ...prev,
          guidelines: prev.guidelines.filter(r => r.task_id !== row.task_id)
        }));
      } else if (activeTab === 'projects') {
        await deleteProject(row.project_id);
        setData(prev => ({
          ...prev,
          projects: prev.projects.filter(r => r.project_id !== row.project_id)
        }));
      } else if (activeTab === 'assets') {
        await deleteAsset(row._id);
        setData(prev => ({
          ...prev,
          assets: prev.assets.filter(r => r._id !== row._id)
        }));
      }
      toast.success('Record deleted');
    } catch (err) {
      toast.error(`Delete failed: ${err.message}`);
    }
  };

  const handleAdd = () => {
    if (activeTab !== 'guidelines') {
      toast.error('Only guidelines can be created directly.');
      return;
    }
    setNewRow({ task_type: 'Quiz', description: '', course: '', priority: 'Medium', notes: '' });
    setShowAddModal(true);
  };

  const saveNewRow = async () => {
    try {
      await saveGuideline(newRow);
      toast.success('Guideline added');
      loadAllData();
      setShowAddModal(false);
    } catch (err) {
      toast.error(`Add failed: ${err.message}`);
    }
  };


  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-800/80 border border-surface-700 mb-4 backdrop-blur-md shadow-sm">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse-slow"></div>
            <span className="text-[11px] font-mono font-bold text-blue-400 uppercase tracking-widest">
              Data Core Access
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
            Data <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-primary-500">Manager</span>
          </h1>
          <p className="text-surface-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Direct access to the system's core databases. View, modify, and manage guidelines, projects, and assets.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-surface-900/60 border border-surface-700/50 p-2 rounded-2xl w-fit shadow-inner backdrop-blur-md">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === tab.key
                ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                : 'border border-transparent text-surface-400 hover:text-white hover:bg-surface-800/50'
            }`}
          >
            {tab.label}
            <span className={`px-2 py-0.5 rounded-md text-[10px] ${
              activeTab === tab.key ? 'bg-blue-500/20 text-blue-300' : 'bg-surface-800 text-surface-500'
            }`}>
              {data[tab.key]?.length || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Data Table Area */}
      <div className="glass-card rounded-3xl border border-surface-700/50 shadow-2xl overflow-hidden bg-surface-900/60 relative min-h-[400px]">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[400px] relative z-10">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
            <p className="text-sm font-bold text-surface-400 uppercase tracking-widest">Querying Database...</p>
          </div>
        ) : (
          <div className="relative z-10 p-2">
            <DataTable
              title={TABS.find(t => t.key === activeTab)?.label || ''}
              data={data[activeTab] || []}
              columns={COLUMN_DEFS[activeTab] || []}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAdd={handleAdd}
            />
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <span className="text-blue-400 font-bold">+</span>
            </div>
            <span>New {TABS.find(t => t.key === activeTab)?.label?.replace(/s$/, '') || 'Record'}</span>
          </div>
        }
        footer={
          <div className="flex gap-3 justify-end w-full">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-surface-400 bg-surface-800/50 border border-surface-700 hover:bg-surface-700 hover:text-white transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={saveNewRow}
              className="px-5 py-2.5 rounded-xl text-sm font-bold gradient-primary text-surface-950 transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-95"
            >
              Inject Record
            </button>
          </div>
        }
      >
        <div className="space-y-5 p-2">
          {(COLUMN_DEFS[activeTab] || []).filter(c => c.editable !== false).map(col => (
            <div key={col.key}>
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">
                {col.label}
              </label>
              <input
                type="text"
                value={newRow[col.key] || ''}
                onChange={(e) => setNewRow(prev => ({ ...prev, [col.key]: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-surface-950/80 border border-surface-800 text-sm text-white outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-inner placeholder-surface-600"
                placeholder={`Enter ${col.label.toLowerCase()}...`}
              />
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
