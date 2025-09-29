'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Database, Table, Key, Type } from 'lucide-react'

interface SchemaViewerProps {
  schema: {
    tables: Array<{
      name: string
      columns: Array<{
        name: string
        type: string
        nullable: boolean
        primary_key: boolean
      }>
    }>
    connection_string: string
  }
  onClose: () => void
}

export default function SchemaViewer({ schema, onClose }: SchemaViewerProps) {
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <Database className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Database Schema</h2>
                <p className="text-sm text-gray-600">{schema.connection_string}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="space-y-6">
              {schema.tables.map((table, tableIndex) => (
                <motion.div
                  key={table.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: tableIndex * 0.1 }}
                  className="card"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Table className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{table.name}</h3>
                    <span className="text-sm text-gray-500">
                      {table.columns.length} columns
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Column</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Type</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Constraints</th>
                        </tr>
                      </thead>
                      <tbody>
                        {table.columns.map((column, columnIndex) => (
                          <motion.tr
                            key={column.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (tableIndex * 0.1) + (columnIndex * 0.05) }}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="py-2 px-3">
                              <div className="flex items-center space-x-2">
                                {column.primary_key && (
                                  <Key className="w-3 h-3 text-yellow-600" />
                                )}
                                <span className="font-medium text-gray-900">
                                  {column.name}
                                </span>
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex items-center space-x-2">
                                <Type className="w-3 h-3 text-blue-600" />
                                <span className="text-gray-700">{column.type}</span>
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex space-x-2">
                                {column.primary_key && (
                                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                    Primary Key
                                  </span>
                                )}
                                {!column.nullable && (
                                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                    Not Null
                                  </span>
                                )}
                                {column.nullable && !column.primary_key && (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                    Nullable
                                  </span>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
