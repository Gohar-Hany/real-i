import { useState, useEffect } from 'react';
import { Plus, Power, PowerOff, Edit3, Trash2, AlertCircle, Loader2, BookOpen } from 'lucide-react';
import Modal from '@/components/common/Modal';
import { useToast } from '@/components/common/Toast';
import { getGuidelines, saveGuideline, toggleGuideline, deleteGuideline } from '@/services/api';

const PRIORITY_COLORS = {
  High: 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400 border-danger-200 dark:border-danger-800',
  Medium: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400 border-warning-200 dark:border-warning-800',
  Low: 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400 border-accent-200 dark:border-accent-800',
};

const TASK_TYPES = ['Quiz', 'Assignment', 'Study Guide', 'Summary', 'Exam', 'Flashcards'];
const PRIORITIES = ['High', 'Medium', 'Low'];

export default function AdminGuidelines() {
  const [guidelines, setGuidelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGuideline, setEditingGuideline] = useState(null);
  const [form, setForm] = useState({
    task_type: 'Quiz', description: '', course: '', priority: 'Medium', notes: '',
  });
  const toast = useToast();

  const fetchGuidelines = async () => {
    setLoading(true);
    try {
      const data = await getGuidelines();
      setGuidelines(data);
    } catch (err) {
      toast.error(`Failed to load guidelines: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuidelines();
  }, []);

  const toggleActive = async (taskId) => {
    try {
      await toggleGuideline(taskId);
      setGuidelines(prev => prev.map(g =>
        g.task_id === taskId ? { ...g, is_active: !g.is_active } : g
      ));
      toast.success('Guideline status updated');
    } catch (err) {
      toast.error(`Failed to toggle guideline: ${err.message}`);
    }
  };

  const openAddModal = () => {
    setEditingGuideline(null);
    setForm({ task_type: 'Quiz', description: '', course: '', priority: 'Medium', notes: '' });
    setShowModal(true);
  };

  const openEditModal = (g) => {
    setEditingGuideline(g);
    setForm({ task_type: g.task_type, description: g.description, course: g.project_id || g.course || '', priority: g.priority, notes: g.notes || '' });
    setShowModal(true);
  };

  const saveGuidelineData = async () => {
    if (!form.description.trim()) {
      toast.error('Description is required');
      return;
    }
    try {
      const payload = {
        ...form,
        task_id: editingGuideline ? editingGuideline.task_id : undefined,
        is_active: editingGuideline ? editingGuideline.is_active : true
      };
      await saveGuideline(payload);
      toast.success(editingGuideline ? 'Guideline updated' : 'Guideline created');
      fetchGuidelines();
      setShowModal(false);
    } catch (err) {
      toast.error(`Failed to save guideline: ${err.message}`);
    }
  };

  const handleDelete = async (taskId) => {
    if (!confirm('Delete this guideline?')) return;
    try {
      await deleteGuideline(taskId);
      setGuidelines(prev => prev.filter(g => g.task_id !== taskId));
      toast.success('Guideline deleted');
    } catch (err) {
      toast.error(`Failed to delete guideline: ${err.message}`);
    }
  };

  const activeCount = guidelines.filter(g => g.is_active).length;


  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-800/80 border border-surface-700 mb-4 backdrop-blur-md shadow-sm">
            <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse-slow"></div>
            <span className="text-[11px] font-mono font-bold text-primary-400 uppercase tracking-widest">
              Agent Directives
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
            System <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-amber-200">Guidelines</span>
          </h1>
          <p className="text-surface-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Configure core behavioral directives. These instructions are injected into the agent's context to steer interactions and maintain instructional objectives.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-surface-950 text-sm font-black transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-95 shrink-0"
        >
          <Plus size={18} />
          Deploy New Directive
        </button>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-4 p-5 rounded-2xl glass-card bg-primary-500/5 border border-primary-500/20 shadow-inner relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-[40px] pointer-events-none"></div>
        <AlertCircle size={24} className="text-primary-400 mt-0.5 shrink-0 relative z-10" />
        <div className="relative z-10">
          <p className="text-sm font-black text-white uppercase tracking-wider mb-1">
            Operational Protocol
          </p>
          <p className="text-xs text-surface-400 leading-relaxed max-w-4xl font-medium">
            Currently running <span className="text-primary-400 font-bold">{activeCount} active directive{activeCount !== 1 ? 's' : ''}</span>. Active guidelines are automatically compiled and injected into the AI assistant's memory buffer during student interactions. Ensure guidelines do not conflict with each other to maintain optimal agent stability.
          </p>
        </div>
      </div>

      {/* Guidelines Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mb-4" />
          <p className="text-sm font-bold text-surface-400 uppercase tracking-widest">Scanning Directives...</p>
        </div>
      ) : guidelines.length === 0 ? (
        <div className="text-center py-20 glass-card bg-surface-900/60 rounded-3xl border border-surface-700/50 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <BookOpen size={120} />
          </div>
          <p className="text-surface-400 text-sm font-bold relative z-10 uppercase tracking-widest">No active directives found.</p>
          <p className="text-surface-500 text-xs relative z-10 mt-2">Deploy a new directive to configure agent behavior.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {guidelines.map((g) => (
            <div
              key={g._id || g.task_id}
              className={`relative p-6 rounded-3xl border transition-all duration-500 overflow-hidden group ${
                g.is_active
                  ? 'border-primary-500/30 bg-surface-900/80 shadow-[0_0_20px_rgba(212,175,55,0.05)] hover:shadow-[0_0_30px_rgba(212,175,55,0.1)] hover:border-primary-500/50'
                  : 'border-surface-700/50 bg-surface-950/60 opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all'
              }`}
            >
              {g.is_active && (
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-primary-500/10 transition-colors"></div>
              )}
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${g.is_active ? 'bg-primary-400 animate-pulse' : 'bg-surface-600'}`}></span>
                    <span className="text-xs font-black font-mono text-white tracking-widest uppercase">
                      {g.task_id}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ml-2 ${
                      g.priority === 'High' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                      g.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                      'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    }`}>
                      {g.priority}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-surface-800 text-surface-400 border border-surface-700">
                      {g.task_type}
                    </span>
                  </div>
                  
                  {/* Action Controls */}
                  <div className="flex items-center gap-1.5 bg-surface-950 p-1 rounded-xl border border-surface-800">
                    <button
                      onClick={() => toggleActive(g.task_id)}
                      className={`p-1.5 rounded-lg transition-all flex items-center justify-center w-8 h-8 ${
                        g.is_active
                          ? 'text-primary-400 hover:bg-primary-500/20 hover:text-primary-300'
                          : 'text-surface-500 hover:bg-surface-800 hover:text-white'
                      }`}
                      title={g.is_active ? 'Deactivate Directive' : 'Activate Directive'}
                    >
                      {g.is_active ? <Power size={14} /> : <PowerOff size={14} />}
                    </button>
                    <div className="w-px h-4 bg-surface-800"></div>
                    <button onClick={() => openEditModal(g)} className="p-1.5 rounded-lg text-surface-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all flex items-center justify-center w-8 h-8">
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => handleDelete(g.task_id)} className="p-1.5 rounded-lg text-surface-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all flex items-center justify-center w-8 h-8">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
  
                <p className={`text-sm font-medium leading-relaxed mb-3 ${g.is_active ? 'text-surface-200' : 'text-surface-400'}`}>
                  {g.description}
                </p>
                {g.notes && (
                  <p className="text-[11px] text-surface-500 mb-4 bg-surface-950/50 p-2 rounded-lg border border-surface-800/50 font-mono">
                    {'>'} {g.notes}
                  </p>
                )}
                
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-surface-800">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-surface-500 flex items-center gap-1.5 bg-surface-950 px-2 py-1 rounded-md border border-surface-800">
                    <BookOpen size={12} className={g.is_active ? 'text-primary-500' : 'text-surface-600'} />
                    {g.project_id || g.course || 'Global Scope'}
                  </span>
                  <span className="text-[10px] font-mono text-surface-500">
                    Deployed: {g.created_at ? new Date(g.created_at.includes(' ') ? g.created_at.replace(' ', 'T') : g.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${editingGuideline ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-primary-500/10 border-primary-500/20 text-primary-400'}`}>
              {editingGuideline ? <Edit3 size={16} /> : <Plus size={16} />}
            </div>
            <span>{editingGuideline ? 'Modify Directive' : 'Deploy New Directive'}</span>
          </div>
        }
        footer={
          <div className="flex gap-3 justify-end w-full">
            <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-surface-400 bg-surface-800/50 border border-surface-700 hover:bg-surface-700 hover:text-white transition-all active:scale-95">
              Abort
            </button>
            <button onClick={saveGuidelineData} className="px-5 py-2.5 rounded-xl text-sm font-bold gradient-primary text-surface-950 transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-95">
              {editingGuideline ? 'Execute Modification' : 'Initialize Directive'}
            </button>
          </div>
        }
      >
        <div className="space-y-5 p-2">
          <div>
            <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-2">Directive Type</label>
            <select
              value={form.task_type}
              onChange={(e) => setForm(f => ({ ...f, task_type: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-surface-950/80 border border-surface-800 text-sm font-medium text-white outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all shadow-inner"
            >
              {TASK_TYPES.map(t => <option key={t} value={t} className="bg-surface-900">{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-2">Protocol Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-surface-950/80 border border-surface-800 text-sm font-medium text-white outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all shadow-inner resize-none placeholder-surface-600"
              placeholder="Define the behavioral parameters for the AI agent..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-2">Target Course Scope</label>
              <input
                type="text"
                value={form.course}
                onChange={(e) => setForm(f => ({ ...f, course: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-surface-950/80 border border-surface-800 text-sm font-medium text-white outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all shadow-inner placeholder-surface-600"
                placeholder="e.g., Machine Learning (Leave blank for Global)"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-2">Execution Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm(f => ({ ...f, priority: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-surface-950/80 border border-surface-800 text-sm font-medium text-white outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all shadow-inner"
              >
                {PRIORITIES.map(p => <option key={p} value={p} className="bg-surface-900">{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-2">System Notes (Optional)</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-surface-950/80 border border-surface-800 text-sm font-mono text-white outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all shadow-inner placeholder-surface-600"
              placeholder="> additional parameters..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
