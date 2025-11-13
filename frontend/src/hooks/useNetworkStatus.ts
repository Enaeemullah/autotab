import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setOffline } from '../store/slices/authSlice';

export function useNetworkStatus() {
  const dispatch = useAppDispatch();
  const isOffline = useAppSelector((state) => state.auth.isOffline);

  useEffect(() => {
    const handleOnline = () => dispatch(setOffline(false));
    const handleOffline = () => dispatch(setOffline(true));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    dispatch(setOffline(!navigator.onLine));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch]);

  return { isOffline };
}
