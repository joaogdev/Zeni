import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

const SupabaseConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('Testing...');
  const [error, setError] = useState(null);

  useEffect(() => {
    testSupabaseConnection();
  }, []);

  const testSupabaseConnection = async () => {
    try {
      // Test basic connection by trying to fetch from a table
      // This will fail if tables don't exist, but will confirm connection works
      const { data, error } = await supabase
        .from('status_checks')
        .select('*')
        .limit(1);

      if (error) {
        if (error.message.includes('relation "public.status_checks" does not exist')) {
          setConnectionStatus('✅ Connected to Supabase! Tables need to be created.');
          setError('Tables not found - this is expected. Please create tables using the SQL schema.');
        } else {
          setConnectionStatus('❌ Connection Error');
          setError(error.message);
        }
      } else {
        setConnectionStatus('✅ Fully connected and tables exist!');
        setError(null);
      }
    } catch (err) {
      setConnectionStatus('❌ Connection Failed');
      setError(err.message);
    }
  };

  const testInsert = async () => {
    try {
      const { data, error } = await supabase
        .from('status_checks')
        .insert([
          { client_name: 'Frontend Test Connection' }
        ]);

      if (error) {
        alert(`Insert failed: ${error.message}`);
      } else {
        alert('✅ Successfully inserted test data!');
        testSupabaseConnection(); // Refresh status
      }
    } catch (err) {
      alert(`Insert error: ${err.message}`);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #ccc', 
      borderRadius: '8px', 
      margin: '20px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>🔗 Supabase Connection Test</h3>
      <p><strong>Status:</strong> {connectionStatus}</p>
      {error && (
        <div style={{ 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffeaa7', 
          padding: '10px', 
          borderRadius: '4px',
          marginTop: '10px'
        }}>
          <strong>Details:</strong> {error}
        </div>
      )}
      
      <div style={{ marginTop: '15px' }}>
        <button 
          onClick={testSupabaseConnection}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          🔄 Test Connection
        </button>
        
        <button 
          onClick={testInsert}
          style={{
            backgroundColor: '#2196F3',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🧪 Test Insert
        </button>
      </div>
      
      <div style={{ 
        marginTop: '15px', 
        fontSize: '14px', 
        color: '#666'
      }}>
        <p><strong>Next Steps:</strong></p>
        <ol>
          <li>Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">Supabase Dashboard</a></li>
          <li>Navigate to SQL Editor</li>
          <li>Run the SQL schema from <code>/app/supabase_schema.sql</code></li>
          <li>Test the insert button above</li>
        </ol>
      </div>
    </div>
  );
};

export default SupabaseConnectionTest;