"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar, Save, Trash2, FileText, Edit, Check, X, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useSchedule } from "@/context/schedule-context"

interface CalendarManagementDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function CalendarManagementDialog({ isOpen, onClose }: CalendarManagementDialogProps) {
  const { toast } = useToast()
  const {
    scheduledClasses,
    saveCalendar,
    loadCalendar,
    deleteCalendar,
    renameCalendar,
    savedCalendars,
    currentCalendar,
  } = useSchedule()

  const [view, setView] = useState<"save" | "load">("save")
  const [newCalendarName, setNewCalendarName] = useState("")
  const [editingCalendar, setEditingCalendar] = useState<string | null>(null)
  const [newName, setNewName] = useState("")
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setNewCalendarName("")
      setEditingCalendar(null)
      setNewName("")
      setConfirmDelete(null)
    }
  }, [isOpen])

  const calendarNames = Object.keys(savedCalendars)
  const hasCalendars = calendarNames.length > 0
  const hasCurrentClasses = scheduledClasses.length > 0

  const handleSaveCalendar = () => {
    if (!newCalendarName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for your calendar",
        variant: "destructive",
      })
      return
    }

    if (savedCalendars[newCalendarName] && !confirm(`Replace existing calendar "${newCalendarName}"?`)) {
      return
    }

    saveCalendar(newCalendarName)
    toast({
      title: "Calendar Saved",
      description: `Your calendar "${newCalendarName}" has been saved.`,
    })
    setNewCalendarName("")
  }

  const handleLoadCalendar = (name: string) => {
    loadCalendar(name)
    toast({
      title: "Calendar Loaded",
      description: `Calendar "${name}" has been loaded.`,
    })
    onClose()
  }

  const handleDeleteCalendar = (name: string) => {
    deleteCalendar(name)
    setConfirmDelete(null)
    toast({
      title: "Calendar Deleted",
      description: `Calendar "${name}" has been deleted.`,
    })
  }

  const handleRenameCalendar = (oldName: string) => {
    if (!newName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a new name",
        variant: "destructive",
      })
      return
    }

    if (savedCalendars[newName] && !confirm(`Replace existing calendar "${newName}"?`)) {
      return
    }

    renameCalendar(oldName, newName)
    setEditingCalendar(null)
    setNewName("")
    toast({
      title: "Calendar Renamed",
      description: `Calendar renamed to "${newName}".`,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Calendar Management</DialogTitle>
          <DialogDescription>Save, load, rename, or delete your course calendars.</DialogDescription>
        </DialogHeader>

        <div className="flex space-x-2 mb-4">
          <Button variant={view === "save" ? "default" : "outline"} onClick={() => setView("save")} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Calendar
          </Button>
          <Button variant={view === "load" ? "default" : "outline"} onClick={() => setView("load")} className="flex-1">
            <FileText className="h-4 w-4 mr-2" />
            Manage Calendars
          </Button>
        </div>

        {view === "save" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="calendar-name" className="text-sm font-medium">
                Calendar Name
              </label>
              <Input
                id="calendar-name"
                value={newCalendarName}
                onChange={(e) => setNewCalendarName(e.target.value)}
                placeholder="Enter a name for your calendar"
                disabled={!hasCurrentClasses}
              />
              {!hasCurrentClasses && (
                <p className="text-sm text-amber-600 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Add courses to your schedule before saving.
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                onClick={handleSaveCalendar}
                disabled={!newCalendarName.trim() || !hasCurrentClasses}
                className="bg-[#CC0033] hover:bg-[#A30029]"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Calendar
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            {hasCalendars ? (
              <div className="border rounded-md divide-y max-h-[300px] overflow-y-auto">
                {calendarNames.map((name) => (
                  <div key={name} className="p-3">
                    {confirmDelete === name ? (
                      <div className="flex flex-col space-y-2">
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Are you sure you want to delete "{name}"?
                        </p>
                        <div className="flex space-x-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteCalendar(name)}
                            className="flex-1"
                          >
                            Delete
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setConfirmDelete(null)} className="flex-1">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : editingCalendar === name ? (
                      <div className="flex flex-col space-y-2">
                        <Input
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="Enter new name"
                          className="text-sm"
                        />
                        <div className="flex space-x-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleRenameCalendar(name)}
                            className="flex-1"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingCalendar(null)
                              setNewName("")
                            }}
                            className="flex-1"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div
                          className="flex items-center flex-1 cursor-pointer"
                          onClick={() => handleLoadCalendar(name)}
                        >
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="font-medium">{name}</span>
                          {currentCalendar === name && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingCalendar(name)
                              setNewName(name)
                            }}
                            className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmDelete(name)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No saved calendars yet.</p>
                <p className="text-sm">Save a calendar to see it here.</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

