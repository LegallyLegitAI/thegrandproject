// app/lib/hooks/useDatabase.ts
import { createClient } from '@/app/lib/supabase';
import { useStateContext } from '@/app/lib/state';
import { showToast } from '@/app/lib/actions';

export function useDatabase() {
  const { state, dispatch } = useStateContext();
  const supabase = createClient();

  // Save document to database
  const saveDocument = async (document: any) => {
    if (!state.user) return;
    
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: state.user.id,
          template_key: document.templateKey,
          name: document.name,
          content: document.content,
          form_data: document.formData
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Update local state
      dispatch({
        type: 'HYDRATE_STATE',
        payload: {
          docStudio: {
            ...state.docStudio,
            savedDocs: [...state.docStudio.savedDocs, {
              id: data.id,
              templateKey: data.template_key,
              name: data.name,
              date: new Date(data.created_at).toLocaleDateString('en-AU'),
              content: data.content
            }]
          }
        }
      });
      
      showToast(dispatch, 'Document saved successfully!', 'success');
      return data;
    } catch (error) {
      console.error('Save document error:', error);
      showToast(dispatch, 'Failed to save document', 'error');
      return null;
    }
  };

  // Save health check results
  const saveHealthCheck = async (answers: any, results: any) => {
    if (!state.user) return;
    
    try {
      const { data, error } = await supabase
        .from('health_checks')
        .insert({
          user_id: state.user.id,
          answers,
          score: results.score,
          risks: results.risks
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: state.user.id,
        action: 'health_check_completed',
        resource_type: 'health_check',
        resource_id: data.id,
        metadata: { score: results.score }
      });
      
      return data;
    } catch (error) {
      console.error('Save health check error:', error);
      return null;
    }
  };

  // Calendar event management
  const addCalendarEvent = async (event: any) => {
    if (!state.user) return;
    
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          user_id: state.user.id,
          title: event.title,
          date: event.date,
          category: event.category,
          description: event.description
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Update local state
      const newEvents = [...state.calendar.events, {
        id: data.id,
        title: data.title,
        date: data.date,
        category: data.category,
        completed: false
      }];
      
      dispatch({
        type: 'HYDRATE_STATE',
        payload: {
          calendar: {
            ...state.calendar,
            events: newEvents.sort((a, b) => 
              new Date(a.date).getTime() - new Date(b.date).getTime()
            )
          }
        }
      });
      
      showToast(dispatch, 'Event added to calendar', 'success');
      return data;
    } catch (error) {
      console.error('Add calendar event error:', error);
      showToast(dispatch, 'Failed to add event', 'error');
      return null;
    }
  };

  const updateCalendarEvent = async (eventId: string, updates: any) => {
    if (!state.user) return;
    
    try {
      const { error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', eventId)
        .eq('user_id', state.user.id);
        
      if (error) throw error;
      
      // Update local state
      const updatedEvents = state.calendar.events.map(e =>
        e.id === eventId ? { ...e, ...updates } : e
      );
      
      dispatch({
        type: 'HYDRATE_STATE',
        payload: {
          calendar: {
            ...state.calendar,
            events: updatedEvents
          }
        }
      });
      
      return true;
    } catch (error) {
      console.error('Update calendar event error:', error);
      return false;
    }
  };

  const deleteCalendarEvent = async (eventId: string) => {
    if (!state.user) return;
    
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', state.user.id);
        
      if (error) throw error;
      
      // Update local state
      const filteredEvents = state.calendar.events.filter(e => e.id !== eventId);
      
      dispatch({
        type: 'HYDRATE_STATE',
        payload: {
          calendar: {
            ...state.calendar,
            events: filteredEvents
          }
        }
      });
      
      showToast(dispatch, 'Event deleted', 'info');
      return true;
    } catch (error) {
      console.error('Delete calendar event error:', error);
      showToast(dispatch, 'Failed to delete event', 'error');
      return false;
    }
  };

  return {
    saveDocument,
    saveHealthCheck,
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
  };
}