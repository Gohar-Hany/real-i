import { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, X, BookOpen, Cpu } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CourseCard from '@/components/features/courses/CourseCard';
import { COURSES, CATEGORIES } from '@/data/mockData';

gsap.registerPlugin(ScrollTrigger);

export default function CoursesPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeLevel, setActiveLevel] = useState('All');
  const containerRef = useRef(null);

  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filtered = COURSES.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(search.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = activeCategory === 'All' || c.category === activeCategory;
    const matchLevel = activeLevel === 'All' || c.level === activeLevel;
    return matchSearch && matchCat && matchLevel;
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero header animation
      gsap.from('.courses-hero-content', {
        opacity: 0, y: 30, duration: 0.8, ease: 'power3.out', delay: 0.2,
      });

      // Filter bar
      gsap.from('.courses-filters', {
        opacity: 0, y: 20, duration: 0.6, ease: 'power3.out', delay: 0.4,
      });

      // Course cards stagger
      ScrollTrigger.batch('.course-card', {
        onEnter: (elements) => {
          gsap.from(elements, {
            opacity: 0, y: 50, duration: 0.6,
            stagger: 0.1, ease: 'power2.out',
          });
        },
        start: 'top 90%',
        once: true,
      });
    }, containerRef);
    return () => ctx.revert();
  }, [filtered]);

  return (
    <>
      <Helmet>
        <title>Real_i | Advanced Neural Modules</title>
        <meta name="description" content="Explore our catalog of advanced cognitive modules and elevate your technical prowess." />
      </Helmet>

      <div ref={containerRef} className="min-h-screen bg-surface-950">
        {/* ── Hero Section ── */}
        <section className="relative pt-32 pb-12 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/5 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary-500/3 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 courses-hero-content">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-[2px] bg-primary-500" />
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary-500">Module Library</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading text-primary-500 uppercase tracking-wider mb-4 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
              Explore Courses
            </h1>
            <p className="text-lg text-surface-300 max-w-2xl font-arabic leading-relaxed">
              Discover expert-led AI and technology courses designed to build real-world skills.
              Each module is engineered for maximum cognitive throughput.
            </p>

            {/* Stats row */}
            <div className="flex items-center gap-8 mt-8">
              <div className="flex items-center gap-2">
                <Cpu size={16} className="text-primary-500" />
                <span className="font-mono text-xs text-surface-400 uppercase tracking-wider">
                  {COURSES.length} Modules Available
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-primary-500" />
                <span className="font-mono text-xs text-surface-400 uppercase tracking-wider">
                  {CATEGORIES.length - 1} Categories
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Main Content ── */}
        <section className="relative pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Filters Bar */}
            <div className="courses-filters glass-card rounded-none p-5 mb-10 border border-surface-800/50 relative">
              {/* Cyber accent corners */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary-500/40" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary-500/40" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary-500/40" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary-500/40" />

              <div className="relative">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search courses, topics, or skills..."
                      className="w-full pl-12 pr-10 py-3 bg-surface-900/80 border border-surface-700/50 text-sm text-surface-100 placeholder-surface-500 outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all font-mono"
                    />
                    {search && (
                      <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors">
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 overflow-hidden">
                    <SlidersHorizontal size={16} className="text-surface-500 shrink-0" />
                    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-2 w-full">
                      {levels.map((level) => (
                        <button
                          key={level}
                          onClick={() => setActiveLevel(level)}
                          className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 shrink-0 ${
                            activeLevel === level
                              ? 'bg-primary-500 text-surface-950'
                              : 'bg-surface-900/80 text-surface-400 border border-surface-700/50 hover:text-surface-200 hover:border-surface-600/50'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-2 text-xs font-mono font-medium whitespace-nowrap transition-all duration-300 uppercase tracking-wider ${
                        activeCategory === cat
                          ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30'
                          : 'text-surface-400 border border-surface-800/50 hover:border-surface-600/50 hover:text-surface-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between mb-8">
              <p className="font-mono text-xs text-surface-500 uppercase tracking-wider">
                Showing <span className="text-surface-200 font-semibold">{filtered.length}</span> module{filtered.length !== 1 ? 's' : ''}
                {activeCategory !== 'All' && <> in <span className="text-primary-400">{activeCategory}</span></>}
              </p>
              <div className="h-px bg-surface-800 flex-grow mx-6 hidden sm:block" />
            </div>

            {/* Course Grid */}
            {filtered.length === 0 ? (
              <div className="glass-card p-16 text-center border border-surface-800/50">
                <Search size={48} className="text-surface-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-surface-300 mb-2 font-heading uppercase tracking-wider">No Modules Found</h3>
                <p className="text-surface-500 text-sm font-mono">Try adjusting your search parameters or filters.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((course, i) => (
                  <CourseCard key={course.id} course={course} index={i} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
