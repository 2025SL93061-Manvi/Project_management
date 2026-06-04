import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { ChevronLeft, ChevronRight, CalendarDays, Clock } from 'lucide-react';

const MONTHS     = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS = ['Su','Mo','Tu','We','Th','Fr','Sa'];
const HOURS      = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES    = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

/* ── helpers ── */
function parseDT(iso) {
  if (!iso) return null;
  const [datePart, timePart = '00:00'] = iso.split('T');
  const [y, mo, d] = datePart.split('-').map(Number);
  const [h, mi]    = timePart.split(':').map(Number);
  if (!y || !mo || !d) return null;
  const ampm = h < 12 ? 'AM' : 'PM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return { year: y, month: mo - 1, day: d, hour: hour12, minute: mi ?? 0, ampm };
}

function toDTLocal(year, month, day, hour12, minute, ampm) {
  const h24 = ampm === 'AM'
    ? (hour12 === 12 ? 0 : hour12)
    : (hour12 === 12 ? 12 : hour12 + 12);
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function formatDisplay(iso) {
  const p = parseDT(iso);
  if (!p) return '';
  return `${String(p.day).padStart(2, '0')}/${String(p.month + 1).padStart(2, '0')}/${p.year}  •  ${String(p.hour).padStart(2, '0')}:${String(p.minute).padStart(2, '0')} ${p.ampm}`;
}

/* ── scrollable time column ── */
function TimeColumn({ items, selected, onSelect, itemRef }) {
  const colRef = useRef(null);

  useEffect(() => {
    const idx = items.indexOf(selected);
    if (colRef.current && idx >= 0) {
      colRef.current.scrollTo({ top: idx * 36, behavior: 'smooth' });
    }
  }, [selected, items]);

  return (
    <div
      ref={colRef}
      className="h-[144px] overflow-y-auto scroll-smooth hide-scrollbar flex flex-col items-center"
      style={{ scrollSnapType: 'y mandatory' }}
    >
      {items.map(item => (
        <button
          key={item}
          type="button"
          ref={item === selected ? itemRef : null}
          onClick={() => onSelect(item)}
          style={{ scrollSnapAlign: 'start', minHeight: 36 }}
          className={cn(
            'w-10 h-9 flex items-center justify-center rounded-lg text-[13px] font-semibold transition-all duration-100',
            item === selected
              ? 'bg-[#3f51b5] text-white shadow-sm'
              : 'text-gray-600 hover:bg-indigo-50 hover:text-[#3f51b5]'
          )}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

/* ── main component ── */
export function DateTimePicker({ value, onChange, name, placeholder = 'DD/MM/YYYY  •  HH:MM AM', className }) {
  const today = new Date();
  const todayY = today.getFullYear();
  const todayM = today.getMonth();
  const todayD = today.getDate();

  const parsed   = parseDT(value);
  const [open, setOpen]       = useState(false);
  const [view, setView]       = useState('days');
  const [viewYear, setViewYear]   = useState(parsed?.year  ?? todayY);
  const [viewMonth, setViewMonth] = useState(parsed?.month ?? todayM);

  const [selDay,    setSelDay]    = useState(parsed?.day    ?? null);
  const [selHour,   setSelHour]   = useState(String(parsed?.hour   ?? 9).padStart(2, '0'));
  const [selMinute, setSelMinute] = useState(String(parsed?.minute ?? 0).padStart(2, '0'));
  const [selAmpm,   setSelAmpm]   = useState(parsed?.ampm  ?? 'AM');

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
    const p = parseDT(value);
    setViewYear(p?.year  ?? todayY);
    setViewMonth(p?.month ?? todayM);
    setSelDay(p?.day ?? null);
    setSelHour(String(p?.hour   ?? 9).padStart(2, '0'));
    setSelMinute(String(p?.minute ?? 0).padStart(2, '0'));
    setSelAmpm(p?.ampm ?? 'AM');
    setView('days');
    setOpen(o => !o);
  }

  const emit = useCallback((day, hour, minute, ampm) => {
    if (!day) return;
    onChange({ target: { name, value: toDTLocal(viewYear, viewMonth, day, Number(hour), Number(minute), ampm) } });
  }, [viewYear, viewMonth, name, onChange]);

  function selectDay(d) {
    setSelDay(d);
    emit(d, selHour, selMinute, selAmpm);
  }

  function changeHour(h)   { setSelHour(h);   emit(selDay, h, selMinute, selAmpm); }
  function changeMinute(m) { setSelMinute(m);  emit(selDay, selHour, m, selAmpm); }
  function changeAmpm(a)   { setSelAmpm(a);    emit(selDay, selHour, selMinute, a); }

  function confirm() { setOpen(false); setView('days'); }
  function clear()   {
    setSelDay(null);
    onChange({ target: { name, value: '' } });
    setOpen(false);
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

  const totalDays  = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay   = new Date(viewYear, viewMonth, 1).getDay();
  const cells      = [...Array(firstDay).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];
  const yearBase   = Math.floor(viewYear / 12) * 12;
  const yearGrid   = Array.from({ length: 12 }, (_, i) => yearBase + i);

  const isSelected = d => selDay === d && selDay !== null;
  const isToday    = d => todayY === viewYear && todayM === viewMonth && todayD === d;

  const headerTitle =
    view === 'days'   ? `${MONTHS[viewMonth]} ${viewYear}` :
    view === 'months' ? `${viewYear}` :
                        `${yearGrid[0]} – ${yearGrid[11]}`;

  return (
    <div ref={ref} className={cn('relative', className)}>
      {/* Trigger */}
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
          className="absolute z-50 mt-1.5 bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 12px 40px rgba(63,81,181,0.18), 0 2px 8px rgba(0,0,0,0.08)', minWidth: 420 }}
        >
          {/* Gradient header */}
          <div className="bg-gradient-to-br from-[#3f51b5] to-[#5c6bc0] px-5 pt-4 pb-3">
            <div className="flex items-center justify-between">
              <button type="button" onClick={prevNav}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white">
                <ChevronLeft size={15} strokeWidth={2.5} />
              </button>
              <button type="button" onClick={cycleView}
                className="text-[13px] font-bold text-white hover:bg-white/20 px-3 py-1 rounded-lg transition-colors tracking-wide">
                {headerTitle} ▾
              </button>
              <button type="button" onClick={nextNav}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white">
                <ChevronRight size={15} strokeWidth={2.5} />
              </button>
            </div>
            {value && (
              <p className="text-center text-white/80 text-[11px] mt-1.5 font-medium tracking-widest uppercase">
                {formatDisplay(value)}
              </p>
            )}
          </div>

          {/* Body: calendar + time */}
          <div className="flex">
            {/* ── Calendar side ── */}
            <div className="p-3 flex-1">
              {view === 'days' && (
                <>
                  <div className="grid grid-cols-7 mb-1.5">
                    {DAY_LABELS.map(d => (
                      <div key={d} className="text-center text-[10px] font-bold text-gray-400 tracking-widest py-1">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-y-0.5">
                    {cells.map((d, i) =>
                      d === null ? <div key={`b${i}`} /> : (
                        <button key={d} type="button" onClick={() => selectDay(d)}
                          className={cn(
                            'h-8 w-8 mx-auto flex items-center justify-center rounded-full text-[12px] font-medium transition-all duration-100',
                            isSelected(d)
                              ? 'bg-[#3f51b5] text-white shadow font-bold scale-110'
                              : isToday(d)
                              ? 'ring-2 ring-[#3f51b5] text-[#3f51b5] font-bold'
                              : 'text-gray-700 hover:bg-indigo-50 hover:text-[#3f51b5]'
                          )}
                        >{d}</button>
                      )
                    )}
                  </div>
                </>
              )}
              {view === 'months' && (
                <div className="grid grid-cols-3 gap-1.5">
                  {MONTHS.map((m, i) => (
                    <button key={m} type="button"
                      onClick={() => { setViewMonth(i); setView('days'); }}
                      className={cn(
                        'py-2.5 rounded-xl text-[12px] font-medium transition-all',
                        viewMonth === i
                          ? 'bg-[#3f51b5] text-white shadow-sm'
                          : 'hover:bg-indigo-50 text-gray-700 hover:text-[#3f51b5]'
                      )}
                    >{m.slice(0, 3)}</button>
                  ))}
                </div>
              )}
              {view === 'years' && (
                <div className="grid grid-cols-3 gap-1.5">
                  {yearGrid.map(y => (
                    <button key={y} type="button"
                      onClick={() => { setViewYear(y); setView('months'); }}
                      className={cn(
                        'py-2.5 rounded-xl text-[12px] font-medium transition-all',
                        y === viewYear
                          ? 'bg-[#3f51b5] text-white shadow-sm'
                          : y === todayY
                          ? 'ring-2 ring-[#3f51b5] text-[#3f51b5] font-bold'
                          : 'hover:bg-indigo-50 text-gray-700 hover:text-[#3f51b5]'
                      )}
                    >{y}</button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Divider ── */}
            <div className="w-px bg-gray-100 my-3" />

            {/* ── Time side ── */}
            <div className="px-3 py-3 flex flex-col items-center gap-1" style={{ minWidth: 140 }}>
              <div className="flex items-center gap-1 mb-1">
                <Clock size={12} strokeWidth={2} className="text-[#3f51b5]" />
                <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Time</span>
              </div>

              {/* Selected time badge */}
              <div className="flex items-center gap-1 mb-2 bg-indigo-50 rounded-lg px-3 py-1">
                <span className="text-[15px] font-extrabold text-[#3f51b5] tracking-wider">
                  {selHour}:{selMinute}
                </span>
                <span className="text-[11px] font-bold text-[#5c6bc0] ml-1">{selAmpm}</span>
              </div>

              <div className="flex gap-1 items-start">
                {/* Hour */}
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Hr</span>
                  <TimeColumn items={HOURS} selected={selHour} onSelect={changeHour} />
                </div>
                <span className="text-gray-300 font-bold mt-7 text-lg">:</span>
                {/* Minute */}
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Min</span>
                  <TimeColumn items={MINUTES} selected={selMinute} onSelect={changeMinute} />
                </div>
                {/* AM/PM */}
                <div className="flex flex-col items-center ml-1">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">\u200E</span>
                  <div className="flex flex-col gap-1.5 mt-1">
                    {['AM','PM'].map(a => (
                      <button key={a} type="button" onClick={() => changeAmpm(a)}
                        className={cn(
                          'w-10 h-9 rounded-lg text-[12px] font-bold transition-all',
                          selAmpm === a
                            ? 'bg-[#3f51b5] text-white shadow-sm'
                            : 'text-gray-500 hover:bg-indigo-50 hover:text-[#3f51b5]'
                        )}
                      >{a}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50/60">
            <button type="button" onClick={clear}
              className="text-[12px] font-semibold text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50">
              Clear
            </button>
            <button type="button"
              onClick={() => { selectDay(todayD); setViewYear(todayY); setViewMonth(todayM); }}
              className="text-[12px] font-semibold text-[#3f51b5] hover:bg-indigo-50 transition-colors px-2 py-1 rounded-lg">
              Today
            </button>
            <button type="button" onClick={confirm}
              className="text-[12px] font-bold bg-[#3f51b5] text-white px-4 py-1.5 rounded-lg hover:bg-[#303f9f] transition-colors shadow-sm">
              Done
            </button>
          </div>
        </div>
      )}

      <style>{`.hide-scrollbar::-webkit-scrollbar{display:none}.hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}
