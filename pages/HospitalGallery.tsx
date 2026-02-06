import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Grid3X3, LayoutGrid, Camera, Filter, X } from 'lucide-react';
import Contact from '../components/Contact';
import { getProcedureCaseImage } from '../utils/imageUtils';
import { useHospitalGallery, HospitalCase } from '../hooks/useData';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../contexts/LanguageContext';
import procedureNames from '../i18n/procedureNames.json';

// Type for procedure names translation
type ProcedureNameTranslations = {
  [key: string]: {
    en: string;
    zh: string;
    es: string;
    fr: string;
    de: string;
    ru: string;
    ar: string;
    vi: string;
    id: string;
  };
};

const typedProcedureNames = procedureNames as ProcedureNameTranslations;

const HospitalGallery: React.FC = () => {
  const { hospitalSlug } = useParams<{ hospitalSlug: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const { data: galleryData, isLoading } = useHospitalGallery(hospitalSlug);

  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');
  const [hoveredCase, setHoveredCase] = useState<string | null>(null);
  const [selectedProcedure, setSelectedProcedure] = useState<string>('all');
  const [selectedSurgeon, setSelectedSurgeon] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Get translated procedure name
  const getTranslatedProcedureName = (name: string): string => {
    const translation = typedProcedureNames[name];
    if (translation && translation[currentLanguage as keyof typeof translation]) {
      return translation[currentLanguage as keyof typeof translation];
    }
    return name;
  };

  // Filter cases based on selected procedure and surgeon
  const filteredCases = useMemo(() => {
    if (!galleryData?.cases) return [];

    return galleryData.cases.filter(c => {
      const matchesProcedure = selectedProcedure === 'all' || c.procedures?.id === selectedProcedure;
      const matchesSurgeon = selectedSurgeon === 'all' || c.surgeons?.surgeon_id === selectedSurgeon;
      return matchesProcedure && matchesSurgeon;
    });
  }, [galleryData?.cases, selectedProcedure, selectedSurgeon]);

  // Group cases by procedure for display
  const casesByProcedure = useMemo(() => {
    const grouped: { [key: string]: { name: string; cases: HospitalCase[] } } = {};

    filteredCases.forEach(c => {
      const procId = c.procedures?.id || 'unknown';
      const procName = c.procedures?.procedure_name || 'Other';

      if (!grouped[procId]) {
        grouped[procId] = { name: procName, cases: [] };
      }
      grouped[procId].cases.push(c);
    });

    return Object.entries(grouped).sort((a, b) => a[1].name.localeCompare(b[1].name));
  }, [filteredCases]);

  const handleBack = () => {
    navigate(`/hospital/${hospitalSlug}`);
  };

  const handleCaseClick = (procedureName: string, caseNumber: string) => {
    navigate(`/procedure/${encodeURIComponent(procedureName)}/case/${caseNumber}`);
  };

  const clearFilters = () => {
    setSelectedProcedure('all');
    setSelectedSurgeon('all');
  };

  const hasActiveFilters = selectedProcedure !== 'all' || selectedSurgeon !== 'all';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gold-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-500">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (!galleryData?.hospital) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-serif text-navy-900 mb-4">Hospital not found</h2>
          <button
            onClick={() => navigate('/')}
            className="text-gold-600 hover:text-gold-500"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white animate-fade-in-up">
      {/* Hero Section */}
      <section className="relative bg-navy-900 py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-luxury-green opacity-90"></div>
        <div className="container mx-auto px-6 relative z-10">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="flex items-center text-white/70 hover:text-white mb-8 transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
            <span className="uppercase tracking-wider text-sm">Back to {galleryData.hospital.name}</span>
          </button>

          <div className="text-center">
            <span className="inline-block px-4 py-1.5 bg-gold-600/20 text-gold-400 text-xs uppercase tracking-[0.2em] mb-4">
              Before & After Gallery
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white mb-4">
              {galleryData.hospital.name}
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto text-lg">
              View real patient transformations performed by our expert surgical team.
            </p>
            <div className="mt-6 flex items-center justify-center gap-6 text-white/60 text-sm">
              <span>{galleryData.cases.length} Cases</span>
              <span>•</span>
              <span>{galleryData.procedures.length} Procedures</span>
              <span>•</span>
              <span>{galleryData.surgeons.length} Surgeons</span>
            </div>
          </div>

          {/* View Mode & Filter Controls */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-gold-600 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Filter size={16} />
              <span className="text-sm uppercase tracking-wider">Filters</span>
              {hasActiveFilters && (
                <span className="w-5 h-5 bg-white text-gold-600 rounded-full text-xs flex items-center justify-center font-bold">
                  {(selectedProcedure !== 'all' ? 1 : 0) + (selectedSurgeon !== 'all' ? 1 : 0)}
                </span>
              )}
            </button>

            <div className="flex items-center bg-white/10 rounded overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-white text-gold-600' : 'text-white/70 hover:text-white'}`}
                title="Grid View"
              >
                <Grid3X3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('masonry')}
                className={`p-2 transition-colors ${viewMode === 'masonry' ? 'bg-white text-gold-600' : 'text-white/70 hover:text-white'}`}
                title="Masonry View"
              >
                <LayoutGrid size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Panel */}
      {showFilters && (
        <section className="bg-stone-100 py-6 border-b border-stone-200">
          <div className="container mx-auto px-6">
            <div className="flex flex-wrap gap-6 items-end">
              {/* Procedure Filter */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs uppercase tracking-wider text-stone-500 mb-2">
                  Filter by Procedure
                </label>
                <select
                  value={selectedProcedure}
                  onChange={(e) => setSelectedProcedure(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded text-stone-700 focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  <option value="all">All Procedures ({galleryData.procedures.length})</option>
                  {galleryData.procedures.map(proc => (
                    <option key={proc.id} value={proc.id}>
                      {getTranslatedProcedureName(proc.procedure_name)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Surgeon Filter */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs uppercase tracking-wider text-stone-500 mb-2">
                  Filter by Surgeon
                </label>
                <select
                  value={selectedSurgeon}
                  onChange={(e) => setSelectedSurgeon(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded text-stone-700 focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  <option value="all">All Surgeons ({galleryData.surgeons.length})</option>
                  {galleryData.surgeons.map(surgeon => (
                    <option key={surgeon.surgeon_id} value={surgeon.surgeon_id}>
                      {surgeon.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2.5 text-stone-500 hover:text-stone-700 transition-colors"
                >
                  <X size={16} />
                  <span className="text-sm">Clear Filters</span>
                </button>
              )}
            </div>

            {/* Results count */}
            <div className="mt-4 text-sm text-stone-500">
              Showing {filteredCases.length} of {galleryData.cases.length} cases
            </div>
          </div>
        </section>
      )}

      {/* Gallery Content - Grouped by Procedure */}
      <section className="py-12 md:py-16 bg-stone-50">
        <div className="container mx-auto px-6">
          {filteredCases.length === 0 ? (
            <div className="text-center py-20">
              <Camera className="w-16 h-16 text-stone-300 mx-auto mb-6" />
              <h3 className="text-2xl font-serif text-navy-900 mb-4">No cases found</h3>
              <p className="text-stone-500 max-w-md mx-auto mb-8">
                {hasActiveFilters
                  ? 'Try adjusting your filters to see more results.'
                  : 'No before & after cases are available for this hospital yet.'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="bg-gold-600 text-white px-8 py-3 uppercase tracking-wider text-sm hover:bg-gold-500 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-16">
              {casesByProcedure.map(([procId, { name, cases }]) => (
                <div key={procId}>
                  {/* Procedure Section Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="font-serif text-2xl md:text-3xl text-navy-900">
                        {getTranslatedProcedureName(name)}
                      </h2>
                      <p className="text-stone-500 mt-1">{cases.length} cases</p>
                    </div>
                    <button
                      onClick={() => navigate(`/procedure/${encodeURIComponent(name)}/gallery`)}
                      className="text-gold-600 hover:text-gold-500 text-sm uppercase tracking-wider font-medium"
                    >
                      View All {name} Cases →
                    </button>
                  </div>

                  {/* Cases Grid */}
                  <div className={`${viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6'
                  }`}>
                    {cases.map((caseItem) => {
                      const procedureName = caseItem.procedures?.procedure_name || '';
                      const caseImage = getProcedureCaseImage(procedureName, caseItem.case_number, 1);
                      const isHovered = hoveredCase === caseItem.case_number;

                      return (
                        <div
                          key={caseItem.id}
                          className={`bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group ${
                            viewMode === 'masonry' ? 'break-inside-avoid mb-6' : ''
                          }`}
                          onClick={() => handleCaseClick(procedureName, caseItem.case_number)}
                          onMouseEnter={() => setHoveredCase(caseItem.case_number)}
                          onMouseLeave={() => setHoveredCase(null)}
                        >
                          {/* Image Container */}
                          <div className="relative">
                            <div className="aspect-[4/3] bg-sage-100 overflow-hidden">
                              <img
                                src={caseImage}
                                alt={`Case #${caseItem.case_number}`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop';
                                }}
                              />
                            </div>

                            {/* Hover Overlay */}
                            <div className={`absolute inset-0 bg-navy-900/70 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                              <div className="text-center">
                                <span className="text-white uppercase tracking-widest text-sm font-medium">
                                  View Details
                                </span>
                                <div className="mt-2 w-12 h-0.5 bg-gold-500 mx-auto"></div>
                              </div>
                            </div>
                          </div>

                          {/* Case Info */}
                          <div className="p-5">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="text-navy-900 font-semibold text-lg">
                                Case #{caseItem.case_number}
                              </h3>
                              {caseItem.image_count && caseItem.image_count > 1 && (
                                <span className="text-xs bg-gold-100 text-gold-700 px-2 py-1 rounded-full">
                                  {caseItem.image_count} photos
                                </span>
                              )}
                            </div>

                            <div className="space-y-1 text-sm text-stone-500">
                              {caseItem.surgeons?.name && (
                                <p><span className="text-stone-400">Surgeon:</span> {caseItem.surgeons.name}</p>
                              )}
                              {caseItem.patient_age && caseItem.patient_gender && (
                                <p>
                                  <span className="text-stone-400">Patient:</span> {caseItem.patient_gender}, {caseItem.patient_age}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-center">
        <div className="container mx-auto px-6">
          <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">
            Ready to Transform?
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-10 text-lg">
            Schedule a consultation with our expert team to discuss your goals.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              className="bg-gold-600 text-white px-10 py-4 uppercase tracking-[0.15em] hover:bg-gold-500 transition-colors text-sm font-medium"
              onClick={() => navigate('/patient-form')}
            >
              Request Consultation
            </button>
            <button
              className="bg-white/10 text-white px-10 py-4 uppercase tracking-[0.15em] hover:bg-white/20 transition-colors text-sm font-medium border border-white/20"
              onClick={handleBack}
            >
              Back to Hospital
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <Contact />
    </div>
  );
};

export default HospitalGallery;
