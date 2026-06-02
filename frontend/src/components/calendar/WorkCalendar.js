import React, { useEffect, useState } from 'react';
import { calendarService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function WorkCalendar() {
  const { user } = useAuth();
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ name: '', holidayDate: '' });
  const [error, setError]       = useState('');

  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    calendarService.getHolidays()
      .then(res => setHolidays(res.data))
      .catch(() => setError('Failed to load holidays'))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await calendarService.addHoliday(form);
      setHolidays(prev =>
        [...prev, res.data].sort((a, b) => a.holidayDate.localeCompare(b.holidayDate))
      );
      setForm({ name: '', holidayDate: '' });
      setShowForm(false);
    } catch { setError('Failed to add holiday'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this holiday?')) return;
    await calendarService.deleteHoliday(id);
    setHolidays(prev => prev.filter(h => h.id !== id));
  };

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const holidayMap = holidays.reduce((acc, h) => {
    acc[h.holidayDate] = h;
    return acc;
  }, {});

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const mm          = String(month + 1).padStart(2, '0');

  const monthHolidays = Object.entries(holidayMap)
    .filter(([d]) => d.startsWith(`${year}-${mm}`))
    .sort(([a], [b]) => a.localeCompare(b));

  if (loading) return <div className="loading">Loading calendar...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📅 Work Calendar</h1>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            + Add Holiday
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && isAdmin && (
        <div className="card mb-16">
          <div className="card-header">
            <span className="card-title">Add Holiday</span>
          </div>
          <form onSubmit={handleAdd}>
            <div className="form-row">
              <div className="form-group">
                <label>Holiday Name *</label>
                <input value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Christmas Day" required />
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input type="date" value={form.holidayDate}
                  onChange={e => setForm({ ...form, holidayDate: e.target.value })} required />
              </div>
            </div>
            <div className="flex-gap">
              <button type="submit" className="btn btn-primary">Add Holiday</button>
              <button type="button" className="btn btn-warning" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <button className="btn btn-secondary btn-sm" onClick={prevMonth}>&#8592; Prev</button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <select value={month} onChange={e => setMonth(Number(e.target.value))}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14, color: '#3a3a7c', fontWeight: 600 }}>
              {MONTH_NAMES.map((name, i) => <option key={i} value={i}>{name}</option>)}
            </select>
            <select value={year} onChange={e => setYear(Number(e.target.value))}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14, color: '#3a3a7c', fontWeight: 600 }}>
              {Array.from({ length: 11 }, (_, i) => today.getFullYear() - 5 + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button className="btn btn-secondary btn-sm"
              onClick={() => { setMonth(today.getMonth()); setYear(today.getFullYear()); }}>
              Today
            </button>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={nextMonth}>Next &#8594;</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
          {DAY_LABELS.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#888', padding: '4px 0' }}>{d}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day     = i + 1;
            const dd      = String(day).padStart(2, '0');
            const dateStr = `${year}-${mm}-${dd}`;
            const holiday = holidayMap[dateStr];
            const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
            const dow     = new Date(year, month, day).getDay();
            const isWeekend = dow === 0 || dow === 6;
            return (
              <div key={day} title={holiday ? `🎉 ${holiday.name}` : ''}
                style={{
                  textAlign: 'center', padding: '10px 4px', borderRadius: 6, fontSize: 13,
                  fontWeight: isToday ? 700 : 400,
                  backgroundColor: holiday ? '#f0c040' : isToday ? '#3a3a7c' : 'transparent',
                  color: holiday ? '#3a3a7c' : isToday ? '#fff' : isWeekend ? '#e55' : '#333',
                  border: isToday ? '2px solid #3a3a7c' : '2px solid transparent',
                  minHeight: 40, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 2,
                }}>
                <span>{day}</span>
                {holiday && (
                  <span style={{ fontSize: 9, color: '#7a5c00', fontWeight: 600, lineHeight: 1.1, textAlign: 'center' }}>
                    {holiday.name}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {monthHolidays.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-header">
            <span className="card-title">Holidays in {MONTH_NAMES[month]} {year}</span>
            <span style={{ color: '#888', fontSize: 12 }}>{monthHolidays.length} holiday(s)</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Holiday</th><th>Date</th><th>Day</th>
                {isAdmin && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {monthHolidays.map(([d, h]) => (
                <tr key={d}>
                  <td>🎉 {h.name}</td>
                  <td>{d}</td>
                  <td>{new Date(d + 'T00:00:00').toLocaleDateString('default', { weekday: 'long' })}</td>
                  {isAdmin && (
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(h.id)}>Remove</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {monthHolidays.length === 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <p className="empty-msg">No holidays in {MONTH_NAMES[month]} {year}</p>
        </div>
      )}
    </div>
  );
}
