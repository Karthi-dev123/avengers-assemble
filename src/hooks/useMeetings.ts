import { useState, useEffect } from 'react';
import { meetingApi } from '../lib/api';
import { Meeting } from '../lib/types';

export const useMeetings = (filters?: { student_id?: string; status?: string }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        const data = await meetingApi.getMeetings(filters);
        setMeetings(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch meetings');
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [filters?.student_id, filters?.status]);

  return { meetings, loading, error };
};
