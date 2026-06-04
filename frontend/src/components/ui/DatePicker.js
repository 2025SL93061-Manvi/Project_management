import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function parseISO(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  return { year: y, month: m - 1, day: d };
}

function toISO(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatDisplay(iso) {
  const p = parseISO(iso);
  if (!p) return '';
  return `${String(p.day).padStart(2, '0')}/${String(p.month + 1).padStart(2, '0')}/${p.year}`;
}

export function DatePicker({ value, onChange, name, placeholder = 'DD / MM / YYYY', className }) {
  const today = new Date();
  const todayY = today.getFullYear();
  const todayM = today.getMonth();
  const todayD = today.getDate();

  const parsed = parseISO(value);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState('days');
  const [viewYear, setViewYear] = useState(parsed?.year ?? todayY);
  const [viewMonth, setViewMonth] = useState(parsed?.month ?? todayM);

  const ref = useRef(null);

  useEffect(() => {
    function onMouseDown(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setView('days');
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  function openPicker() {
    const p = parseISO(value);
    setViewYear(p?.year ?? todayY);
    setViewMonth(p?.month ?? todayM);
    setView('days');
    setOpen(o => !o);
  }

  function selectDay(day) {
    onChange({ target: { name, value: toISO(viewYear, viewMonth, day) } });
    setOpen(false);
    setView('days');
  }

  function prevNav() {
    if (view === 'days') {
      if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
      else setViewMonth(m => m - 1);
    } else if (view === 'years') {
      setViewYear(y => y - 12);
    }
  }

  function nextNav() {
    if (view === 'days') {
      if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
      else setViewMonth(m => m + 1);
    } else if (view === 'years') {
      setViewYear(y => y + 12);
    }
  }

  function cycleView() {
    setView(v => v === 'days' ? 'months' : v === 'months' ? 'years' : 'days');
  }

  // Day grid
  const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  // Year grid: 12-year page aligned to multiples of 12
  const yearPageStart = Math.floor(viewYear / 12) * 12;
  const yearGrid = Array.from({ length: 12 }, (_, i) => yearPageStart + i);

  const isSelected = d => parsed?.year === viewYear && parsed?.month === viewMonth && parsed?.day === d;
  const isToday    = d => todayY === viewYear && todayM === viewMonth && todayD === d;

  const headerTitle =
    view === 'days'   ? `${MONTHS[viewMonth]} ${viewYear}` :
    view === 'months' ? `${viewYear}` :
                        `${yearGrid[0]} – ${yearGrid[11]}`;

  return (
    <div ref={ref} className={cn('relative', className)}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={openPicker}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 bg-white border rounded-lg text-[13px] outline-none transition-all duration-150 shadow-sm',
          open
            ? 'border-[#3f51b5] ring-2 ring-[#3f51b5]/15'
            : 'border-gray-200 hover:border-[#3f51b5]/40'
        )}
      >
        <span className={value ? 'text-gray-800 font-medium tracking-wide' : 'text-gray-400'}>
          {formatDisplay(value) || placeholder}
        </span>
        <CalendarDays size={14} className={open ? 'text-[#3f51b5]' : 'text-gray-400'} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-50 mt-1.5 bg-white rounded-2xl overflow-hidden w-[272px]"
          style={{ boxShadow: '0 12px 40px rgba(63,81,181,0.18), 0 2px 8px rgba(0,0,0,0.08)' }}
        >
          {/* Gradient header */}
          <div className="bg-gradient-to-br from-[#3f51b5] to-[#5c6bc0] px-4 pt-4 pb-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={prevNav}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white"
              >
                <ChevronLeft size={15} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={cycleView}
                className="text-[13px] font-bold text-white hover:bg-white/20 px-3 py-1 rounded-lg transition-colors tracking-wide"
              >
                {headerTitle} ▾
              </button>
              <button
                type="button"
                onClick={nextNav}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white"
              >
                <ChevronRight size={15} strokeWidth={2.5} />
              </button>
            </div>
            {value && (
              <p className="text-center text-white/70 text-[11px] mt-1.5 font-medium tracking-widest uppercase">
                {formatDisplay(value)}
              </p>
            )}
          </div>

          <div className="p-3">
            {/* ── Day view ── */}
            {view === 'days' && (
              <>
                <div className="grid grid-cols-7 mb-2">
                  {DAY_LABELS.map(d => (
                    <div key={d} className="text-center text-[10px] font-bold text-gray-400 tracking-widest py-1">
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-y-0.5">
                  {cells.map((d, i) =>
                    d === null ? <div key={`blank-${i}`} /> : (
                      <button
                        key={d}
                        type="button"
                        onClick={() => selectDay(d)}
                        className={cn(
                          'h-8 w-8 mx-auto flex items-center justify-center rounded-full text-[12px] font-medium transition-all duration-100',
                          isSelected(d)
                            ? 'bg-[#3f51b5] text-white shadow font-bold scale-110'
                            : isToday(d)
                            ? 'ring-2 ring-[#3f51b5] text-[#3f51b5] font-bold'
                            : 'text-gray-700 hover:bg-indigo-50 hover:text-[#3f51b5]'
                        )}
                      >
                        {d}
                      </button>
                    )
                  )}
                </div>
              </>
            )}

            {/* ── Month view ── */}
            {view === 'months' && (
              <div className="grid grid-cols-3 gap-1.5">
                {MONTHS.map((m, i) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setViewMonth(i); setView('days'); }}
                    className={cn(
                      'py-2.5 rounded-xl text-[12px] font-medium transition-all',
                      viewMonth === i
                        ? 'bg-[#3f51b5] text-white shadow-sm'
                        : 'hover:bg-indigo-50 text-gray-700 hover:text-[#3f51b5]'
                    )}
                  >
                    {m.slice(0, 3)}
                  </button>
                ))}
              </div>
            )}

            {/* ── Year view ── */}
            {view === 'years' && (
              <div className="grid grid-cols-3 gap-1.5">
                {yearGrid.map(y => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => { setViewYear(y); setView('months'); }}
                    className={cn(
                      'py-2.5 rounded-xl text-[12px] font-medium transition-all',
                      y === viewYear
                        ? 'bg-[#3f51b5] text-white shadow-sm'
                        : y === todayY
                        ? 'ring-2 ring-[#3f51b5] text-[#3f51b5] font-bold'
                        : 'hover:bg-indigo-50 text-gray-700 hover:text-[#3f51b5]'
                    )}
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
