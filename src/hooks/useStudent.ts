import { useState, useEffect } from 'react';
import { studentApi } from '../lib/api';
import { Student, TimelineEntry, Forecast } from '../lib/types';

export const useStudent = (id?: string) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [loading, setLoading] = useState(!id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [studentData, timelineData, forecastData] = await Promise.all([
          studentApi.getStudent(id),
          studentApi.getTimeline(id),
          studentApi.getForecast(id),
        ]);
        setStudent(studentData);
        setTimeline(timelineData);
        setForecast(forecastData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch student data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const refreshForecast = async () => {
    if (!id) return;
    try {
      const newForecast = await studentApi.refreshForecast(id);
      setForecast(newForecast);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh forecast');
    }
  };

  return { student, timeline, forecast, loading, error, refreshForecast };
};
