import { useState, useEffect } from 'react'
import { 
  getUserPreferences, 
  setUserPreference, 
  getUserProfile, 
  updateUserProfile,
  getUserTeaRecords,
  addTeaRecord,
  updateTeaRecord,
  deleteTeaRecord
} from '../lib/user-data-sync'
import { getCurrentUserIdClient } from '@/lib/supabase'

export interface UserDataSyncHook {
  // User preferences
  getUserPreferences: (userId: string) => Promise<any>
  setUserPreference: (userId: string, key: string, value: any) => Promise<{success: boolean; error?: string}>
  
  // User profile
  getUserProfile: (userId: string) => Promise<any>
  updateUserProfile: (userId: string, updates: any) => Promise<{success: boolean; data?: any; error?: string}>
  
  // Tea records
  getTeaRecords: (userId: string) => Promise<any>
  addTeaRecord: (record: any) => Promise<any>
  updateTeaRecord: (recordId: string, userId: string, updates: any) => Promise<any>
  deleteTeaRecord: (recordId: string, userId: string) => Promise<any>
  
  // Sync status
  isSyncing: boolean
  lastSyncTime: Date | null
}

export function useUserDataSync(): UserDataSyncHook {
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  const handleSync = async <T>(operation: () => Promise<T>): Promise<T> => {
    setIsSyncing(true)
    try {
      const result = await operation()
      setLastSyncTime(new Date())
      return result
    } finally {
      setIsSyncing(false)
    }
  }

  return {
    // User preferences
    getUserPreferences: (userId: string) => handleSync(() => getUserPreferences(userId)),
    setUserPreference: (userId: string, key: string, value: any) => 
      handleSync(() => setUserPreference(userId, key, value)),
    
    // User profile
    getUserProfile: (userId: string) => handleSync(() => getUserProfile(userId)),
    updateUserProfile: (userId: string, updates: any) => 
      handleSync(() => updateUserProfile(userId, updates)),
    
    // Tea records
    getTeaRecords: (userId: string) => handleSync(() => getUserTeaRecords(userId)),
    addTeaRecord: (record: any) => handleSync(() => addTeaRecord(record)),
    updateTeaRecord: (recordId: string, userId: string, updates: any) => 
      handleSync(() => updateTeaRecord(recordId, userId, updates)),
    deleteTeaRecord: (recordId: string, userId: string) => 
      handleSync(() => deleteTeaRecord(recordId, userId)),
    
    // Sync status
    isSyncing,
    lastSyncTime
  }
}

export default useUserDataSync