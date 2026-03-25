import { useState, useEffect } from 'react';
import { studentApi } from '../lib/api';
import { Student } from '../lib/types';

export const useStudents = (filters?: { program?: string; status?: string; search?: string }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await studentApi.getStudents(filters);
        setStudents(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [filters?.program, filters?.status, filters?.search]);

  return { students, loading, error };
};
