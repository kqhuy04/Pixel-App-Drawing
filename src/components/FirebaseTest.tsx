import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { auth, realtimeDb } from '../firebase/config';
import { ref, set, get } from 'firebase/database';

export const FirebaseTest: React.FC = () => {
  const [testResults, setTestResults] = useState<{
    auth: 'pending' | 'success' | 'error';
    database: 'pending' | 'success' | 'error';
    error?: string;
  }>({
    auth: 'pending',
    database: 'pending'
  });

  const testAuth = () => {
    try {
      const user = auth.currentUser;
      if (user) {
        setTestResults(prev => ({ ...prev, auth: 'success' }));
        return true;
      } else {
        setTestResults(prev => ({ ...prev, auth: 'error', error: 'No user logged in' }));
        return false;
      }
    } catch (error: any) {
      setTestResults(prev => ({ ...prev, auth: 'error', error: error.message }));
      return false;
    }
  };

  const testDatabase = async () => {
    try {
      const testRef = ref(realtimeDb, 'test');
      await set(testRef, { 
        message: 'Hello World', 
        timestamp: Date.now() 
      });
      
      const snapshot = await get(testRef);
      if (snapshot.exists()) {
        setTestResults(prev => ({ ...prev, database: 'success' }));
        return true;
      } else {
        setTestResults(prev => ({ ...prev, database: 'error', error: 'Data not saved' }));
        return false;
      }
    } catch (error: any) {
      setTestResults(prev => ({ 
        ...prev, 
        database: 'error', 
        error: `${error.code}: ${error.message}` 
      }));
      return false;
    }
  };

  const runAllTests = async () => {
    setTestResults({
      auth: 'pending',
      database: 'pending'
    });

    const authOk = testAuth();
    if (authOk) {
      await testDatabase();
    }
  };

  const getStatusBadge = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">⏳ Testing...</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-500">✅ Success</Badge>;
      case 'error':
        return <Badge variant="destructive">❌ Error</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>🔧 Firebase Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Authentication:</span>
            {getStatusBadge(testResults.auth)}
          </div>
          
          <div className="flex items-center justify-between">
            <span>Realtime Database:</span>
            {getStatusBadge(testResults.database)}
          </div>
        </div>

        {testResults.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
            <strong>Error:</strong> {testResults.error}
          </div>
        )}

        <div className="space-y-2">
          <Button onClick={runAllTests} className="w-full">
            🧪 Run All Tests
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={testAuth}
              className="flex-1"
            >
              Test Auth
            </Button>
            <Button 
              variant="outline" 
              onClick={testDatabase}
              className="flex-1"
            >
              Test DB
            </Button>
          </div>
        </div>

        <div className="text-xs text-gray-600 space-y-1">
          <p><strong>Current User:</strong> {auth.currentUser?.email || 'Not logged in'}</p>
          <p><strong>User ID:</strong> {auth.currentUser?.uid || 'N/A'}</p>
          <p><strong>Database URL:</strong> {realtimeDb.app.options.databaseURL || 'Not configured'}</p>
        </div>
      </CardContent>
    </Card>
  );
};
