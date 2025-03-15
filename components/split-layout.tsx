"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSchedule } from "@/context/schedule-context"
import { Button } from "@/components/ui/button"
import { Calendar, X, ChevronRight } from "lucide-react"
import WeeklyCalendar from "./weekly-calendar"
import { useMediaQuery } from "@/hooks/use-media-query"

interface SplitLayoutProps {
  children: React.ReactNode
}

export function SplitLayout({ children }: SplitLayoutProps) {
  const { scheduledClasses, removeFromSchedule } = useSchedule()
  const [isScheduleVisible, setIsScheduleVisible] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  // Close schedule panel on mobile when navigating away
  useEffect(() => {
    if (!isDesktop && isScheduleVisible) {
      const handleRouteChange = () => setIsScheduleVisible(false)
      window.addEventListener("popstate", handleRouteChange)
      return () => window.removeEventListener("popstate", handleRouteChange)
    }
  }, [isDesktop, isScheduleVisible])

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Toggle button - fixed position */}
      <Button
        onClick={() => setIsScheduleVisible(!isScheduleVisible)}
        className={`fixed z-30 bottom-6 ${isScheduleVisible ? "right-[calc(50%-1.5rem)]" : "right-6"} shadow-lg bg-[#CC0033] hover:bg-[#A30029] transition-all duration-300`}
        size="icon"
        aria-label={isScheduleVisible ? "Hide Schedule" : "Show Schedule"}
      >
        {isScheduleVisible ? <ChevronRight className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
      </Button>

      {/* Main content grid */}
      <div
        className={`grid transition-all duration-300 ${isScheduleVisible && isDesktop ? "grid-cols-2" : "grid-cols-1"}`}
      >
        {/* Left panel - Course list */}
        <div className={`transition-all duration-300 ${isScheduleVisible && isDesktop ? "pr-4 border-r" : ""}`}>
          {children}
        </div>

        {/* Right panel - Schedule (conditionally rendered) */}
        {isScheduleVisible && (
          <div className={`bg-white ${isDesktop ? "relative pl-4" : "fixed inset-0 z-20 p-4 overflow-auto"}`}>
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
              {scheduledClasses.length === 0 && (
                <p className="text-gray-500 mt-2">No classes added to your schedule yet</p>
              )}
            </div>

            <WeeklyCalendar scheduledClasses={scheduledClasses} onRemoveClass={removeFromSchedule} />
          </div>
        )}
      </div>
    </div>
  )
}

