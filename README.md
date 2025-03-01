# Gaseous Event Tracker

A lightweight, modern web application for tracking and analyzing gaseous events. This multithreaded Go HTTP server provides API endpoints for submitting and retrieving event data, along with a sleek dark-themed frontend for data entry and visualization.

## Features

- **Multithreaded Go HTTP Server**: Efficiently handles concurrent requests
- **RESTful API**: Simple POST and GET endpoints for managing event data
- **Modern Dark-Themed UI**: Sleek, responsive interface with dark mode
- **Real-time Form Validation**: Ensures data integrity
- **Data Filtering**: Filter events by various criteria
- **Analytics Dashboard**: View statistics and trends
- **Persistent Storage**: All data saved to a local JSON file
- **Custom 404 Page**: Themed error page for better user experience
- **Easter Egg**: Hidden page at `/SUS` with special content

## Project Structure

```
gaseous-event-tracker/
├── main.go              # Go HTTP server
├── events.json          # Data storage file (created on first run)
├── static/              # Static web files
│   ├── index.html       # Single page application
│   ├── css/             
│   │   └── styles.css   # Styling for the application
│   ├── js/
│   │   └── app.js       # Frontend JavaScript
│   ├── img/
│   │   └── evil.png     # Image for easter egg page
│   └── video/
│       └── xd.mp4       # Video for easter egg page
├── Dockerfile           # For containerized deployment
└── README.md            # This file
```

## Installation

### Prerequisites

- Go 1.16 or higher
- Web browser

### Option 1: Direct Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/gaseous-event-tracker.git
   cd gaseous-event-tracker
   ```

2. Create the directory structure:
   ```
   mkdir -p static/css static/js static/img static/video
   ```

3. Copy the source files to their corresponding locations:
   - `main.go` → root directory
   - `index.html` → `static/`
   - `styles.css` → `static/css/`
   - `app.js` → `static/js/`
   - Add any image file as `static/img/evil.png`
   - Add any video file as `static/video/xd.mp4`

4. Build and run the server:
   ```
   go build -o server main.go
   ./server
   ```

### Option 2: Using Docker

1. Build the Docker image:
   ```
   docker build -t gaseous-event-tracker .
   ```

2. Run the container:
   ```
   docker run -p 2001:2001 gaseous-event-tracker
   ```

## Usage

1. Access the application by opening a web browser and navigating to:
   ```
   http://localhost:2001
   ```

2. You'll be redirected to `/gas_events/` where the application is hosted.

3. Use the navigation buttons to switch between submitting new events and viewing existing events.

4. Fill out the form to submit a new gaseous event, including:
   - Your gamer tag
   - Event date and time
   - Location
   - Duration
   - Smell level
   - Loudness
   - Wetness factor
   - Collateral damage (who was present)
   - Who suffered most
   - Additional notes

5. View all submitted events in the "View Events" section.

6. Use the filters to narrow down events by smell level, wetness, or witnesses.

7. View analytics about the collected data at the top of the events page.

## API Endpoints

### GET /api/events

Retrieves all gaseous events.

**Response:**
```json
[
  {
    "id": 1,
    "gamerTag": "GasMaster420",
    "eventDate": "2025-02-28T12:30:00",
    "eventLocation": "Living Room",
    "duration": 3.5,
    "smellLevel": "Terrible",
    "loudness": 8,
    "wetness": "Dry",
    "collateral": ["Dog", "Significant Other"],
    "victim": "The Dog",
    "notes": "Pizza was definitely a mistake",
    "createdAt": "2025-02-28T12:35:22Z"
  }
]
```

### POST /api/events

Submits a new gaseous event.

**Request Body:**
```json
{
  "gamerTag": "GasMaster420",
  "eventDate": "2025-02-28T12:30:00",
  "eventLocation": "Living Room",
  "duration": 3.5,
  "smellLevel": "Terrible",
  "loudness": 8,
  "wetness": "Dry",
  "collateral": ["Dog", "Significant Other"],
  "victim": "The Dog",
  "notes": "Pizza was definitely a mistake"
}
```

**Response:**
The created event with auto-generated ID and timestamp.

## Special Routes

### /

The root path redirects to `/gas_events/` where the main application is served.

### /gas_events/

Serves the main application interface from the `static` directory.

### /SUS

An easter egg page that displays custom content with HTTP status 418 (I'm a teapot).

### Any other path

A custom 404 error page is shown for any unmatched routes.

## Customization

- **Storage Location**: Edit the file path in `main.go` to change where event data is stored
- **Port**: Change the port in `main.go` if 2001 is already in use (currently set to `0.0.0.0:2001`)
- **UI Theme**: Modify `styles.css` to change the appearance

## License

This project is released under the MIT License.

## Screenshots

![Gaseous Event Tracker - Submission Form](screenshots/form.png)
![Gaseous Event Tracker - Event List](screenshots/events.png)

---

*All submissions are confidential and for research purposes only.*