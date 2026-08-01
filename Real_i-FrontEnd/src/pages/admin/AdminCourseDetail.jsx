import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Users, ArrowLeft, Edit3, Save, X, Plus, Trash2, Eye, EyeOff, Layout, List, Video, Clock } from 'lucide-react';
import { getCourse, updateCourse, adminEnrollStudent, adminUnenrollStudent, getUsers } from '@/services/api';
import { useToast } from '@/components/common/Toast';

export default function AdminCourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [course, setCourse] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('overview'); // overview, curriculum, students
  
  // Editing State
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState(null);

  // Enroll Modal State
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [courseData, usersData] = await Promise.all([
        getCourse(id).catch(() => null),
        getUsers().catch(() => [])
      ]);
      
      if (!courseData) {
        toast.error('Course not found');
        navigate('/admin/courses');
        return;
      }
      
      setCourse(courseData);
      setEditForm({
        ...courseData,
        tags: courseData.tags?.join(', ') || '',
        modules: courseData.modules || []
      });
      setAllUsers(usersData);
    } catch (err) {
      toast.error('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourse = async () => {
    setIsSaving(true);
    try {
      const payload = {
        ...editForm,
        tags: editForm.tags.split(',').map(t => t.trim()).filter(Boolean)
      };
      const updated = await updateCourse(id, payload);
      setCourse(updated);
      setEditForm({
        ...updated,
        tags: updated.tags?.join(', ') || '',
        modules: updated.modules || []
      });
      toast.success('Course updated successfully');
    } catch (err) {
      toast.error('Failed to update course');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Curriculum Builder Functions ──
  const addModule = () => {
    setEditForm(prev => ({
      ...prev,
      modules: [...prev.modules, {
        id: `mod_${Date.now()}`,
        title: 'New Module',
        lessons: []
      }]
    }));
  };

  const updateModule = (index, field, value) => {
    const newModules = [...editForm.modules];
    newModules[index][field] = value;
    setEditForm(prev => ({ ...prev, modules: newModules }));
  };

  const deleteModule = (index) => {
    if (!window.confirm('Delete this module and all its lessons?')) return;
    const newModules = editForm.modules.filter((_, i) => i !== index);
    setEditForm(prev => ({ ...prev, modules: newModules }));
  };

  const addLesson = (moduleIndex) => {
    const newModules = [...editForm.modules];
    newModules[moduleIndex].lessons.push({
      id: `les_${Date.now()}`,
      title: 'New Lesson',
      type: 'video',
      duration: '10m',
      is_preview: false
    });
    setEditForm(prev => ({ ...prev, modules: newModules }));
  };

  const updateLesson = (mIdx, lIdx, field, value) => {
    const newModules = [...editForm.modules];
    newModules[mIdx].lessons[lIdx][field] = value;
    setEditForm(prev => ({ ...prev, modules: newModules }));
  };

  const deleteLesson = (mIdx, lIdx) => {
    const newModules = [...editForm.modules];
    newModules[mIdx].lessons = newModules[mIdx].lessons.filter((_, i) => i !== lIdx);
    setEditForm(prev => ({ ...prev, modules: newModules }));
  };

  // ── Student Enrollment Functions ──
  const handleEnrollStudent = async () => {
    if (!selectedStudentId) return;
    try {
      await adminEnrollStudent(id, selectedStudentId);
      toast.success('Student enrolled successfully');
      setShowEnrollModal(false);
      setSelectedStudentId('');
      fetchData(); 
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to enroll student');
    }
  };

  const handleUnenrollStudent = async (studentId) => {
    if (!window.confirm('Remove this student from the course?')) return;
    try {
      await adminUnenrollStudent(id, studentId);
      toast.success('Student removed successfully');
      fetchData();
    } catch (err) {
      toast.error('Failed to remove student');
    }
  };

  if (loading || !course || !editForm) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  const enrolledStudents = allUsers.filter(u => course.enrolled_students?.includes(u.id));
  const availableStudents = allUsers.filter(u => u.role === 'student' && !course.enrolled_students?.includes(u.id));

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/courses')}
            className="w-10 h-10 shrink-0 rounded-xl bg-surface-800/50 flex items-center justify-center text-surface-400 hover:text-white hover:bg-surface-700 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">{course.title}</h1>
            <p className="text-surface-400 text-sm mt-1 flex items-center gap-2">
              <span className="font-mono bg-surface-800 px-2 py-0.5 rounded text-xs">ID: {course.project_id}</span>
              • {editForm.modules.reduce((a,m)=>a+(m.lessons?.length||0),0)} Lessons
            </p>
          </div>
        </div>
        <button 
          onClick={handleUpdateCourse} 
          disabled={isSaving}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl gradient-primary text-surface-950 font-bold hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-surface-950/30 border-t-surface-950 rounded-full animate-spin" />
          ) : (
            <><Save size={18} /> Save Changes</>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-700/50 pb-px overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-3 font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'border-primary-500 text-primary-400' : 'border-transparent text-surface-400 hover:text-surface-200'}`}
        >
          <Layout size={18} /> Overview
        </button>
        <button
          onClick={() => setActiveTab('curriculum')}
          className={`flex items-center gap-2 px-4 py-3 font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'curriculum' ? 'border-primary-500 text-primary-400' : 'border-transparent text-surface-400 hover:text-surface-200'}`}
        >
          <List size={18} /> Curriculum Builder
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-3 font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'students' ? 'border-primary-500 text-primary-400' : 'border-transparent text-surface-400 hover:text-surface-200'}`}
        >
          <Users size={18} /> Students ({enrolledStudents.length})
        </button>
      </div>

      {/* ── Tab: Overview ── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-3xl p-6 md:p-8 border border-surface-700/50 bg-surface-900/60">
              <h3 className="text-lg font-bold text-white mb-6">General Information</h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Course Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={e => setEditForm({...editForm, title: e.target.value})}
                    className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-2.5 text-white focus:border-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Subtitle</label>
                  <input
                    type="text"
                    value={editForm.subtitle || ''}
                    onChange={e => setEditForm({...editForm, subtitle: e.target.value})}
                    className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-2.5 text-white focus:border-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    value={editForm.description || ''}
                    onChange={e => setEditForm({...editForm, description: e.target.value})}
                    rows={5}
                    className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-2.5 text-white focus:border-primary-500 outline-none resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Instructor</label>
                    <input
                      type="text"
                      value={editForm.instructor || ''}
                      onChange={e => setEditForm({...editForm, instructor: e.target.value})}
                      className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-2.5 text-white focus:border-primary-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Tags (comma separated)</label>
                    <input
                      type="text"
                      value={editForm.tags}
                      onChange={e => setEditForm({...editForm, tags: e.target.value})}
                      placeholder="AI, Python, Data"
                      className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-2.5 text-white focus:border-primary-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 border border-surface-700/50 bg-surface-900/60">
              <h3 className="text-lg font-bold text-white mb-6">Settings</h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Category</label>
                  <input
                    type="text"
                    value={editForm.category || ''}
                    onChange={e => setEditForm({...editForm, category: e.target.value})}
                    className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-2.5 text-white focus:border-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Level</label>
                  <select
                    value={editForm.level || 'Beginner'}
                    onChange={e => setEditForm({...editForm, level: e.target.value})}
                    className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-2.5 text-white focus:border-primary-500 outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Total Hours</label>
                  <input
                    type="number"
                    value={editForm.total_hours || 0}
                    onChange={e => setEditForm({...editForm, total_hours: Number(e.target.value)})}
                    className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-2.5 text-white focus:border-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Thumbnail URL</label>
                  <input
                    type="text"
                    value={editForm.thumbnail || ''}
                    onChange={e => setEditForm({...editForm, thumbnail: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-2.5 text-white focus:border-primary-500 outline-none"
                  />
                </div>
                <div className="pt-4 border-t border-surface-700/50 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">Publish Course</p>
                    <p className="text-xs text-surface-400">Make it visible to students</p>
                  </div>
                  <button
                    onClick={() => setEditForm({...editForm, is_published: !editForm.is_published})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editForm.is_published ? 'bg-primary-500' : 'bg-surface-700'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editForm.is_published ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Curriculum Builder ── */}
      {activeTab === 'curriculum' && (
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-surface-700/50 bg-surface-900/60">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-white">Curriculum Builder</h3>
              <p className="text-sm text-surface-400 mt-1">Organize your course into modules and lessons.</p>
            </div>
            <button 
              onClick={addModule}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500/10 text-primary-400 font-bold hover:bg-primary-500/20 transition-colors"
            >
              <Plus size={16} /> Add Module
            </button>
          </div>

          <div className="space-y-6">
            {editForm.modules.map((module, mIdx) => (
              <div key={module.id || mIdx} className="border border-surface-700/50 rounded-2xl overflow-hidden bg-surface-800/20">
                {/* Module Header */}
                <div className="flex items-center gap-4 p-4 bg-surface-800/50 border-b border-surface-700/50">
                  <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-surface-950 font-bold shrink-0">
                    {mIdx + 1}
                  </div>
                  <input
                    type="text"
                    value={module.title}
                    onChange={e => updateModule(mIdx, 'title', e.target.value)}
                    placeholder="Module Title"
                    className="flex-1 bg-transparent text-lg font-bold text-white outline-none border-none placeholder-surface-600 focus:ring-0"
                  />
                  <button onClick={() => deleteModule(mIdx)} className="p-2 text-surface-500 hover:text-rose-400 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Lessons List */}
                <div className="p-4 space-y-3">
                  {module.lessons?.map((lesson, lIdx) => (
                    <div key={lesson.id || lIdx} className="flex flex-col md:flex-row md:items-center gap-4 p-3 bg-surface-900 rounded-xl border border-surface-700/50">
                      <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <Video size={16} className="text-surface-500" />
                          <select 
                            value={lesson.type}
                            onChange={e => updateLesson(mIdx, lIdx, 'type', e.target.value)}
                            className="bg-transparent text-sm text-surface-300 font-mono outline-none cursor-pointer"
                          >
                            <option value="video">Video</option>
                            <option value="quiz">Quiz</option>
                            <option value="reading">Reading</option>
                          </select>
                        </div>
                        <input
                          type="text"
                          value={lesson.title}
                          onChange={e => updateLesson(mIdx, lIdx, 'title', e.target.value)}
                          placeholder="Lesson Title"
                          className="flex-1 bg-transparent text-sm text-white outline-none border-none placeholder-surface-600 focus:ring-0"
                        />
                      </div>
                      <div className="flex items-center gap-4 border-t border-surface-800 pt-3 md:border-none md:pt-0">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-surface-500" />
                          <input
                            type="text"
                            value={lesson.duration || ''}
                            onChange={e => updateLesson(mIdx, lIdx, 'duration', e.target.value)}
                            placeholder="10m"
                            className="w-16 bg-surface-800 text-sm text-white px-2 py-1 rounded border border-surface-700 outline-none text-center"
                          />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={lesson.is_preview}
                            onChange={e => updateLesson(mIdx, lIdx, 'is_preview', e.target.checked)}
                            className="accent-primary-500 w-4 h-4"
                          />
                          <span className="text-xs text-surface-400 uppercase">Preview</span>
                        </label>
                        <button onClick={() => deleteLesson(mIdx, lIdx)} className="p-1.5 text-surface-500 hover:text-rose-400 bg-surface-800 rounded-md transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => addLesson(mIdx)}
                    className="w-full flex items-center justify-center gap-2 py-3 mt-2 border-2 border-dashed border-surface-700/50 rounded-xl text-surface-400 hover:text-primary-400 hover:border-primary-500/30 hover:bg-primary-500/5 transition-all text-sm font-bold"
                  >
                    <Plus size={16} /> Add Lesson to {module.title || 'Module'}
                  </button>
                </div>
              </div>
            ))}
            
            {editForm.modules.length === 0 && (
              <div className="text-center py-12">
                <BookOpen size={32} className="text-surface-600 mx-auto mb-3" />
                <p className="text-surface-300 font-bold">No modules yet</p>
                <p className="text-surface-500 text-sm mb-4">Start by adding your first module to the curriculum.</p>
                <button onClick={addModule} className="px-4 py-2 rounded-xl gradient-primary text-surface-950 font-bold inline-flex items-center gap-2">
                  <Plus size={16} /> Add Module
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Students ── */}
      {activeTab === 'students' && (
        <div className="glass-card rounded-3xl border border-surface-700/50 bg-surface-900/60 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-surface-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Enrolled Students</h2>
              <p className="text-sm text-surface-400 mt-1">Manage students assigned to this course.</p>
            </div>
            <button
              onClick={() => setShowEnrollModal(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-surface-950 font-bold hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all shrink-0"
            >
              <Plus size={16} /> Enroll Student
            </button>
          </div>

          {enrolledStudents.length === 0 ? (
            <div className="p-16 text-center">
              <Users size={32} className="text-surface-600 mx-auto mb-3" />
              <p className="text-lg font-bold text-white mb-1">No students enrolled</p>
              <p className="text-sm text-surface-400">Assign a student to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-700/50">
              {enrolledStudents.map(student => (
                <div key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-8 sm:py-5 hover:bg-surface-800/30 transition-colors gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-surface-950 font-black text-lg shadow-lg">
                      {student.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg">{student.name}</p>
                      <p className="text-sm text-surface-400 font-mono">{student.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnenrollStudent(student.id)}
                    className="px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-colors font-bold text-sm shrink-0"
                  >
                    <Trash2 size={16} /> Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Enroll Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-surface-900 border border-surface-700 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-surface-700 flex justify-between items-center bg-surface-800/50">
              <h3 className="font-bold text-white">Enroll Student</h3>
              <button onClick={() => setShowEnrollModal(false)} className="text-surface-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-bold text-surface-300 mb-2">Select Student</label>
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-3 text-white focus:border-primary-500 outline-none appearance-none"
              >
                <option value="">-- Choose a student --</option>
                {availableStudents.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                ))}
              </select>
              {availableStudents.length === 0 && (
                <p className="text-xs text-rose-400 mt-2 font-mono">All available students are already enrolled.</p>
              )}
            </div>
            <div className="p-5 border-t border-surface-700 bg-surface-800/50 flex justify-end gap-3">
              <button onClick={() => setShowEnrollModal(false)} className="px-4 py-2 font-bold text-surface-400 hover:text-white transition-colors">
                Cancel
              </button>
              <button
                onClick={handleEnrollStudent}
                disabled={!selectedStudentId}
                className="px-6 py-2 rounded-xl gradient-primary text-surface-950 font-bold hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enroll Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
