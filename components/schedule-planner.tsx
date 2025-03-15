"use client"
import { useState } from "react"
import { useSchedule } from "@/context/schedule-context"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { X, Clock, MapPin, Save } from "lucide-react"
import WeeklyCalendar from "./weekly-calendar"
import { Badge } from "@/components/ui/badge"
import { CalendarManagementDialog } from "./calendar-management-dialog"

interface SchedulePlannerProps {
  isVisible: boolean
  onClose: () => void
}

// Update the CAMPUS_COLORS constant with numeric IDs
const CAMPUS_COLORS = {
  "1": "bg-red-100 border-red-200 text-red-800",
  "2": "bg-blue-100 border-blue-200 text-blue-800",
  "3": "bg-green-100 border-green-200 text-green-800",
  "4": "bg-orange-100 border-orange-200 text-orange-800",
  "College Ave": "bg-red-100 border-red-200 text-red-800",
  Busch: "bg-blue-100 border-blue-200 text-blue-800",
  Livingston: "bg-green-100 border-green-200 text-green-800",
  "Cook/Douglass": "bg-orange-100 border-orange-200 text-orange-800",
  Online: "bg-purple-100 border-purple-200 text-purple-800",
} as const

export type CampusName = keyof typeof CAMPUS_COLORS

export default function SchedulePlanner({ isVisible, onClose }: SchedulePlannerProps) {
  const { scheduledClasses, removeFromSchedule, allowTimeCollisions, setAllowTimeCollisions, currentCalendar } =
    useSchedule()
  const [isCalendarDialogOpen, setIsCalendarDialogOpen] = useState(false)

  const handleToggleTimeCollisions = (checked: boolean) => {
    setAllowTimeCollisions(checked)
  }

  if (!isVisible) return null

  // Campus ID to name mapping for the legend
  const campusIdToName = {
    "1": "College Ave",
    "2": "Busch",
    "3": "Livingston",
    "4": "Cook/Douglass",
  }

  return (
    <>
      <div className="fixed inset-0 bg-white z-50 overflow-auto">
        <div className="p-4 md:p-6">
          <div className="flex justify-between items-center mb-6">
            {/* Left side - Title */}
            <div className="flex items-center">
              <h2 className="text-2xl font-bold">Schedule Planner</h2>
              {currentCalendar !== "default" && (
                <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  {currentCalendar}
                </span>
              )}
            </div>

            {/* Middle - Campus Legend */}
            <div className="flex items-center gap-4 ml-8">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div className="flex gap-2">
                  {Object.entries(campusIdToName).map(([id, name]) => (
                    <Badge key={id} variant="outline" className={`${CAMPUS_COLORS[id as CampusName]} border`}>
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side - Controls */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCalendarDialogOpen(true)}
                className="flex items-center gap-1"
              >
                <Save className="h-4 w-4" />
                Manage Calendars
              </Button>

              <div className="flex items-center space-x-2">
                <Switch
                  id="allow-collisions"
                  checked={allowTimeCollisions}
                  onCheckedChange={handleToggleTimeCollisions}
                />
                <Label htmlFor="allow-collisions" className="text-sm flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  Allow Time Collisions
                </Label>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>

          <WeeklyCalendar
            scheduledClasses={scheduledClasses}
            onRemoveClass={removeFromSchedule}
            campusColors={CAMPUS_COLORS}
          />

          {scheduledClasses.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">No classes in your schedule</h3>
              <p className="mt-2 text-gray-500">Add classes to see them in your schedule</p>
            </div>
          )}
        </div>
      </div>

      <CalendarManagementDialog isOpen={isCalendarDialogOpen} onClose={() => setIsCalendarDialogOpen(false)} />
    </>
  )
}

