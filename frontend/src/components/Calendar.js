import React from 'react';
import '../css/Calendar.css';

const Calendar = () => {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const days = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div className="calendar-day empty" key={`empty-${i}`}></div>);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === currentDay;
    days.push(
      <div key={d} className={`calendar-day${isToday ? ' today' : ''}`}>
        {d}
      </div>
    );
  }

  return (
    <div className="calendar-wrapper">
      <div className="calendar-header">
        {today.toLocaleString('default', { month: 'long' })} {currentYear}
      </div>
      <div className="calendar-grid">
        <div className="calendar-day-label">Sun</div>
        <div className="calendar-day-label">Mon</div>
        <div className="calendar-day-label">Tue</div>
        <div className="calendar-day-label">Wed</div>
        <div className="calendar-day-label">Thu</div>
        <div className="calendar-day-label">Fri</div>
        <div className="calendar-day-label">Sat</div>
        {days}
      </div>
    </div>
  );
};

export default Calendar;