import React, { useState, useEffect } from 'react';

export default function CalendarModal({
  selectedDate,
  eventTitle,
  eventDescription,
  setEventTitle,
  setEventDescription,
  closeModal,
  handleEditEventClick,
  editingEvent,
}) {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // 일정 조회 함수
  const fetchEvents = async () => {
    try {
      if (selectedDate) {
        const formattedDate = selectedDate.toLocaleDateString('en-CA'); // "YYYY-MM-DD" 형식
        const response = await fetch(`http://localhost:8080/list?date=${formattedDate}&specificDay=true`)
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        } else {
          alert('일정 조회에 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      alert('일정 조회 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchEvents();
      setEventTitle('');
      setEventDescription('');
      setSelectedEvent(null);
      setIsEditing(false); // 날짜 변경 시 편집 모드 초기화
    }
  }, [selectedDate]);

  useEffect(() => {
    if (events.length > 0) {
      setSelectedEvent(events[0]); // 이벤트가 있으면 첫 번째 이벤트를 선택
      setEventTitle(events[0].title);
      setEventDescription(events[0].description);
    } else {
      setSelectedEvent(null); // 일정이 없으면 선택된 이벤트 초기화
    }
  }, [events]);

  const handleAddEventClick = async () => {
    if (!eventTitle && !eventDescription) {
      alert('제목이나 설명 중 하나는 반드시 입력해야 합니다.');
      return;
    }

    const formattedDate = selectedDate.toLocaleDateString('en-CA'); // "YYYY-MM-DD" 형식
    const calendarData = {
      title: eventTitle,
      description: eventDescription,
      selectedDate: formattedDate,
    };

    try {
      const response = await fetch('http://localhost:8080/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calendarData),
      });

      if (response.ok) {
        alert('일정이 추가되었습니다.');
        closeModal();
      } else {
        const errorResponse = await response.json();
        console.error('Error:', errorResponse);
        alert('일정 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error adding event:', error);
      alert('일정 추가 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteEventClick = async () => {
    if (!selectedEvent || !selectedEvent.id) {
      alert('삭제할 일정이 선택되지 않았습니다.');
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:8080/delete/${selectedEvent.id}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        alert('일정이 삭제되었습니다.');
        closeModal();
      } else {
        alert('일정 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('일정 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleEditEvent = () => {
    setIsEditing(true);
  };

  const formattedDate = selectedDate.toLocaleDateString('en-CA'); // "YYYY-MM-DD" 형식
  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`http://localhost:8080/update/${selectedEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: eventTitle,
          description: eventDescription,
          selectedDate: formattedDate
        }),
      });

      if (response.ok) {
        alert('일정이 수정되었습니다.');
        closeModal();
      } else {
        alert('일정 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      alert('일정 수정 중 오류가 발생했습니다.');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEventTitle(selectedEvent.title);
    setEventDescription(selectedEvent.description);
  };

  return (
    <div className="modal">
      <h3>{selectedDate ? selectedDate.toLocaleDateString('en-CA') : ''}</h3>
  
      {selectedEvent ? (
        <>
          {!isEditing ? (
            <div>
              <h4>{selectedEvent.title}</h4>
              <p>{selectedEvent.description}</p>
              <div className="button-group">
                <button onClick={handleEditEvent}>일정 수정</button>
                <button onClick={handleDeleteEventClick}>일정 삭제</button>
                <button onClick={closeModal}>취소</button>
              </div>
            </div>
          ) : (
            <div>
              <input
                type="text"
                placeholder="수정 제목"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
              />
              <textarea
                placeholder="수정 설명"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
              />
              <div className="button-group">
                <button onClick={handleSaveEdit}>저장</button>
                <button onClick={handleCancelEdit}>취소</button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div>
          <input
            type="text"
            placeholder="일정 제목"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
          />
          <textarea
            placeholder="일정 설명"
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
          />
          <div className="button-group">
            <button onClick={handleAddEventClick}>일정 추가</button>
            <button onClick={closeModal}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}