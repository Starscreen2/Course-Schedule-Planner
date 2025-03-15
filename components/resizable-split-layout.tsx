"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useSchedule } from "@/context/schedule-context"
import { Button } from "@/components/ui/button"
import { Calendar, X, GripVertical } from "lucide-react"
import WeeklyCalendar from "./weekly-calendar"
import { useMediaQuery } from "@/hooks/use-media-query"

interface ResizableSplitLayoutProps {
  children: React.ReactNode
}

export function ResizableSplitLayout({ children }: ResizableSplitLayoutProps) {
  const { scheduledClasses, removeFromSchedule } = useSchedule()
  const [isScheduleVisible, setIsScheduleVisible] = useState(false)
  const [splitPosition, setSplitPosition] = useState(50) // percentage
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const containerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)

  // Handle resize drag
  useEffect(() => {
    if (!isDesktop || !isScheduleVisible) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100

      // Limit resize range (20% - 80%)
      const limitedPosition = Math.min(Math.max(newPosition, 20), 80)
      setSplitPosition(limitedPosition)
    }

    const handleMouseUp = () => {
      isDraggingRef.current = false
      document.body.style.cursor = "default"
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDesktop, isScheduleVisible])

  const startResize = () => {
    isDraggingRef.current = true
    document.body.style.cursor = "col-resize"
  }

  return (
    <div className="min-h-screen bg-gray-50 relative" ref={containerRef}>
      {/* Toggle button */}
      <Button
        onClick={() => setIsScheduleVisible(!isScheduleVisible)}
        className="fixed z-30 bottom-6 right-6 shadow-lg bg-[#CC0033] hover:bg-[#A30029]"
        size="icon"
        aria-label={isScheduleVisible ? "Hide Schedule" : "Show Schedule"}
      >
        <Calendar className="h-5 w-5" />
      </Button>

      {/* Main content */}
      <div className="flex h-full relative">
        {/* Left panel - Course list */}
        <div
          className="transition-all duration-300"
          style={{
            width: isScheduleVisible && isDesktop ? `${splitPosition}%` : "100%",
            paddingRight: isScheduleVisible && isDesktop ? "1rem" : "0",
          }}
        >
          {children}
        </div>

        {/* Resizer handle */}
        {isScheduleVisible && isDesktop && (
          <div
            className="absolute top-0 bottom-0 w-4 bg-transparent cursor-col-resize z-20 flex items-center justify-center hover:bg-gray-200/50"
            style={{ left: `calc(${splitPosition}% - 0.5rem)` }}
            onMouseDown={startResize}
          >
            <GripVertical className="h-6 w-6 text-gray-400" />
          </div>
        )}

        {/* Right panel - Schedule */}
        {isScheduleVisible && (
          <div
            className={`bg-white ${
              isDesktop ? "transition-all duration-300 overflow-auto" : "fixed inset-0 z-20 p-4 overflow-auto"
            }`}
            style={{
              width: isDesktop ? `${100 - splitPosition}%` : "100%",
              paddingLeft: isDesktop ? "1rem" : "0",
            }}
          >
            {!isDesktop && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4"
                onClick={() => setIsScheduleVisible(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            )}

            <div className="sticky top-0 bg-white z-10 pb-4 pt-4">
              <h2 className="text-2xl font-bold">Your Schedule</h2>
            </div>

            <WeeklyCalendar scheduledClasses={scheduledClasses} onRemoveClass={removeFromSchedule} />
          </div>
        )}
      </div>
    </div>
  )
}

