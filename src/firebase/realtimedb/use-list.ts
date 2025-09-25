'use client';

import { useState, useEffect } from 'react';
import { ref, onValue, off, Query, DatabaseError } from 'firebase/database';
import { useDatabase } from '@/firebase/provider';

export interface UseListResult<T> {
  data: T[] | null;
  isLoading: boolean;
  error: DatabaseError | null;
}

export function useList<T = any>(query: Query | null | undefined): UseListResult<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<DatabaseError | null>(null);
  const db = useDatabase();

  useEffect(() => {
    if (!query || !db) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const handleValue = (snapshot: any) => {
      const val = snapshot.val();
      if (val) {
        const list = Object.keys(val).map(key => ({ ...val[key], id: key }));
        setData(list);
      } else {
        setData([]);
      }
      setIsLoading(false);
    };

    const handleError = (err: DatabaseError) => {
      console.error(err);
      setError(err);
      setIsLoading(false);
    };

    onValue(query, handleValue, handleError);

    return () => {
      off(query, 'value', handleValue);
    };
  }, [query, db]);

  return { data, isLoading, error };
}
