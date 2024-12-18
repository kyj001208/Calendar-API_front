import React, { useState, useEffect } from 'react';

export default function CalendarModal({
  selectedDate,
  eventTitle,
  eventDescription,
  setEventTitle,
  setEventDescription,
  closeModal,
  fetchEvents, // 이미 전달받은 fetchEvents
  editingEvent,
}) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // 선택된 날짜의 이벤트 초기화
  useEffect(() => {
    if (editingEvent) {
      setEventTitle(editingEvent.title);
      setEventDescription(editingEvent.description);
      setSelectedEvent(editingEvent);
      setIsEditing(false); // 날짜 변경 시 항상 수정 모드가 꺼진 상태로 시작
    } else {
      setEventTitle('');
      setEventDescription('');
      setSelectedEvent(null);
      setIsEditing(false);
    }
  }, [editingEvent, setEventTitle, setEventDescription]);

  const handleAddEventClick = async () => {
    if (!eventTitle && !eventDescription) {
      alert('제목이나 설명 중 하나는 반드시 입력해야 합니다.');
      return;
    }

    const formattedDate = selectedDate.toLocaleDateString('en-CA');
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
        await fetchEvents(); // 매개변수로 전달받은 fetchEvents 호출
        closeModal();
      } else {
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
  
        // fetchEvents로 전체 데이터를 다시 가져와 로컬 상태 동기화
        await fetchEvents();
  
        // 선택된 이벤트 초기화
        setSelectedEvent(null);
        setEventTitle('');
        setEventDescription('');
  
        // 모달 닫기
        closeModal();
      } else {
        alert('일정 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('일정 삭제 중 오류가 발생했습니다.');
    }
  };
  

  const handleSaveEdit = async () => {
    if (!selectedEvent) return;
  
    const formattedDate = selectedDate.toLocaleDateString('en-CA');
    try {
      const response = await fetch(`http://localhost:8080/update/${selectedEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: eventTitle,
          description: eventDescription,
          selectedDate: formattedDate,
        }),
      });
  
      if (response.ok) {
        alert('일정이 수정되었습니다.');
  
        // 수정된 데이터로 selectedEvent와 events 업데이트
        const updatedEvent = { ...selectedEvent, title: eventTitle, description: eventDescription };
        setSelectedEvent(updatedEvent);
  
        // fetchEvents로 전체 데이터를 다시 가져와 로컬 상태 동기화
        await fetchEvents();
  
        // 수정 모드 해제
        setIsEditing(false);
      } else {
        alert('일정 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      alert('일정 수정 중 오류가 발생했습니다.');
    }
  };
  
  

  const handleCancelEdit = () => {
    setIsEditing(false); // 수정 모드 해제
    if (selectedEvent) {
      setEventTitle(selectedEvent.title);
      setEventDescription(selectedEvent.description);
    }
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
                <button onClick={() => setIsEditing(true)}>수정</button>
                <button onClick={handleDeleteEventClick}>삭제</button>
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
            <button onClick={handleAddEventClick}>추가</button>
            <button onClick={closeModal}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}
