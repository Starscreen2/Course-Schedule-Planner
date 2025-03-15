"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface StandaloneSectionSelectorProps {
  sections: any[]
  onSectionSelect: (section: any) => void
  className?: string
}

export function StandaloneSectionSelector({
  sections,
  onSectionSelect,
  className = "",
}: StandaloneSectionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedSection, setSelectedSection] = useState<any>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  if (!sections || sections.length === 0) {
    return <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded border">No sections available</div>
  }

  const toggleDropdown = () => {
    console.log("Toggling dropdown, current state:", isOpen)
    setIsOpen(!isOpen)
  }

  const handleSectionSelect = (section: any) => {
    setSelectedSection(section)
    onSectionSelect(section)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        className="w-full justify-between border-[#CC0033] text-gray-700"
        onClick={toggleDropdown}
      >
        {selectedSection ? `Section ${selectedSection.number}` : "Select a section"}
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {isOpen && (
        <div
          className="fixed z-50 bg-white border rounded-md shadow-lg max-h-60 overflow-auto"
          style={{
            top: `${triggerRef.current ? triggerRef.current.getBoundingClientRect().bottom + window.scrollY : 0}px`,
            left: `${triggerRef.current ? triggerRef.current.getBoundingClientRect().left + window.scrollX : 0}px`,
            width: `${triggerRef.current ? triggerRef.current.offsetWidth : 300}px`,
          }}
        >
          {sections.map((section) => (
            <div
              key={section.index}
              className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
              onClick={() => handleSectionSelect(section)}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">Section {section.number}</span>
                <Badge
                  variant={section.status?.toLowerCase().includes("open") ? "outline" : "destructive"}
                  className={
                    section.status?.toLowerCase().includes("open") ? "bg-green-100 text-green-800 border-green-200" : ""
                  }
                >
                  {section.status || "Unknown"}
                </Badge>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                <div>Index: {section.index}</div>
                <div>Instructor: {Array.isArray(section.instructors) ? section.instructors.join(", ") : "TBA"}</div>
                {section.meetingTimes && section.meetingTimes.length > 0 && (
                  <div className="mt-1">
                    {section.meetingTimes.map((time, idx) => (
                      <div key={idx} className="mt-0.5">
                        <div>
                          {time.day} {time.startTime?.formatted} - {time.endTime?.formatted}
                        </div>
                        <div className="text-gray-400">
                          {time.building} {time.room}, {time.campus}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

