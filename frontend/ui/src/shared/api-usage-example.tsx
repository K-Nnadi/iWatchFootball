/**
 * Example usage of Orval-generated React Query hooks
 * 
 * This file demonstrates how to use the generated API client hooks in your components.
 * Delete this file once you're familiar with the pattern.
 */

// Example 1: Using a query hook (GET request)
/*
import { useHealthControllerCheck } from '@iWatchFootball/clients/queries/health/health';

function HealthCheckComponent() {
  const { data, isLoading, error } = useHealthControllerCheck();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>Health Status: OK</div>;
}
*/

// Example 2: Using a mutation hook (POST/PUT/DELETE request)
/*
import { useAuthControllerLogin } from '@iWatchFootball/clients/queries/auth/auth';
import type { LoginBody } from '@iWatchFootball/clients/queries/iWatchFootballAPI.schemas';

function LoginComponent() {
  const loginMutation = useAuthControllerLogin({
    mutation: {
      onSuccess: (data) => {
        console.log('Login successful:', data);
        // Handle successful login (e.g., save token, redirect)
      },
      onError: (error) => {
        console.error('Login failed:', error);
        // Handle error
      },
    },
  });

  const handleLogin = () => {
    const loginData: LoginBody = {
      email: 'user@example.com',
      password: 'password123',
    };
    loginMutation.mutate({ data: loginData });
  };

  return (
    <button onClick={handleLogin} disabled={loginMutation.isPending}>
      {loginMutation.isPending ? 'Logging in...' : 'Login'}
    </button>
  );
}
*/

// Example 3: Using query with parameters
/*
import { useFixtureControllerFindOne } from '@iWatchFootball/clients/queries/fixture/fixture';

function FixtureDetailsComponent({ fixtureId }: { fixtureId: number }) {
  const { data: fixture, isLoading, error } = useFixtureControllerFindOne(
    fixtureId,
    {
      query: {
        enabled: !!fixtureId, // Only fetch if fixtureId is provided
      },
    }
  );

  if (isLoading) return <div>Loading fixture...</div>;
  if (error) return <div>Error loading fixture</div>;
  if (!fixture) return <div>Fixture not found</div>;

  return <div>{fixture.name}</div>;
}
*/

// Example 4: Manual query key and options (for custom useQuery)
/*
import { 
  getHealthControllerCheckQueryKey,
  getHealthControllerCheckQueryOptions 
} from '@iWatchFootball/clients/queries/health/health';
import { useQuery } from '@tanstack/react-query';

function CustomHealthCheck() {
  const queryOptions = getHealthControllerCheckQueryOptions();
  const { data } = useQuery({
    ...queryOptions,
    // Add custom options here
    refetchInterval: 5000, // Poll every 5 seconds
  });

  return <div>Status: {data ? 'OK' : 'Unknown'}</div>;
}
*/

export {};

