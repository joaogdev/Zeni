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

};

export default SupabaseConnectionTest;