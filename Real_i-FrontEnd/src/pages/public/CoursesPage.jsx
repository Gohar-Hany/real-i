import { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
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
  const headerRef = useRef(null);

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
      gsap.from(headerRef.current, {
        opacity: 0, y: 30, duration: 0.8, ease: 'power3.out', delay: 0.2,
      });
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
    });
    return () => ctx.revert();
  }, [filtered]);

  return (
    <>
      <Helmet>
        <title>REAL.i | Advanced Neural Modules</title>
        <meta name="description" content="Explore our catalog of advanced cognitive modules and elevate your technical prowess." />
      </Helmet>
      <div className="min-h-screen bg-surface-950 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-surface-100 mb-3">
            Explore <span className="text-gradient">Courses</span>
          </h1>
          <p className="text-surface-400 text-lg max-w-xl">
            Discover expert-led AI and technology courses designed to build real-world skills.
          </p>
        </div>

        {/* Filters Bar */}
        <div className="glass-card rounded-2xl p-5 mb-10 border border-surface-800/50">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses, topics, or skills..."
                className="w-full pl-12 pr-10 py-3 rounded-xl bg-surface-800/50 border border-surface-700/50 text-sm text-surface-100 placeholder-surface-500 outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Level Filter */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-surface-500 shrink-0" />
              <div className="flex gap-1.5">
                {levels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setActiveLevel(level)}
                    className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                      activeLevel === level
                        ? 'gradient-primary text-surface-950 shadow-glow-sm'
                        : 'bg-surface-800/50 text-surface-400 hover:text-surface-200 hover:bg-surface-700/50'
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
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 ${
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

        {/* Results Count */}
        <p className="text-sm text-surface-500 mb-6">
          Showing <span className="text-surface-200 font-semibold">{filtered.length}</span> course{filtered.length !== 1 ? 's' : ''}
          {activeCategory !== 'All' && <> in <span className="text-primary-400">{activeCategory}</span></>}
        </p>

        {/* Course Grid */}
        {filtered.length === 0 ? (
          <div className="glass-card rounded-2xl p-16 text-center">
            <Search size={48} className="text-surface-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-surface-300 mb-2">No courses found</h3>
            <p className="text-surface-500 text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course, i) => (
              <CourseCard key={course.id} course={course} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
