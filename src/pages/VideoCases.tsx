import React, { useEffect, useMemo, useState } from 'react';
import { Search, ShieldCheck, SlidersHorizontal, Video } from 'lucide-react';

type VideoCase = {
  id: string;
  doctor: string;
  doctorName: string;
  project: string;
  projectName: string;
  objectKey: string;
  videoUrl: string;
  size: number;
};

type VideoCasePayload = {
  count: number;
  doctors: string[];
  projects: string[];
  cases: VideoCase[];
};

const formatBytes = (bytes: number) => {
  if (!bytes) return '0 MB';
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const labelFromSlug = (slug: string) =>
  slug
    .split('-')
    .filter(Boolean)
    .map((part) => (part === 'and' ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join(' ');

export default function VideoCases() {
  const [payload, setPayload] = useState<VideoCasePayload | null>(null);
  const [query, setQuery] = useState('');
  const [doctor, setDoctor] = useState('all');
  const [project, setProject] = useState('all');
  const [activeCase, setActiveCase] = useState<VideoCase | null>(null);

  useEffect(() => {
    fetch('/video-cases.json')
      .then((response) => response.json())
      .then((data: VideoCasePayload) => {
        setPayload(data);
        setActiveCase(data.cases[0] || null);
      });
  }, []);

  const filteredCases = useMemo(() => {
    const cases = payload?.cases || [];
    const term = query.trim().toLowerCase();
    return cases.filter((item) => {
      const doctorMatches = doctor === 'all' || item.doctor === doctor;
      const projectMatches = project === 'all' || item.project === project;
      const searchMatches =
        !term ||
        item.id.toLowerCase().includes(term) ||
        item.doctorName.toLowerCase().includes(term) ||
        item.projectName.toLowerCase().includes(term);
      return doctorMatches && projectMatches && searchMatches;
    });
  }, [payload, query, doctor, project]);

  useEffect(() => {
    if (!activeCase || !filteredCases.some((item) => item.id === activeCase.id)) {
      setActiveCase(filteredCases[0] || null);
    }
  }, [activeCase, filteredCases]);

  const totalBytes = useMemo(
    () => (payload?.cases || []).reduce((sum, item) => sum + item.size, 0),
    [payload]
  );

  if (!payload) {
    return (
      <section className="min-h-[70vh] bg-stone-50 px-6 py-24">
        <div className="mx-auto max-w-6xl text-sm uppercase tracking-[0.24em] text-stone-500">
          Loading video cases
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#f7f5f0] text-stone-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <div className="border border-stone-300 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">Video cases</p>
                  <h1 className="mt-2 text-2xl font-semibold tracking-normal text-stone-950">R2 Case Library</h1>
                </div>
                <div className="flex h-11 w-11 items-center justify-center bg-stone-950 text-white">
                  <Video size={20} />
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
                <div className="border border-stone-200 p-3">
                  <div className="font-semibold">{payload.count}</div>
                  <div className="mt-1 text-xs text-stone-500">Cases</div>
                </div>
                <div className="border border-stone-200 p-3">
                  <div className="font-semibold">{payload.doctors.length}</div>
                  <div className="mt-1 text-xs text-stone-500">Doctors</div>
                </div>
                <div className="border border-stone-200 p-3">
                  <div className="font-semibold">{formatBytes(totalBytes)}</div>
                  <div className="mt-1 text-xs text-stone-500">Media</div>
                </div>
              </div>
            </div>

            <div className="border border-stone-300 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <SlidersHorizontal size={16} />
                Filters
              </div>
              <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Search</label>
              <div className="mt-2 flex items-center border border-stone-300 bg-stone-50 px-3">
                <Search size={16} className="text-stone-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-11 min-w-0 flex-1 bg-transparent px-2 text-sm outline-none"
                  placeholder="Doctor, project, case ID"
                />
              </div>

              <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Doctor</label>
              <select
                value={doctor}
                onChange={(event) => setDoctor(event.target.value)}
                className="mt-2 h-11 w-full border border-stone-300 bg-stone-50 px-3 text-sm outline-none"
              >
                <option value="all">All doctors</option>
                {payload.doctors.map((item) => (
                  <option key={item} value={item}>
                    {labelFromSlug(item)}
                  </option>
                ))}
              </select>

              <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Project</label>
              <select
                value={project}
                onChange={(event) => setProject(event.target.value)}
                className="mt-2 h-11 w-full border border-stone-300 bg-stone-50 px-3 text-sm outline-none"
              >
                <option value="all">All projects</option>
                {payload.projects.map((item) => (
                  <option key={item} value={item}>
                    {labelFromSlug(item)}
                  </option>
                ))}
              </select>
            </div>

            <div className="border border-stone-300 bg-stone-950 p-4 text-white shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck size={17} />
                Access Notes
              </div>
              <p className="mt-3 text-sm leading-6 text-stone-300">
                Dev view only. R2 objects are public-read through the configured R2 domain; upload credentials stay server-side.
              </p>
            </div>
          </aside>

          <div className="min-w-0 space-y-4">
            <div className="border border-stone-300 bg-white p-3 shadow-sm">
              {activeCase ? (
                <video
                  key={activeCase.videoUrl}
                  className="aspect-video w-full bg-black object-contain"
                  src={activeCase.videoUrl}
                  controls
                  preload="metadata"
                  playsInline
                />
              ) : (
                <div className="flex aspect-video items-center justify-center bg-stone-100 text-sm text-stone-500">
                  No matching videos
                </div>
              )}
              {activeCase && (
                <div className="grid gap-3 border-t border-stone-200 px-1 pt-3 text-sm sm:grid-cols-[1fr_auto]">
                  <div className="min-w-0">
                    <div className="font-semibold">{activeCase.doctorName} / {activeCase.projectName}</div>
                    <div className="mt-1 truncate text-xs text-stone-500">{activeCase.objectKey}</div>
                  </div>
                  <div className="text-xs text-stone-500 sm:text-right">
                    <div>{activeCase.id}</div>
                    <div className="mt-1">{formatBytes(activeCase.size)}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredCases.map((item) => {
                const selected = activeCase?.id === item.id;
                return (
                  <button
                    key={item.objectKey}
                    type="button"
                    onClick={() => setActiveCase(item)}
                    className={`border bg-white p-3 text-left shadow-sm transition hover:border-stone-900 ${
                      selected ? 'border-stone-950 ring-1 ring-stone-950' : 'border-stone-300'
                    }`}
                  >
                    <div className="aspect-video overflow-hidden bg-stone-950">
                      <video
                        className="h-full w-full object-cover"
                        src={item.videoUrl}
                        muted
                        preload="metadata"
                        playsInline
                      />
                    </div>
                    <div className="mt-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{item.doctorName}</div>
                        <div className="mt-1 truncate text-xs text-stone-500">{item.projectName}</div>
                      </div>
                      <div className="shrink-0 text-xs text-stone-500">{formatBytes(item.size)}</div>
                    </div>
                    <div className="mt-2 truncate font-mono text-[11px] text-stone-400">{item.id}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
