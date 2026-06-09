import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronDown, MapPin, Play, Search, Video, X } from 'lucide-react';
import {
  filterVideoCasesForProject,
  formatVideoCaseBytes,
  getDoctorsForVideoCases,
  labelFromVideoSlug,
  resolveVideoProjectForProcedure,
  type VideoCase,
  type VideoCasePayload,
} from '@/utils/procedureVideoCases';

const areaFilters = ['Face', 'Body', 'Breast', 'Non-Surgical'];
const concernFilters = ['Aging', 'Contour', 'Volume Loss', 'Fat', 'Skin Quality', 'Symmetry'];

const projectArea: Record<string, string> = {
  'body-contouring': 'Body',
  breast: 'Breast',
  'eye-surgery': 'Face',
  'facial-contouring': 'Face',
  'hair-transplant': 'Face',
  injectables: 'Non-Surgical',
  'nose-surgery': 'Face',
};

const projectConcern: Record<string, string[]> = {
  'body-contouring': ['Contour', 'Fat'],
  breast: ['Volume Loss', 'Symmetry'],
  'eye-surgery': ['Aging', 'Symmetry'],
  'facial-contouring': ['Aging', 'Contour'],
  'hair-transplant': ['Volume Loss'],
  injectables: ['Volume Loss', 'Skin Quality'],
  'nose-surgery': ['Contour', 'Symmetry'],
};

const formatTitle = (item: VideoCase) => {
  const doctor = item.doctorName.replace(/^医院_/, '');
  if (item.project === 'eye-surgery') return `Natural Eyelid Refresh`;
  if (item.project === 'nose-surgery') return `Rhinoplasty Patient Story`;
  if (item.project === 'facial-contouring') return `Facial Contour Result`;
  if (item.project === 'hair-transplant') return `Hairline Restoration Journey`;
  if (item.project === 'body-contouring') return `Body Contouring Result`;
  if (item.project === 'breast') return `Breast Procedure Result`;
  if (item.project === 'injectables') return `Injectable Refinement`;
  return `${doctor} Case Film`;
};

const durationFromId = (id: string) => {
  const seed = id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const seconds = 45 + (seed % 58);
  return `0${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};

export default function ProcedureVideoGallery() {
  const { procedureName: urlProcedureName } = useParams<{ procedureName: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const legacyProcedureName = urlProcedureName ? decodeURIComponent(urlProcedureName) : '';
  const procedureFromQuery = searchParams.get('procedure') || '';
  const projectFromQuery = searchParams.get('project');
  const selectedProject =
    projectFromQuery ||
    resolveVideoProjectForProcedure(procedureFromQuery) ||
    resolveVideoProjectForProcedure(legacyProcedureName) ||
    'all';

  const [payload, setPayload] = useState<VideoCasePayload | null>(null);
  const [query, setQuery] = useState('');
  const [doctor, setDoctor] = useState('all');
  const [activeCase, setActiveCase] = useState<VideoCase | null>(null);

  useEffect(() => {
    if (!legacyProcedureName) return;

    const legacyProject = resolveVideoProjectForProcedure(legacyProcedureName);
    const params = new URLSearchParams(searchParams);
    if (legacyProject) {
      params.set('project', legacyProject);
    } else if (legacyProcedureName) {
      params.set('procedure', legacyProcedureName);
    }
    navigate(`/procedure/videos?${params.toString()}`, { replace: true });
  }, [legacyProcedureName, navigate, searchParams]);

  useEffect(() => {
    let active = true;
    fetch('/video-cases.json')
      .then((response) => response.json())
      .then((data: VideoCasePayload) => {
        if (active) setPayload(data);
      })
      .catch(() => {
        if (active) setPayload({ count: 0, doctors: [], projects: [], cases: [] });
      });

    return () => {
      active = false;
    };
  }, []);

  const projectCases = useMemo(
    () => filterVideoCasesForProject(payload?.cases || [], selectedProject),
    [payload, selectedProject]
  );

  const doctors = useMemo(() => getDoctorsForVideoCases(projectCases), [projectCases]);

  const filteredCases = useMemo(() => {
    const term = query.trim().toLowerCase();
    return projectCases.filter((item) => {
      const doctorMatches = doctor === 'all' || item.doctor === doctor;
      const searchMatches =
        !term ||
        item.id.toLowerCase().includes(term) ||
        item.doctorName.toLowerCase().includes(term) ||
        item.projectName.toLowerCase().includes(term);
      return doctorMatches && searchMatches;
    });
  }, [doctor, projectCases, query]);

  const activeArea = selectedProject !== 'all' ? projectArea[selectedProject] || 'Face' : 'All';
  const activeConcerns = selectedProject !== 'all' ? projectConcern[selectedProject] || ['Contour'] : [];
  const activeProjectLabel = selectedProject !== 'all' ? labelFromVideoSlug(selectedProject) : 'All Procedures';

  const updateProjectFilter = (project: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete('procedure');
    if (project === 'all') {
      params.delete('project');
    } else {
      params.set('project', project);
    }
    setDoctor('all');
    setSearchParams(params, { replace: false });
  };

  const clearFilters = () => {
    setQuery('');
    setDoctor('all');
    updateProjectFilter('all');
  };

  if (!payload) {
    return (
      <div className="min-h-[70vh] bg-[#f7f4ef] px-6 pt-32">
        <div className="mx-auto max-w-7xl">
          <div className="h-4 w-44 animate-pulse bg-stone-200" />
          <div className="mt-8 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
            <div className="h-[520px] animate-pulse rounded-lg bg-white shadow-sm" />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="aspect-[1.38] animate-pulse rounded-lg bg-stone-200" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f7f4ef] text-[#17251f]">
      <section className="px-6 pb-8 pt-28 text-center md:pt-32">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#b8946f]">
          Real patients. Real results.
        </p>
        <h1 className="mt-4 font-serif text-5xl font-light leading-none text-[#10251e] md:text-7xl">
          Video Case Gallery
        </h1>
        <div className="mx-auto mt-5 h-px w-14 bg-[#b8946f]" />
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-stone-600 md:text-lg">
          Discover real patient journeys and procedure videos across the Medora case library.
        </p>
      </section>

      <section className="mx-auto grid max-w-[1480px] gap-6 px-4 pb-20 sm:px-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-8">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-[0_18px_45px_rgba(49,42,32,0.08)]">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <h2 className="text-sm font-bold uppercase tracking-[0.22em] text-stone-800">Filter Cases</h2>
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-[#b8946f] transition hover:text-[#173d31]"
              >
                Clear All
              </button>
            </div>

            <div className="border-b border-stone-200 py-5">
              <button type="button" className="flex w-full items-center justify-between text-left">
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-stone-700">Procedure Type</span>
                <ChevronDown size={17} className="text-stone-500" />
              </button>
              <div className="mt-4 space-y-3">
                {payload.projects
                  .filter((project) => project !== 'clinic-introduction' && project !== 'uncategorized')
                  .map((project) => {
                    const active = project === selectedProject;
                    return (
                      <button
                        key={project}
                        type="button"
                        onClick={() => updateProjectFilter(project)}
                        className="flex w-full items-center gap-3 text-left text-sm text-stone-600 transition hover:text-[#173d31]"
                      >
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-[3px] border ${
                            active ? 'border-[#173d31] bg-[#173d31] text-white' : 'border-stone-300 bg-white'
                          }`}
                        >
                          {active && <span className="h-2 w-2 bg-white" />}
                        </span>
                        <span className={active ? 'font-semibold text-stone-900' : ''}>{labelFromVideoSlug(project)}</span>
                      </button>
                    );
                  })}
              </div>
            </div>

            <div className="border-b border-stone-200 py-5">
              <button type="button" className="flex w-full items-center justify-between text-left">
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-stone-700">Area</span>
                <ChevronDown size={17} className="text-stone-500" />
              </button>
              <div className="mt-4 flex flex-wrap gap-2">
                {areaFilters.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => {
                      const matchingProject = Object.entries(projectArea).find(([, mappedArea]) => mappedArea === area)?.[0];
                      if (matchingProject) updateProjectFilter(matchingProject);
                    }}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold ${
                      area === activeArea
                        ? 'border-[#173d31] bg-[#173d31] text-white'
                        : 'border-stone-200 bg-white text-stone-500'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-b border-stone-200 py-5">
              <button type="button" className="flex w-full items-center justify-between text-left">
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-stone-700">Concern</span>
                <ChevronDown size={17} className="text-stone-500" />
              </button>
              <div className="mt-4 flex flex-wrap gap-2">
                {concernFilters.map((concern) => (
                  <span
                    key={concern}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold ${
                      activeConcerns.includes(concern)
                        ? 'border-[#d6c5b5] bg-[#faf7f2] text-[#173d31]'
                        : 'border-stone-200 bg-white text-stone-500'
                    }`}
                  >
                    {concern}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-b border-stone-200 py-5">
              <button type="button" className="flex w-full items-center justify-between text-left">
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-stone-700">Doctor</span>
                <ChevronDown size={17} className="text-stone-500" />
              </button>
              <select
                value={doctor}
                onChange={(event) => setDoctor(event.target.value)}
                className="mt-4 h-11 w-full rounded-full border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-[#173d31]"
              >
                <option value="all">All Doctors</option>
                {doctors.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="py-5">
              <label className="text-xs font-bold uppercase tracking-[0.22em] text-stone-700">Search</label>
              <div className="mt-4 flex h-11 items-center rounded-full border border-stone-200 bg-white px-4">
                <Search size={15} className="text-stone-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
                  placeholder="Doctor or case ID"
                />
              </div>
            </div>

            <button
              type="button"
              className="mt-1 flex h-12 w-full items-center justify-center gap-2 bg-[#173d31] text-xs font-bold uppercase tracking-[0.24em] text-white transition hover:bg-[#102a22] active:translate-y-px"
            >
              Apply Filters
            </button>
            <p className="mt-4 text-center text-sm font-semibold text-stone-500">
              {filteredCases.length} Results
            </p>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <button
              type="button"
              onClick={() => navigate('/gallery')}
              className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#173d31] transition hover:text-[#b8946f]"
            >
              Video Case Library
            </button>
            <div className="text-sm text-stone-500">
              Showing <span className="font-semibold text-stone-800">{filteredCases.length}</span> {activeProjectLabel} videos
            </div>
          </div>

          {filteredCases.length === 0 ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-lg border border-dashed border-stone-300 bg-white text-center">
              <Video size={42} className="text-stone-300" />
              <h3 className="mt-5 font-serif text-3xl text-[#10251e]">No video cases yet</h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-stone-500">
                No matching videos are available for this procedure filter.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredCases.map((item, index) => (
                <button
                  key={item.objectKey}
                  type="button"
                  onClick={() => setActiveCase(item)}
                  className="group overflow-hidden rounded-lg bg-[#16231f] text-left shadow-[0_16px_38px_rgba(25,23,19,0.18)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(25,23,19,0.24)] active:translate-y-0"
                  style={{ animationDelay: `${Math.min(index, 9) * 45}ms` }}
                >
                  <div className="relative aspect-[1.38] overflow-hidden">
                    <video
                      className="h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-95"
                      src={item.videoUrl}
                      muted
                      preload="metadata"
                      playsInline
                      onLoadedMetadata={(event) => {
                        event.currentTarget.currentTime = 0.2;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#101713] via-[#101713]/20 to-black/10" />
                    <div className="absolute inset-y-0 left-1/2 w-px bg-white/40" />
                    <div className="absolute left-4 top-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/85">Before</div>
                    <div className="absolute right-4 top-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/85">After</div>
                    <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/10 text-white backdrop-blur-sm transition group-hover:scale-110">
                      <Play size={20} fill="currentColor" />
                    </div>
                    <div className="absolute bottom-16 left-7 right-7">
                      <h3 className="font-serif text-3xl font-light leading-[1.08] text-white drop-shadow md:text-4xl">
                        {formatTitle(item)}
                      </h3>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 grid grid-cols-[1fr_auto_auto] items-center gap-3 border-t border-white/15 bg-[#111b17]/80 px-4 py-3 text-xs text-white/80 backdrop-blur-sm">
                      <span className="font-bold uppercase tracking-[0.16em] text-[#caa37a]">{item.projectName}</span>
                      <span className="flex min-w-0 items-center gap-1 truncate">
                        <MapPin size={13} />
                        Medora
                      </span>
                      <span className="font-mono">{durationFromId(item.id)}</span>
                    </div>
                  </div>
                  <div className="sr-only">
                    {item.doctorName} {formatVideoCaseBytes(item.size)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {activeCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f1613]/85 px-4 py-8 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl rounded-lg bg-[#f7f4ef] p-3 shadow-2xl">
            <button
              type="button"
              onClick={() => setActiveCase(null)}
              className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-stone-700 shadow-lg transition hover:text-[#173d31]"
              aria-label="Close video"
            >
              <X size={20} />
            </button>
            <video
              key={activeCase.videoUrl}
              className="aspect-video w-full rounded bg-[#111b17] object-contain"
              src={activeCase.videoUrl}
              controls
              autoPlay
              playsInline
            />
            <div className="grid gap-2 px-1 pt-4 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b8946f]">{activeCase.projectName}</p>
                <h3 className="mt-1 font-serif text-2xl text-[#10251e]">{formatTitle(activeCase)}</h3>
                <p className="mt-1 text-sm text-stone-500">{activeCase.doctorName}</p>
              </div>
              <p className="font-mono text-xs text-stone-400 md:text-right">{activeCase.id}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
