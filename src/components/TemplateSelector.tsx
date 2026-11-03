import React from 'react';
import { X, Check } from 'lucide-react';
import templatesData from '../data/templates.json';

interface TemplateSelectorProps {
  currentTemplateId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  currentTemplateId,
  onSelect,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#34364A]/40 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className="bg-[#E9EAF2] w-full max-w-3xl rounded-2xl sm:rounded-3xl neu-raised flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden border border-[#C8CAD4]/40">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#C8CAD4]/40 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-[#34364A]">Choose Resume Template</h2>
            <p className="text-[11px] sm:text-xs text-[#7E8494]">
              All 6 formats are ATS-optimized and adapt cleanly to your data
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 neu-button-secondary rounded-xl text-[#7E8494] hover:text-[#34364A] cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {templatesData.map((tpl) => {
            const isSelected = currentTemplateId === tpl.id;

            return (
              <div
                key={tpl.id}
                onClick={() => {
                  onSelect(tpl.id);
                  onClose();
                }}
                className={`p-4.5 rounded-2xl transition-all cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? 'neu-pressed text-[#7776B8]'
                    : 'neu-raised hover:neu-raised-hover text-[#34364A]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-[#34364A]">{tpl.name}</span>
                    <span
                      className="w-3.5 h-3.5 rounded-full neu-raised"
                      style={{ backgroundColor: tpl.accentColor }}
                    />
                  </div>
                  <div className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full neu-inset text-[#7776B8] mb-2 uppercase tracking-wider">
                    {tpl.badge}
                  </div>
                  <p className="text-xs text-[#7E8494] leading-relaxed">{tpl.tagline}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#C8CAD4]/30">
                  <div className="text-[10px] font-bold text-[#7E8494] mb-1 uppercase tracking-wider">
                    BEST FOR:
                  </div>
                  <div className="text-xs text-[#34364A] font-medium leading-snug">
                    {tpl.recommendedFor}
                  </div>

                  <div className="mt-3.5 flex items-center justify-between">
                    <span className="text-[10px] text-[#7E8494]">
                      {tpl.features.length} ATS checks
                    </span>
                    {isSelected ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-[#6D9B83]">
                        <Check className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-[#7776B8] group-hover:underline">
                        Select →
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
