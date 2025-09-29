'use client'

import { motion } from 'framer-motion'
import { Database, Table, Key, Type, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface SchemaSidebarProps {
  schema?: {
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
}

export default function SchemaSidebar({ schema }: SchemaSidebarProps) {
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set())
  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(new Set())

  const toggleTable = (tableName: string) => {
    const newExpanded = new Set(expandedTables)
    if (newExpanded.has(tableName)) {
      newExpanded.delete(tableName)
    } else {
      newExpanded.add(tableName)
    }
    setExpandedTables(newExpanded)
  }

  const toggleColumns = (tableName: string) => {
    const newExpanded = new Set(expandedColumns)
    if (newExpanded.has(tableName)) {
      newExpanded.delete(tableName)
    } else {
      newExpanded.add(tableName)
    }
    setExpandedColumns(newExpanded)
  }

  if (!schema) {
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Database className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-700">Database Schema</h3>
        </div>
        <p className="text-gray-500 text-sm">No database connected</p>
      </div>
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-4 h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-gray-200">
        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
          <Database className="w-4 h-4 text-primary-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">Database Schema</h3>
          <p className="text-xs text-gray-500">{schema.connection_string}</p>
        </div>
      </div>

      {/* Tables */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-2">
          {schema.tables.map((table, tableIndex) => {
            const isTableExpanded = expandedTables.has(table.name)
            const isColumnsExpanded = expandedColumns.has(table.name)
            
            return (
              <motion.div
                key={table.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: tableIndex * 0.1 }}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Table Header */}
                <button
                  onClick={() => toggleTable(table.name)}
                  className="w-full p-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="flex items-center space-x-2">
                    {isTableExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                    <Table className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-gray-900">{table.name}</span>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                      {table.columns.length}
                    </span>
                  </div>
                </button>

                {/* Table Details */}
                {isTableExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="border-t border-gray-200"
                  >
                    {/* Columns Header */}
                    <button
                      onClick={() => toggleColumns(table.name)}
                      className="w-full p-2 bg-white hover:bg-gray-50 transition-colors text-left border-b border-gray-100"
                    >
                      <div className="flex items-center space-x-2">
                        {isColumnsExpanded ? (
                          <ChevronDown className="w-3 h-3 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-gray-500" />
                        )}
                        <span className="text-sm font-medium text-gray-700">Columns</span>
                      </div>
                    </button>

                    {/* Columns List */}
                    {isColumnsExpanded && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="max-h-60 overflow-y-auto"
                      >
                        {table.columns.map((column, columnIndex) => (
                          <motion.div
                            key={column.name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: columnIndex * 0.05 }}
                            className="p-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                          >
                            <div className="flex items-center space-x-2">
                              {column.primary_key && (
                                <Key className="w-3 h-3 text-yellow-600" />
                              )}
                              <Type className="w-3 h-3 text-blue-600" />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-900">
                                    {column.name}
                                  </span>
                                  {!column.nullable && (
                                    <span className="text-xs text-red-600 bg-red-100 px-1 py-0.5 rounded">
                                      NOT NULL
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  {column.type}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-gray-200 mt-4">
        <div className="text-xs text-gray-500 text-center">
          {schema.tables.length} tables • {schema.tables.reduce((acc, table) => acc + table.columns.length, 0)} columns
        </div>
      </div>
    </div>
  )
}
