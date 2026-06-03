import React, { useEffect, useState } from 'react';
import { calendarService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { Alert } from '../ui/alert';
import { Card, CardHeader, CardTitle } from '../ui/card';
import { FormGroup } from '../ui/form-group';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../ui/table';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function WorkCalendar() {
  const { user } = useAuth();
  const [holidays, setHolidays] = useState([]);
  const [events, setEvents]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ name: '', holidayDate: '' });
  const [error, setError]       = useState('');

  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    Promise.all([
      calendarService.getHolidays(),
      calendarService.getEvents(),
    ])
      .then(([hRes, eRes]) => {
        setHolidays(hRes.data);
        setEvents(eRes.data);
      })
      .catch(() => setError('Failed to load calendar data'))
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

  // Group events by date — each date key holds an array of events
  const eventMap = events.reduce((acc, e) => {
    if (!acc[e.date]) acc[e.date] = [];
    acc[e.date].push(e);
    return acc;
  }, {});

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const mm          = String(month + 1).padStart(2, '0');

  const monthHolidays = Object.entries(holidayMap)
    .filter(([d]) => d.startsWith(`${year}-${mm}`))
    .sort(([a], [b]) => a.localeCompare(b));

  const monthEvents = events
    .filter(e => e.date.startsWith(`${year}-${mm}`))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-gray-400 animate-pulse">Loading calendar…</div>
    </div>
  );
  

  return (
    <div>
      <div className="flex justify-between items-center mb-7">
        <div>
          <h1 className="text-[24px] font-extrabold text-[#1a237e] tracking-tight">📅 Work Calendar</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">{holidays.length} holiday{holidays.length !== 1 ? 's' : ''} configured</p>
        </div>
        {isAdmin && (
          <Button variant="primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Holiday'}
          </Button>
        )}
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {showForm && isAdmin && (
        <Card className="mb-5">
          <CardHeader>
            <CardTitle>Add Holiday</CardTitle>
          </CardHeader>
          <form onSubmit={handleAdd}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <FormGroup>
                <Label>Holiday Name *</Label>
                <Input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Christmas Day"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={form.holidayDate}
                  onChange={e => setForm({ ...form, holidayDate: e.target.value })}
                  required
                />
              </FormGroup>
            </div>
            <div className="flex gap-3">
              <Button type="submit" variant="primary">Add Holiday</Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Calendar card */}
      <Card>
        {/* Navigation */}
        <div className="flex items-center justify-between mb-5">
          <Button variant="secondary" size="sm" onClick={prevMonth}>← Prev</Button>

          <div className="flex items-center gap-2">
            <Select
              value={month}
              onChange={e => setMonth(Number(e.target.value))}
              className="w-auto text-[13px] font-semibold text-[#1a237e] py-1.5"
            >
              {MONTH_NAMES.map((name, i) => <option key={i} value={i}>{name}</option>)}
            </Select>
            <Select
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="w-auto text-[13px] font-semibold text-[#1a237e] py-1.5"
            >
              {Array.from({ length: 11 }, (_, i) => today.getFullYear() - 5 + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </Select>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { setMonth(today.getMonth()); setYear(today.getFullYear()); }}
            >
              Today
            </Button>
          </div>

          <Button variant="secondary" size="sm" onClick={nextMonth}>Next →</Button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAY_LABELS.map(d => (
            <div key={d} className="text-center text-[11px] font-bold text-gray-400 uppercase tracking-wider py-1">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day     = i + 1;
            const dd      = String(day).padStart(2, '0');
            const dateStr = `${year}-${mm}-${dd}`;
            const holiday = holidayMap[dateStr];
            const dayEvents = eventMap[dateStr] || [];
            const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
            const dow     = new Date(year, month, day).getDay();
            const isWeekend = dow === 0 || dow === 6;
            const hasMeeting   = dayEvents.some(e => e.type === 'MEETING');
            const hasMilestone = dayEvents.some(e => e.type === 'MILESTONE');

            let cellClass = 'text-center px-1 py-2 rounded-xl text-[13px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors cursor-default ';
            if (holiday) {
              cellClass += 'bg-amber-100 text-amber-800 font-semibold border border-amber-300';
            } else if (hasMeeting && hasMilestone) {
              cellClass += 'bg-indigo-50 text-indigo-800 font-semibold border border-indigo-300';
            } else if (hasMeeting) {
              cellClass += 'bg-blue-50 text-blue-800 font-semibold border border-blue-300';
            } else if (hasMilestone) {
              cellClass += 'bg-purple-50 text-purple-800 font-semibold border border-purple-300';
            } else if (isToday) {
              cellClass += 'bg-[#3f51b5] text-white font-bold shadow-md';
            } else if (isWeekend) {
              cellClass += 'text-red-400 hover:bg-red-50';
            } else {
              cellClass += 'text-gray-700 hover:bg-gray-50';
            }

            const titleParts = [
              holiday ? `🎉 ${holiday.name}` : '',
              ...dayEvents.map(e => e.type === 'MEETING' ? `${e.title}` : `${e.title}`),
            ].filter(Boolean).join('\n');

            return (
              <div key={day} title={titleParts} className={cellClass}>
                <span className="leading-none">{day}</span>
                {holiday && (
                  <span className="text-[8px] text-amber-700 font-bold leading-tight text-center px-1 truncate w-full">
                    🎉 {holiday.name}
                  </span>
                )}
                {dayEvents.map(e => (
                  <span
                    key={`${e.type}-${e.id}`}
                    className={`text-[8px] font-bold leading-tight text-center px-1 truncate w-full ${
                      e.type === 'MEETING' ? 'text-blue-600' : 'text-purple-600'
                    }`}
                  >
                    {e.type === 'MEETING' ? '' : ''} {e.title}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Holiday list for current month */}
      {monthHolidays.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🎉 Holidays in {MONTH_NAMES[month]} {year}</CardTitle>
            <span className="text-xs text-gray-400 font-medium">{monthHolidays.length} holiday{monthHolidays.length !== 1 ? 's' : ''}</span>
          </CardHeader>
          <Table>
            <TableHead>
              <tr>
                <TableHeader>Holiday</TableHeader>
                <TableHeader>Date</TableHeader>
                <TableHeader>Day</TableHeader>
                {isAdmin && <TableHeader>Action</TableHeader>}
              </tr>
            </TableHead>
            <TableBody>
              {monthHolidays.map(([d, h]) => (
                <TableRow key={d}>
                  <TableCell className="font-medium text-gray-800">🎉 {h.name}</TableCell>
                  <TableCell className="text-gray-500">{d}</TableCell>
                  <TableCell className="text-gray-500">{new Date(d + 'T00:00:00').toLocaleDateString('default', { weekday: 'long' })}</TableCell>
                  {isAdmin && (
                    <TableCell>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(h.id)}>Remove</Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {monthHolidays.length === 0 && (
        <Card>
          <p className="text-center py-8 text-gray-400">No holidays in {MONTH_NAMES[month]} {year}</p>
        </Card>
      )}

      {/* Events (meetings + milestones) for current month */}
      {monthEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📋 Events in {MONTH_NAMES[month]} {year}</CardTitle>
            <span className="text-xs text-gray-400 font-medium">{monthEvents.length} event{monthEvents.length !== 1 ? 's' : ''}</span>
          </CardHeader>
          <Table>
            <TableHead>
              <tr>
                <TableHeader>Event</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader>Date</TableHeader>
                <TableHeader>Project</TableHeader>
              </tr>
            </TableHead>
            <TableBody>
              {monthEvents.map(e => (
                <TableRow key={`${e.type}-${e.id}`}>
                  <TableCell className="font-medium text-gray-800">
                    {e.type === 'MEETING' ? '🔵' : '🟣'} {e.title}
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      e.type === 'MEETING'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {e.type === 'MEETING' ? 'Meeting' : 'Milestone'}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-500">{e.date}</TableCell>
                  <TableCell className="text-gray-500">{e.projectName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
