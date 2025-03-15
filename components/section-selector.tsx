"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Section {
  number: string
  index: string
  instructors: string[]
  status: string
  meetingTimes: Array<{
    day: string
    startTime: { formatted: string }
    endTime: { formatted: string }
    building: string
    room: string
    campus: string
  }>
}

interface SectionSelectorProps {
  sections: Section[]
  onSectionSelect: (sectionIndex: string) => void
  selectedSection?: string
}

export function SectionSelector({ sections, onSectionSelect, selectedSection }: SectionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!sections || sections.length === 0) {
    return <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded border">No sections available</div>
  }

  // Let's use DropdownMenu instead of Select for better control
  return (
    <div className="relative">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between border-[#CC0033] text-gray-700"
            onClick={() => console.log("Dropdown clicked, sections:", sections.length)}
          >
            {selectedSection
              ? `Section ${sections.find((s) => s.index === selectedSection)?.number || selectedSection}`
              : "Select a section"}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[300px] max-h-[400px] overflow-y-auto z-50">
          {sections.map((section) => (
            <DropdownMenuItem
              key={section.index}
              className="py-2 px-3 cursor-pointer"
              onSelect={() => {
                console.log("Selected section:", section.index)
                onSectionSelect(section.index)
                setIsOpen(false)
              }}
            >
              <div className="flex flex-col w-full">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Section {section.number}</span>
                  <Badge
                    variant={section.status.toLowerCase().includes("open") ? "outline" : "destructive"}
                    className={
                      section.status.toLowerCase().includes("open")
                        ? "bg-green-100 text-green-800 border-green-200"
                        : ""
                    }
                  >
                    {section.status}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  <div>Index: {section.index}</div>
                  <div>Instructor: {section.instructors?.join(", ") || "TBA"}</div>
                  {section.meetingTimes?.map((time, idx) => (
                    <div key={idx} className="mt-1">
                      <div className="font-medium">{time.day}</div>
                      <div className="ml-4 flex items-center text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {time.startTime.formatted} - {time.endTime.formatted}
                      </div>
                      <div className="ml-4 flex items-center text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        {time.building} {time.room}, {time.campus}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

