import React, { useState, useEffect } from 'react';
import './Calendar.css';
import CalendarModal from './CalendarModal';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [editingEvent, setEditingEvent] = useState(null);

  // 일정 데이터를 가져오는 함수
  const fetchEvents = async () => {
    try {
      const formattedMonth = currentDate.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit' });
      const response = await fetch(`http://localhost:8080/list?date=${formattedMonth}-01&specificDay=false`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        alert('일정 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      alert('일정 조회 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const lastMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const generateDays = () => {
    const daysInMonth = [];
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInWeek = 7;

    for (let i = 0; i < startOfMonth.getDay(); i++) {
      daysInMonth.push(null);
    }

    for (let i = 1; i <= endOfMonth.getDate(); i++) {
      daysInMonth.push(i);
    }

    while (daysInMonth.length % daysInWeek !== 0) {
      daysInMonth.push(null);
    }

    return daysInMonth;
  };

  const getEventsForDay = (day) => {
    if (!day) return [];
    const dateString = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toLocaleDateString('en-CA');
    return events.filter((event) => event.selectedDate === dateString);
  };

  const handleDateClick = (day) => {
    if (day) {
      const newSelectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      setSelectedDate(newSelectedDate);
      setEditingEvent(events.find((event) => event.selectedDate === newSelectedDate.toLocaleDateString('en-CA')));
      setModalOpen(true);
    }
  };

  return (
    <div className="calendar-container">
      <h1>캘린더</h1>
      <div className="calendar-header">
        <button onClick={lastMonth}>이전 달</button>
        <h2>{currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월</h2>
        <button onClick={nextMonth}>다음 달</button>
      </div>

      <div className="calendar-grid">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <div key={index} className="calendar-header-day">{day}</div>
        ))}

        {generateDays().map((day, index) => (
          <div
            key={index}
            className={`calendar-day ${day ? '' : 'empty-day'}`}
            onClick={() => handleDateClick(day)}
          >
            {day && (
              <>
                <span className="day-number">{day}</span>
                {getEventsForDay(day).map((event, idx) => (
                  <div key={idx} className="event-title">{event.title}</div>
                ))}
              </>
            )}
          </div>
        ))}
      </div>

      {modalOpen && (
        <CalendarModal
          selectedDate={selectedDate}
          eventTitle={eventTitle}
          eventDescription={eventDescription}
          setEventTitle={setEventTitle}
          setEventDescription={setEventDescription}
          closeModal={() => setModalOpen(false)}
          fetchEvents={fetchEvents}
          editingEvent={editingEvent}
        />
      )}
    </div>
  );
}

