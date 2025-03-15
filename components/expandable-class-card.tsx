"use client"

import { useState, useRef, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { createPortal } from "react-dom"

interface ExpandableClassCardProps {
  title: string
  mode: string
  startTime: string
  endTime: string
  section?: {
    number: string
    index: string
  }
  building?: string
  room?: string
  campus?: string
  instructors?: string[]
  onRemove?: () => void
  className?: string
  colorClass?: string
}

export function ExpandableClassCard({
  title,
  mode,
  startTime,
  endTime,
  section,
  building,
  room,
  campus,
  instructors,
  onRemove,
  className = "",
  colorClass = "",
}: ExpandableClassCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const [expandedStyle, setExpandedStyle] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  })

  // Calculate expanded position
  useEffect(() => {
    if (!cardRef.current || !isExpanded) return

    const rect = cardRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Determine expansion direction
    const expandLeft = rect.left > viewportWidth / 2
    const expandUp = rect.top > viewportHeight / 2

    // Calculate expanded dimensions and position
    const expandedWidth = Math.min(300, viewportWidth - 40) // max width or viewport width - 40px padding
    const expandedHeight = 200 // fixed height for expanded state

    setExpandedStyle({
      top: expandUp ? rect.top - expandedHeight + rect.height : rect.top,
      left: expandLeft ? rect.left - expandedWidth + rect.width : rect.left,
      width: expandedWidth,
      height: expandedHeight,
    })
  }, [isExpanded])

  // Handle click outside to close
  useEffect(() => {
    if (!isExpanded) return

    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setIsExpanded(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isExpanded])

  return (
    <>
      <div
        ref={cardRef}
        className={`relative ${className} ${colorClass} transition-shadow duration-200 ${
          isExpanded ? "shadow-lg" : ""
        }`}
        onClick={() => setIsExpanded(true)}
      >
        {/* Base card content */}
        <div className="flex justify-between items-start">
          <div className="font-medium truncate">
            {title}
            <Badge variant="outline" className="ml-1 text-[0.6rem] px-1 py-0">
              {mode}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-3.5 w-3.5 p-0 opacity-0 group-hover:opacity-70 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation()
              onRemove?.()
            }}
          >
            <X className="h-2.5 w-2.5" />
          </Button>
        </div>

        <div className="text-[0.6rem] mt-0.5">
          {startTime} - {endTime}
        </div>

        {section && (
          <div className="text-[0.65rem] mt-0.5 font-medium">
            Section {section.number}
            {section.index && <span className="text-[0.6rem]"> (Index: {section.index})</span>}
          </div>
        )}

        {(building || room) && (
          <div className="text-[0.6rem]">
            {building} {room}
          </div>
        )}
      </div>

      {/* Expanded overlay */}
      {isExpanded &&
        createPortal(
          <div className="fixed inset-0 bg-black/20 z-50">
            <div
              className={`fixed bg-white rounded-lg shadow-xl overflow-hidden ${colorClass}`}
              style={{
                top: expandedStyle.top,
                left: expandedStyle.left,
                width: expandedStyle.width,
                height: expandedStyle.height,
                transition: "all 0.2s ease-out",
              }}
            >
              <div className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-sm">{title}</h3>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsExpanded(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      {mode}
                    </Badge>
                  </div>
                  <p>
                    <span className="font-medium">Time:</span> {startTime} - {endTime}
                  </p>
                  {section && (
                    <p>
                      <span className="font-medium">Section:</span> {section.number} (Index: {section.index})
                    </p>
                  )}
                  {(building || room) && (
                    <p>
                      <span className="font-medium">Location:</span> {building} {room}
                    </p>
                  )}
                  {campus && (
                    <p>
                      <span className="font-medium">Campus:</span> {campus}
                    </p>
                  )}
                  {instructors && instructors.length > 0 && (
                    <p>
                      <span className="font-medium">Instructor{instructors.length > 1 ? "s" : ""}:</span>{" "}
                      {instructors.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}

