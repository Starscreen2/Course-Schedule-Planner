"use client"

import { useState } from "react"
import { HelpCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function SearchHelper() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-500 hover:text-gray-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        <HelpCircle className="h-4 w-4 mr-1" />
        Search Tips
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 z-50 w-80 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm">Search Tips</CardTitle>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription className="text-xs">How to search effectively</CardDescription>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div>
              <p className="font-medium">Search by course code:</p>
              <p className="text-gray-600">01:198:111 or 198:111</p>
            </div>
            <div>
              <p className="font-medium">Search by department and number:</p>
              <p className="text-gray-600">CS 111 or MATH 152</p>
            </div>
            <div>
              <p className="font-medium">Search by course number only:</p>
              <p className="text-gray-600">111 or 152</p>
            </div>
            <div>
              <p className="font-medium">Search by keywords:</p>
              <p className="text-gray-600">calculus, programming, etc.</p>
            </div>
            <div className="pt-1 text-gray-500 italic">
              Tip: For most accurate results, use department abbreviation and course number (e.g., CS 111)
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

