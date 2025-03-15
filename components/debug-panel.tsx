"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Bug, ChevronDown, ChevronUp } from "lucide-react"

interface DebugPanelProps {
  apiUrl?: string
  requestParams?: Record<string, string>
  responseData?: any
  error?: string | null
}

export function DebugPanel({ apiUrl, requestParams, responseData, error }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!apiUrl && !error) return null

  return (
    <Card className="mb-4 border-amber-300 bg-amber-50">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium flex items-center text-amber-800">
            <Bug className="h-4 w-4 mr-2" />
            Debug Information
          </CardTitle>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="pt-0 text-xs">
          {error && (
            <div className="mb-2 p-2 bg-red-100 text-red-800 rounded flex items-start">
              <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold">Error:</p>
                <p className="whitespace-pre-wrap">{error}</p>
              </div>
            </div>
          )}

          {apiUrl && (
            <div className="mb-2">
              <p className="font-bold">API URL:</p>
              <p className="break-all">{apiUrl}</p>
            </div>
          )}

          {requestParams && Object.keys(requestParams).length > 0 && (
            <div className="mb-2">
              <p className="font-bold">Request Parameters:</p>
              <pre className="bg-gray-100 p-1 rounded overflow-x-auto">{JSON.stringify(requestParams, null, 2)}</pre>
            </div>
          )}

          {apiUrl && (
            <div className="mb-2">
              <p className="font-bold">Term Parameter:</p>
              <p className="break-all">{requestParams?.term || "Not set"} (0=Winter, 1=Spring, 7=Summer, 9=Fall)</p>
            </div>
          )}

          {responseData && (
            <div>
              <p className="font-bold">Response Data Sample:</p>
              <div className="bg-gray-100 p-1 rounded overflow-x-auto max-h-40">
                <pre>
                  {JSON.stringify(Array.isArray(responseData) ? responseData.slice(0, 1) : responseData, null, 2)}
                </pre>
              </div>
              {Array.isArray(responseData) && <p className="mt-1">Total items: {responseData.length}</p>}
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => {
              console.log("Debug data:", { apiUrl, requestParams, responseData, error })
            }}
          >
            Log to Console
          </Button>
        </CardContent>
      )}
    </Card>
  )
}

