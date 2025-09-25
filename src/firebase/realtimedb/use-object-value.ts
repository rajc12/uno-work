'use client';

import { useState, useEffect } from 'react';
import { ref, onValue, off, Query, DatabaseError } from 'firebase/database';
import { useDatabase } from '@/firebase/provider';

export interface UseObjectValueResult<T> {
  data: T | null;
  isLoading: boolean;
  error: DatabaseError | null;
}

export function useObjectValue<T = any>(query: Query | null | undefined): UseObjectValueResult<T> {
  const [data, setData] = useState<T | null>(null);
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
      setData(snapshot.val());
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
