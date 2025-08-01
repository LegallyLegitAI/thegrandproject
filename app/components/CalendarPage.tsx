
"use client";
import React from 'react';
import { useStateContext } from '@/app/lib/state';
import { Icon } from './Icon';

export default function CalendarPage() {
    const { state, dispatch } = useStateContext();
    const { events } = state.calendar;

    const handleToggleComplete = (id: number) => {
        const newEvents = events.map(e => e.id === id ? { ...e, completed: !e.completed } : e);
        dispatch({ type: 'HYDRATE_STATE', payload: { calendar: { ...state.calendar, events: newEvents } } });
    };

    const handleDelete = (id: number) => {
        const newEvents = events.filter(e => e.id !== id);
        dispatch({ type: 'HYDRATE_STATE', payload: { calendar: { ...state.calendar, events: newEvents } } });
    };

    const handleAddEvent = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const titleInput = form.elements.namedItem('title') as HTMLInputElement;
        const dateInput = form.elements.namedItem('date') as HTMLInputElement;

        if (!titleInput.value || !dateInput.value) return;

        const newEvent = {
            id: Date.now(),
            title: titleInput.value,
            date: dateInput.value,
            category: 'Custom',
            completed: false
        };
        const newEvents = [newEvent, ...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        dispatch({ type: 'HYDRATE_STATE', payload: { calendar: { ...state.calendar, events: newEvents } } });
        form.reset();
    };

    const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <div className="calendar-container">
            <div className="dashboard-header">
                <h2>Compliance Calendar</h2>
                <p className="subtle-text">Stay on top of important deadlines for ASIC, ATO, and WorkCover.</p>
            </div>
            <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>Add Custom Event</h3>
                <form className="custom-event-form" onSubmit={handleAddEvent}>
                    <input name="title" type="text" placeholder="e.g., Renew business registration" required />
                    <input name="date" type="date" required />
                    <button className="btn btn-primary" type="submit">Add Event</button>
                </form>
            </div>
            <div className="event-list">
                {sortedEvents.map(event => (
                    <div key={event.id} className={`event-item ${event.completed ? 'completed' : ''}`} data-category={event.category}>
                        <input className="event-checkbox" type="checkbox" checked={event.completed} onChange={() => handleToggleComplete(event.id)} aria-label={`Mark event ${event.title} as complete`} />
                        <div className="event-date">
                            <span className="month">{new Date(event.date).toLocaleDateString('en-AU', { month: 'short' }).toUpperCase()}</span>
                            <span className="day">{new Date(event.date).getDate()}</span>
                        </div>
                        <div className="event-details">
                            <h4>{event.title}</h4>
                            <span className="event-category-badge" data-category={event.category}>{event.category}</span>
                        </div>
                        {event.category === 'Custom' && (
                            <button className="btn-delete-event" aria-label={`Delete event ${event.title}`} onClick={() => handleDelete(event.id)}>×</button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
