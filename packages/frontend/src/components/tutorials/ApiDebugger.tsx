import { useEffect, useState } from 'react';
import api from '../../api/config';

export default function ApiDebugger() {
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testApi = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Making direct API call to tutorials endpoint');
        const result = await api.get('/api/tutorials');
        console.log('API Response:', result.data);
        
        setResponse(result.data);
      } catch (err: any) {
        console.error('API Error:', err);
        setError(err.message || 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    testApi();
  }, []);

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg my-4">
      <h2 className="text-xl font-bold mb-4">API Debugger</h2>
      
      {loading && <div>Loading...</div>}
      
      {error && (
        <div className="bg-red-900 p-3 rounded mb-4">
          <h3 className="font-bold">Error:</h3>
          <p>{error}</p>
        </div>
      )}
      
      {response && (
        <div>
          <h3 className="font-bold">Response:</h3>
          <div className="bg-gray-900 p-3 rounded overflow-auto max-h-60">
            <pre>{JSON.stringify(response, null, 2)}</pre>
          </div>
          <p className="mt-2">Total tutorials: {Array.isArray(response) ? response.length : 'Not an array'}</p>
        </div>
      )}
    </div>
  );
}