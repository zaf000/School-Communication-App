import { Redirect } from 'expo-router';
import { useAuth } from '@/lib/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;
  if (session) return <Redirect href="/(app)/(tabs)/" />;
  return <Redirect href="/(auth)/login" />;
}
