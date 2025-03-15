# Rutgers Course Planner

https://rutgers-course-planner.vercel.app/

A comprehensive web application for Rutgers University students to search for courses, plan their schedules, and visualize their weekly calendar.

## Features

- **Course Search**: Search for courses by department, course number, or keywords
- **Section Selection**: View and select from available course sections with detailed information
- **Weekly Calendar View**: Visualize your schedule in a weekly calendar format
- **Multiple Calendars**: Save and manage multiple schedule configurations
- **Time Conflict Detection**: Automatic detection of scheduling conflicts
- **Campus Color Coding**: Visual distinction between different campus locations
- **Responsive Design**: Works on desktop and mobile devices

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/rutgers-course-planner.git
   cd rutgers-course-planner
```

2. Install dependencies:

```shellscript
npm install
```


3. Run the development server:

```shellscript
npm run dev
```


4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.


## Usage

### Searching for Courses

1. Click the "Search Classes" button
2. Select the year, term, and campus
3. Enter search terms (e.g., "CS 111" or "Calculus")
4. Browse through the search results


### Adding Courses to Your Schedule

1. Find a course you want to add
2. Click "Select a Section" to view available sections
3. Choose a section that fits your schedule
4. Click "Add to Schedule" to add the course


### Managing Your Schedule

- Use the calendar view to visualize your weekly schedule
- Switch to list view for a compact representation of your courses
- Remove courses by clicking the "X" button on the course card
- Save your schedule using the "Manage Calendars" feature


## Technologies Used

- **Next.js**: React framework for server-rendered applications
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless UI components
- **Zustand**: State management
- **Lucide React**: Icon library


## Project Structure

```plaintext
rutgers-course-planner/
├── app/                  # Next.js app directory
│   ├── api/              # API routes
│   ├── search/           # Search page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # React components
│   ├── ui/               # UI components (buttons, cards, etc.)
│   ├── course-*.tsx      # Course-related components
│   └── weekly-calendar.tsx # Calendar view component
├── context/              # React context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Rutgers University for providing the course data API

