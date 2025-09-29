import { useState, useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'

interface ConnectionStatus {
  connected: boolean
  dbType?: string
  connectedAt?: string
  schema?: any
  filename?: string
  connection_id?: string
}

interface ConnectionData {
  db_type: string
  connection_data: Record<string, string>
}

export const useConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false
  })

  const getStatus = useCallback(async () => {
    try {
      const response = await axios.get('/api/status')
      if (response.data.connected) {
        setConnectionStatus({
          connected: true,
          dbType: response.data.db_type,
          connectedAt: response.data.connected_at,
          schema: response.data.schema,
          filename: response.data.filename,
          connection_id: response.data.connection_id
        })
      } else {
        setConnectionStatus({ connected: false })
      }
    } catch (error) {
      console.error('Failed to get connection status:', error)
    }
  }, [])

  // Check connection status on mount
  useEffect(() => {
    getStatus()
  }, [getStatus])

  const connect = useCallback(async (connectionData: ConnectionData | FormData) => {
    try {
      const response = await axios.post('/api/connect', connectionData, {
        headers: {
          'Content-Type': connectionData instanceof FormData 
            ? 'multipart/form-data' 
            : 'application/json'
        }
      })

      if (response.data.success) {
        setConnectionStatus({
          connected: true,
          dbType: response.data.schema.connection_string.split('://')[0],
          connectedAt: new Date().toISOString(),
          schema: response.data.schema
        })
        toast.success(response.data.message)
        return true
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Connection failed'
      toast.error(message)
      return false
    }
  }, [])

  const uploadDatabase = useCallback(async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post('/api/upload-db', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        setConnectionStatus({
          connected: true,
          dbType: 'sqlite',
          connectedAt: new Date().toISOString(),
          schema: response.data.schema,
          filename: response.data.filename,
          connection_id: response.data.connection_id
        })
        toast.success(response.data.message)
        return true
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Upload failed'
      toast.error(message)
      return false
    }
  }, [])

  const disconnect = useCallback(async () => {
    try {
      await axios.post('/api/disconnect')
      setConnectionStatus({ connected: false })
      toast.success('Disconnected successfully')
    } catch (error: any) {
      const message = error.response?.data?.error || 'Disconnect failed'
      toast.error(message)
    }
  }, [])

  return {
    connectionStatus,
    connect,
    uploadDatabase,
    disconnect,
    getStatus,
    schema: connectionStatus.schema
  }
}
