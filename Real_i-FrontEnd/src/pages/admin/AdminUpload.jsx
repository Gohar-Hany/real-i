import { useState, useEffect } from 'react';
import FileUpload from '@/components/common/FileUpload';
import { uploadFile, processFiles, pushToIndex, getProjects } from '@/services/api';
import { useToast } from '@/components/common/Toast';
import { Cpu, Database, Loader2, CheckCircle, ArrowRight, Upload, Search, AlertCircle, Plus, FolderOpen } from 'lucide-react';

const PIPELINE_STEPS = [
  { id: 'upload', label: 'Upload', desc: 'Upload file to server', Icon: Upload },
  { id: 'process', label: 'Process', desc: 'Extract & chunk content', Icon: Cpu },
  { id: 'index', label: 'Index', desc: 'Push to vector database', Icon: Search },
];

export default function AdminUpload() {
  const [projectId, setProjectId] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [projects, setProjects] = useState([]);
  const [pipelineStatus, setPipelineStatus] = useState({});
  const [lastResult, setLastResult] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]); // { name, fileId, assetName }
  const [processMode, setProcessMode] = useState('uploaded'); // 'uploaded' | 'all'
  const toast = useToast();

  useEffect(() => {
    getProjects()
      .then(list => {
        setProjects(list);
        // Don't auto-select — let user choose
      })
      .catch(err => toast.error('Failed to fetch projects'));
  }, []);

  // The effective project ID to use (either selected or new)
  const effectiveProjectId = isCreatingNew
    ? newCourseName.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
    : projectId;

  const handleUpload = async (file, onProgress) => {
    if (!effectiveProjectId) {
      toast.error('Please select or create a course first');
      throw new Error('No course selected');
    }
    const result = await uploadFile(effectiveProjectId, file, onProgress);
    // Store the uploaded file info for targeted processing
    setUploadedFiles(prev => [
      ...prev,
      {
        name: file.name,
        fileId: result.file_id,
        assetName: result.asset_name || null,
      }
    ]);
    // Mark upload step as done
    setPipelineStatus(prev => ({ ...prev, upload: 'done' }));
    return result;
  };

  const runPipeline = async () => {
    if (!effectiveProjectId) {
      toast.error('Please select or create a course first');
      return;
    }

    setPipelineStatus({ upload: 'done', process: 'running' });
    try {
      let processResult;

      if (processMode === 'uploaded' && uploadedFiles.length > 0) {
        // Process only the uploaded files, one by one
        let totalChunks = 0;
        let totalFiles = 0;

        for (const uf of uploadedFiles) {
          const result = await processFiles(effectiveProjectId, {
            fileId: uf.assetName || uf.fileId,
            doReset: false, // Don't reset — only add the new file's chunks
          });
          totalChunks += result.inserted_chunks || 0;
          totalFiles += result.processed_files || 0;
        }
        processResult = { inserted_chunks: totalChunks, processed_files: totalFiles };
      } else {
        // Process all files in the project
        processResult = await processFiles(effectiveProjectId, { doReset: true });
      }

      setPipelineStatus({ upload: 'done', process: 'done', index: 'running' });
      toast.success(`Processed ${processResult.processed_files} file(s), ${processResult.inserted_chunks} chunks`);

      const indexResult = await pushToIndex(effectiveProjectId, processMode === 'all');
      setPipelineStatus({ upload: 'done', process: 'done', index: 'done' });
      toast.success(`Indexed ${indexResult.inserted_items_count} items to vector DB`);
      setLastResult({ ...processResult, ...indexResult });

      // Refresh projects list in case a new one was created
      if (isCreatingNew) {
        const list = await getProjects();
        setProjects(list);
        setProjectId(effectiveProjectId);
        setIsCreatingNew(false);
        setNewCourseName('');
      }
      // Clear uploaded files tracking
      setUploadedFiles([]);
    } catch (err) {
      const failed = Object.entries(pipelineStatus).find(([, v]) => v === 'running')?.[0] || 'process';
      setPipelineStatus(prev => ({ ...prev, [failed]: 'error' }));
      toast.error(`Pipeline failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-800/80 border border-surface-700 mb-4 backdrop-blur-md shadow-sm">
            <Database size={14} className="text-primary-400" />
            <span className="text-[11px] font-mono font-bold text-primary-400 uppercase tracking-widest">
              Data Ingestion Protocol
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
            RAG <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-amber-200">Pipeline</span>
          </h1>
          <p className="text-surface-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Upload course materials and execute the processing pipeline to extract, chunk, and index content into the vector database.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column - Setup & Upload */}
        <div className="lg:col-span-5 space-y-8">
          {/* Course / Project Selector */}
          <div className="glass-card rounded-3xl border border-surface-700/50 shadow-2xl bg-surface-900/60 p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-[50px] pointer-events-none"></div>
            
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2 mb-5 relative z-10">
              <span className="w-1.5 h-6 bg-primary-500 rounded-full inline-block"></span>
              Target Course
            </h3>

            {/* Toggle: Existing vs New */}
            <div className="flex bg-surface-950 p-1.5 rounded-xl border border-surface-800 mb-6 relative z-10">
              <button
                onClick={() => setIsCreatingNew(false)}
                className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  !isCreatingNew
                    ? 'bg-surface-800 text-white shadow-md border border-surface-600'
                    : 'text-surface-500 hover:text-surface-300'
                }`}
              >
                <FolderOpen size={14} />
                Existing Course
              </button>
              <button
                onClick={() => setIsCreatingNew(true)}
                className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  isCreatingNew
                    ? 'bg-primary-500/20 text-primary-400 shadow-[0_0_15px_rgba(212,175,55,0.2)] border border-primary-500/30'
                    : 'text-surface-500 hover:text-surface-300'
                }`}
              >
                <Plus size={14} />
                New Course
              </button>
            </div>

            {isCreatingNew ? (
              <div className="relative z-10">
                <input
                  type="text"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="Enter course name (e.g., Machine Learning)"
                  className="w-full px-4 py-3.5 rounded-xl bg-surface-950/80 border border-surface-800 text-sm font-medium outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all text-white placeholder-surface-600"
                />
                {newCourseName.trim() && (
                  <p className="text-[10px] text-surface-400 mt-2 font-mono bg-surface-950 p-2 rounded-lg border border-surface-800">
                    ID Generated: <span className="text-primary-400 font-bold">{effectiveProjectId}</span>
                  </p>
                )}
              </div>
            ) : (
              <div className="relative z-10 w-full">
                {projects.length === 0 ? (
                  <div className="px-4 py-4 rounded-xl bg-surface-950/50 border border-dashed border-surface-700 text-sm text-surface-500 text-center font-bold">
                    No courses found in database.
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      className="w-full appearance-none px-4 py-3.5 rounded-xl bg-surface-950/80 border border-surface-800 text-sm font-medium outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all text-white cursor-pointer"
                    >
                      <option value="" disabled className="bg-surface-900 text-surface-500">Select a course...</option>
                      {projects.map(p => (
                        <option key={p.project_id} value={p.project_id} className="bg-surface-900">
                          {p.project_id}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-surface-500">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!effectiveProjectId && (
              <p className="text-[11px] font-bold text-amber-500 mt-3 flex items-center gap-1.5 uppercase tracking-wider relative z-10 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                <AlertCircle size={14} />
                {isCreatingNew ? 'Input required' : 'Selection required'}
              </p>
            )}
          </div>

          {/* File Upload Area */}
          <div className={`glass-card rounded-3xl border border-surface-700/50 shadow-2xl bg-surface-900/60 p-6 sm:p-8 relative overflow-hidden transition-all duration-300 ${!effectiveProjectId ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2 mb-5 relative z-10">
              <span className="w-1.5 h-6 bg-emerald-500 rounded-full inline-block"></span>
              Step 1: Ingest Files
            </h3>
            <div className="relative z-10">
              <FileUpload
                onUpload={handleUpload}
                accept=".pdf,.txt"
                multiple
              />
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 relative z-10 animate-fade-in-up">
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Session Cache ({uploadedFiles.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {uploadedFiles.map((uf, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-950 border border-emerald-500/30 text-[11px] font-mono font-bold text-emerald-300 shadow-sm">
                      <CheckCircle size={12} className="text-emerald-500" />
                      {uf.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Pipeline & Results */}
        <div className="lg:col-span-7">
          <div className={`glass-card rounded-3xl border border-surface-700/50 shadow-2xl bg-surface-900/60 p-6 sm:p-8 relative overflow-hidden h-full flex flex-col transition-all duration-300 ${!effectiveProjectId ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
              <div>
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-blue-500 rounded-full inline-block"></span>
                  Step 2: Process & Index
                </h3>
                <p className="text-[11px] text-surface-400 uppercase tracking-widest mt-2 font-bold">
                  Extract, Vectorize, and Database Push
                </p>
              </div>
              <button
                onClick={runPipeline}
                disabled={Object.values(pipelineStatus).includes('running') || !effectiveProjectId}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-primary text-surface-950 text-sm font-black disabled:opacity-50 disabled:grayscale transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-95 shrink-0"
              >
                {Object.values(pipelineStatus).includes('running') ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Cpu size={18} />
                )}
                Initialize Pipeline
              </button>
            </div>

            {/* Process Mode Toggle */}
            <div className="mb-8 p-1.5 rounded-xl bg-surface-950 border border-surface-800 relative z-10 flex flex-col sm:flex-row gap-1">
              <button
                onClick={() => setProcessMode('uploaded')}
                disabled={uploadedFiles.length === 0}
                className={`flex-1 px-4 py-3 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${
                  processMode === 'uploaded'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                    : 'text-surface-500 hover:text-surface-300 hover:bg-surface-900 border border-transparent'
                } ${uploadedFiles.length === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                Targeted Processing ({uploadedFiles.length})
              </button>
              <button
                onClick={() => setProcessMode('all')}
                className={`flex-1 px-4 py-3 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${
                  processMode === 'all'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                    : 'text-surface-500 hover:text-surface-300 hover:bg-surface-900 border border-transparent'
                }`}
              >
                Global Reprocess (Wipe & Rebuild)
              </button>
            </div>

            {processMode === 'all' && (
              <p className="text-[11px] font-bold text-amber-500 mb-8 flex items-start gap-2 relative z-10 bg-amber-500/5 p-3 rounded-xl border border-amber-500/20">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                Warning: This directive will wipe all existing vectors for this course and reprocess every file from scratch.
              </p>
            )}

            {/* Pipeline Step Visualizer */}
            <div className="flex flex-col sm:flex-row gap-3 relative z-10 flex-1">
              {PIPELINE_STEPS.map((step, i) => {
                const status = pipelineStatus[step.id];
                return (
                  <div key={step.id} className={`flex-1 p-5 rounded-2xl border transition-all duration-500 relative overflow-hidden ${
                    status === 'running' ? 'border-blue-500/50 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]' :
                    status === 'done' ? 'border-emerald-500/30 bg-emerald-500/5' :
                    status === 'error' ? 'border-rose-500/50 bg-rose-500/10' :
                    'border-surface-700/50 bg-surface-950/50'
                  }`}>
                    {status === 'running' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
                    )}
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner ${
                          status === 'running' ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' :
                          status === 'done' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                          status === 'error' ? 'bg-rose-500/20 border-rose-500/30 text-rose-400' :
                          'bg-surface-900 border-surface-700 text-surface-500'
                        }`}>
                          <step.Icon size={18} />
                        </div>
                        {status === 'running' && <Loader2 size={16} className="animate-spin text-blue-400" />}
                        {status === 'done' && <CheckCircle size={16} className="text-emerald-400" />}
                        {status === 'error' && <AlertCircle size={16} className="text-rose-400" />}
                      </div>
                      
                      <p className={`text-sm font-black uppercase tracking-wider mb-1 ${
                        status === 'running' ? 'text-white' :
                        status === 'done' ? 'text-emerald-50' :
                        status === 'error' ? 'text-rose-50' :
                        'text-surface-400'
                      }`}>{step.label}</p>
                      <p className="text-[10px] text-surface-500 uppercase tracking-widest">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Results Display */}
            {lastResult && (
              <div className="mt-8 relative z-10 animate-fade-in-up">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Operation Successful</h4>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-surface-950 p-4 rounded-xl border border-surface-800">
                    <p className="text-[10px] text-surface-500 uppercase tracking-widest mb-1 font-bold">Files Processed</p>
                    <p className="text-2xl font-black text-white font-mono">{lastResult.processed_files || 0}</p>
                  </div>
                  <div className="bg-surface-950 p-4 rounded-xl border border-surface-800">
                    <p className="text-[10px] text-surface-500 uppercase tracking-widest mb-1 font-bold">Chunks Extracted</p>
                    <p className="text-2xl font-black text-white font-mono">{lastResult.inserted_chunks || 0}</p>
                  </div>
                  <div className="bg-surface-950 p-4 rounded-xl border border-surface-800">
                    <p className="text-[10px] text-surface-500 uppercase tracking-widest mb-1 font-bold">Vectors Indexed</p>
                    <p className="text-2xl font-black text-primary-400 font-mono">{lastResult.inserted_items_count || 0}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
