import api from './api';

// Service for handling teacher schedule-related API calls
export const slotsService = {
  // Get all schedules for the current teacher
  getSchedules: () => api.get('/api/v1/teacher_schedules'),
  
  // Get a specific schedule by ID
  getScheduleById: (scheduleId) => api.get(`/api/v1/teacher_schedules/${scheduleId}`),
  
  // Create a new schedule - correctly handling both single and batch scenarios
  createSchedule: (teacherId, formattedData) => {
    console.log('Sending schedule data to API:', formattedData);
    return api.post(`/api/v1/teachers/${teacherId}/teacher_schedules/import_schedule`, formattedData);
  },
  
  // Update an existing schedule
  updateSchedule: (scheduleId, scheduleData) => 
    api.put(`/api/v1/teacher_schedules/${scheduleId}`, { 
      teacher_schedule: scheduleData 
    }),
  
  // Delete a schedule
  deleteSchedule: (scheduleId) => api.delete(`/api/v1/teacher_schedules/${scheduleId}`)
};

export default slotsService;