export interface ClassSchedule {
  days: string[] | string
  time: string
}

export interface MeetingTime {
  day?: string
  meetingDay?: string
  startTime?: {
    military: string
    formatted: string
  }
  endTime?: {
    military: string
    formatted: string
  }
  startTimeMilitary?: string
  endTimeMilitary?: string
  building?: string
  buildingCode?: string
  room?: string
  roomNumber?: string
  mode?: string
  meetingModeDesc?: string
  campus?: string
  campusLocation?: string
  campusAbbrev?: string
  campusName?: string
}

export interface Instructor {
  name: string
  [key: string]: any
}

export interface Section {
  number: string
  index: string
  instructors: (string | Instructor)[]
  status?: string
  openStatus?: boolean
  openStatusText?: string
  comments?: string | any[]
  meetingTimes: MeetingTime[]
  [key: string]: any
}

export interface CoreCode {
  code: string
  description: string
}

export interface ClassData {
  id?: string
  courseString: string
  title: string
  subject?: string
  subjectDescription?: string
  courseNumber?: string
  description?: string
  credits?: string
  creditsDescription?: string
  school?: string
  campusLocations?: string[]
  prerequisites?: string
  coreCodes?: CoreCode[]
  sections?: Section[]
  instructor?: string
  name?: string
  schedule?: ClassSchedule
  tags?: string[]
  selectedSection?: Section
  [key: string]: any
}

