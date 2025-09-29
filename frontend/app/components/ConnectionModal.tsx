'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Database, Upload, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { useConnection } from '../hooks/useConnection'

interface ConnectionModalProps {
  onClose: () => void
  onConnect: (data: any) => void
}

interface DbType {
  name: string
  description: string
  fields: string[]
}

const DB_TYPES: Record<string, DbType> = {
  sqlite: {
    name: 'SQLite',
    description: 'Local file database',
    fields: ['file_path']
  },
  mysql: {
    name: 'MySQL',
    description: 'MySQL database server',
    fields: ['host', 'port', 'username', 'password', 'database']
  },
  postgresql: {
    name: 'PostgreSQL',
    description: 'PostgreSQL database server',
    fields: ['host', 'port', 'username', 'password', 'database']
  },
  mssql: {
    name: 'SQL Server',
    description: 'Microsoft SQL Server',
    fields: ['host', 'port', 'username', 'password', 'database']
  }
}

export default function ConnectionModal({ onClose, onConnect }: ConnectionModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'connect'>('upload')
  const [selectedDbType, setSelectedDbType] = useState<string>('sqlite')
  const [connectionData, setConnectionData] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({})
  const [isConnecting, setIsConnecting] = useState(false)
  
  const { connect, uploadDatabase, getStatus } = useConnection()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setIsConnecting(true)
      const success = await uploadDatabase(file)
      setIsConnecting(false)
      if (success) {
        // Force refresh status and close modal
        await getStatus()
        onClose()
      }
    }
  }, [uploadDatabase, onClose])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/x-sqlite3': ['.db'],
      'application/vnd.sqlite3': ['.db']
    },
    multiple: false
  })

  const handleInputChange = (field: string, value: string) => {
    setConnectionData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleConnect = async () => {
    if (selectedDbType === 'sqlite') {
      toast.error('Please use the upload tab for SQLite files')
      return
    }

    const requiredFields = DB_TYPES[selectedDbType].fields
    const missingFields = requiredFields.filter(field => !connectionData[field])
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(', ')}`)
      return
    }

    setIsConnecting(true)
    const success = await connect({
      db_type: selectedDbType,
      connection_data: connectionData
    })
    setIsConnecting(false)
    
    if (success) {
      // Force refresh status and close modal
      await getStatus()
      onClose()
    }
  }

  const togglePasswordVisibility = (field: string) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <Database className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Connect Database</h2>
                <p className="text-sm text-gray-600">Choose your connection method</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Upload File</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('connect')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'connect'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Database className="w-4 h-4" />
                <span>Connect Server</span>
              </div>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'upload' ? (
              <div>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    isDragActive
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                      <Upload className="w-8 h-8 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        {isDragActive ? 'Drop your database file here' : 'Upload SQLite Database'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Drag and drop your .db file, or click to browse
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">
                      Supported: .db files (SQLite)
                    </div>
                  </div>
                </div>
                
                {isConnecting && (
                  <div className="mt-4 flex items-center justify-center space-x-2 text-primary-600">
                    <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Connecting...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Database Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Database Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(DB_TYPES).filter(([key]) => key !== 'sqlite').map(([key, dbType]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedDbType(key)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          selectedDbType === key
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{dbType.name}</div>
                        <div className="text-xs text-gray-600 mt-1">{dbType.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Connection Fields */}
                <div className="space-y-4">
                  {DB_TYPES[selectedDbType].fields.map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                      <div className="relative">
                        <input
                          type={field.includes('password') && !showPassword[field] ? 'password' : 'text'}
                          value={connectionData[field] || ''}
                          onChange={(e) => handleInputChange(field, e.target.value)}
                          className="input-field pr-10"
                          placeholder={`Enter ${field.replace('_', ' ')}`}
                        />
                        {field.includes('password') && (
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(field)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword[field] ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Connect Button */}
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Connect</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
