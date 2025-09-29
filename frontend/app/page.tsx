'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database, MessageSquare, Settings, Zap, Brain, Shield } from 'lucide-react'
import ChatInterface from './components/ChatInterface'
import ConnectionModal from './components/ConnectionModal'
import SchemaViewer from './components/SchemaViewer'
import SchemaSidebar from './components/SchemaSidebar'
import StatusIndicator from './components/StatusIndicator'
import { useConnection } from './hooks/useConnection'
import { useChat } from './hooks/useChat'

export default function Home() {
  const [showConnectionModal, setShowConnectionModal] = useState(false)
  const [showSchema, setShowSchema] = useState(false)
  const { connectionStatus, schema, connect, disconnect, getStatus } = useConnection()
  const { messages, sendMessage, isLoading } = useChat()

  // Periodically check connection status
  useEffect(() => {
    const interval = setInterval(() => {
      getStatus()
    }, 30000) // Check every 30 seconds to reduce API load

    return () => clearInterval(interval)
  }, [getStatus])

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered',
      description: 'Advanced natural language processing for accurate SQL generation'
    },
    {
      icon: Database,
      title: 'Multi-Database',
      description: 'Support for SQLite, MySQL, PostgreSQL, and SQL Server'
    },
    {
      icon: Shield,
      title: 'Secure',
      description: 'Safe query execution with built-in validation and error handling'
    },
    {
      icon: Zap,
      title: 'Fast',
      description: 'Lightning-fast responses with optimized database connections'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <motion.header 
        className="glass-effect border-b border-white/20"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">SQL Agent</h1>
                <p className="text-sm text-gray-600">Natural Language to SQL</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <StatusIndicator 
                status={connectionStatus} 
                onConnect={() => setShowConnectionModal(true)}
                onDisconnect={disconnect}
                onViewSchema={() => setShowSchema(true)}
                onRefresh={getStatus}
              />
              <motion.button
                onClick={() => setShowConnectionModal(true)}
                className="btn-primary flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className="w-4 h-4" />
                <span>Connect DB</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!connectionStatus.connected ? (
          /* Welcome Screen */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center"
          >
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-8"
              >
                <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Transform Questions into
                  <span className="gradient-text"> SQL Queries</span>
                </h2>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                  Connect your database and start asking questions in natural language. 
                  Our AI will generate accurate SQL queries and provide insights.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                    className="card hover:shadow-xl transition-all duration-300"
                  >
                    <feature.icon className="w-8 h-8 text-primary-600 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>

              <motion.button
                onClick={() => setShowConnectionModal(true)}
                className="btn-primary text-lg px-8 py-4 rounded-xl shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                Get Started - Connect Database
              </motion.button>
            </div>
          </motion.div>
        ) : (
          /* Chat Interface with Schema Sidebar */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto"
          >
            <div className="flex gap-6 h-[calc(100vh-200px)]">
              {/* Schema Sidebar */}
              <div className="w-80 flex-shrink-0">
                <SchemaSidebar schema={schema} />
              </div>
              
              {/* Chat Interface */}
              <div className="flex-1">
                <ChatInterface
                  messages={messages}
                  onSendMessage={sendMessage}
                  isLoading={isLoading}
                  schema={schema}
                />
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Connection Modal */}
      <AnimatePresence>
        {showConnectionModal && (
          <ConnectionModal
            onClose={() => {
              setShowConnectionModal(false)
              // Refresh connection status after modal closes
              setTimeout(() => {
                getStatus()
              }, 500)
            }}
            onConnect={connect}
          />
        )}
      </AnimatePresence>

      {/* Schema Viewer Modal */}
      <AnimatePresence>
        {showSchema && schema && (
          <SchemaViewer
            schema={schema}
            onClose={() => setShowSchema(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
