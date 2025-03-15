"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Section {
  number: string
  index: string
  instructors: string[]
  status: string
  meetingTimes: any[]
}

interface BasicSectionSelectorProps {
  sections: Section[]
  onSectionSelect: (sectionIndex: string) => void
  selectedSection?: string
}

export function BasicSectionSelector({ sections, onSectionSelect, selectedSection }: BasicSectionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Find the selected section object
  const selectedSectionObj = selectedSection ? sections.find((s) => s.index === selectedSection) : null

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  if (!sections || sections.length === 0) {
    return <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded border">No sections available</div>
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <div
        className={`flex justify-between items-center p-2 border rounded cursor-pointer ${
          isOpen ? "border-[#CC0033]" : "border-gray-300"
        } hover:border-[#CC0033]`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-gray-700">
          {selectedSectionObj
            ? `Section ${selectedSectionObj.number} (Index: ${selectedSectionObj.index})`
            : "Select a section"}
        </span>
        {isOpen ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto"
          style={{
            position: "fixed",
            top: dropdownRef.current ? dropdownRef.current.getBoundingClientRect().bottom + window.scrollY : 0,
            left: dropdownRef.current ? dropdownRef.current.getBoundingClientRect().left + window.scrollX : 0,
            width: dropdownRef.current ? dropdownRef.current.offsetWidth : "auto",
            maxHeight: "300px",
          }}
        >
          {sections.map((section) => (
            <div
              key={section.index}
              className={`p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 ${
                selectedSection === section.index ? "bg-blue-50" : ""
              }`}
              onClick={() => {
                onSectionSelect(section.index)
                setIsOpen(false)
              }}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">Section {section.number}</span>
                <Badge
                  variant={section.status.toLowerCase().includes("open") ? "outline" : "destructive"}
                  className={
                    section.status.toLowerCase().includes("open") ? "bg-green-100 text-green-800 border-green-200" : ""
                  }
                >
                  {section.status}
                </Badge>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                <div>Index: {section.index}</div>
                <div>Instructor: {section.instructors?.join(", ") || "TBA"}</div>
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

