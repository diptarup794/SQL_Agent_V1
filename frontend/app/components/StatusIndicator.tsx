'use client'

import { motion } from 'framer-motion'
import { Database, CheckCircle, XCircle, Eye, RefreshCw } from 'lucide-react'

interface ConnectionStatus {
  connected: boolean
  dbType?: string
  connectedAt?: string
  schema?: any
  filename?: string
  connection_id?: string
}

interface StatusIndicatorProps {
  status: ConnectionStatus
  onConnect: () => void
  onDisconnect: () => void
  onViewSchema: () => void
  onRefresh?: () => void
}

export default function StatusIndicator({ 
  status, 
  onConnect, 
  onDisconnect, 
  onViewSchema,
  onRefresh
}: StatusIndicatorProps) {
  return (
    <div className="flex items-center space-x-3">
      {status.connected ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center space-x-2"
        >
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full status-connected">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">
              {status.dbType?.toUpperCase()} Connected
            </span>
            {status.filename && (
              <span className="text-xs text-gray-600 ml-2">
                ({status.filename})
              </span>
            )}
          </div>
          
          <motion.button
            onClick={onViewSchema}
            className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="View Schema"
          >
            <Eye className="w-4 h-4" />
          </motion.button>
          
          {onRefresh && (
            <motion.button
              onClick={onRefresh}
              className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Refresh Status"
            >
              <RefreshCw className="w-4 h-4" />
            </motion.button>
          )}
          
          <motion.button
            onClick={onDisconnect}
            className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Disconnect
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-full status-disconnected"
        >
          <XCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Not Connected</span>
        </motion.div>
      )}
    </div>
  )
}
