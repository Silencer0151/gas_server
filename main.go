// ./main.go
package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"sync"
	"time"
)

// GasEvent represents a gas event submission
type GasEvent struct {
	ID            int      `json:"id"`
	GamerTag      string   `json:"gamerTag"`
	EventDate     string   `json:"eventDate"`
	EventLocation string   `json:"eventLocation"`
	Duration      float64  `json:"duration"`
	SmellLevel    string   `json:"smellLevel"`
	Loudness      int      `json:"loudness"`
	Wetness       string   `json:"wetness"`
	Collateral    []string `json:"collateral"`
	Victim        string   `json:"victim"`
	Notes         string   `json:"notes"`
	CreatedAt     string   `json:"createdAt"`
}

// EventStore handles storage and retrieval of events
type EventStore struct {
	sync.RWMutex
	events []GasEvent
	file   string
}

// NewEventStore creates a new event store with the given file
func NewEventStore(file string) (*EventStore, error) {
	store := &EventStore{
		events: []GasEvent{},
		file:   file,
	}

	// Create file if it doesn't exist
	if _, err := os.Stat(file); os.IsNotExist(err) {
		if err := ioutil.WriteFile(file, []byte("[]"), 0644); err != nil {
			return nil, fmt.Errorf("error creating file: %v", err)
		}
	}

	// Load existing events from file
	data, err := ioutil.ReadFile(file)
	if err != nil {
		return nil, fmt.Errorf("error reading file: %v", err)
	}

	if len(data) > 0 {
		if err := json.Unmarshal(data, &store.events); err != nil {
			return nil, fmt.Errorf("error unmarshalling data: %v", err)
		}
	}

	log.Printf("Loaded %d events from %s", len(store.events), file)
	return store, nil
}

// GetEvents returns all events
func (s *EventStore) GetEvents() []GasEvent {
	s.RLock()
	defer s.RUnlock()
	return s.events
}

// AddEvent adds a new event and saves to file
func (s *EventStore) AddEvent(event GasEvent) (GasEvent, error) {
	s.Lock()
	defer s.Unlock()

	// Generate ID
	nextID := 1
	if len(s.events) > 0 {
		nextID = s.events[len(s.events)-1].ID + 1
	}
	event.ID = nextID
	event.CreatedAt = time.Now().Format(time.RFC3339)

	s.events = append(s.events, event)

	// Save to file
	data, err := json.MarshalIndent(s.events, "", "  ")
	if err != nil {
		return event, fmt.Errorf("error marshalling data: %v", err)
	}

	if err := ioutil.WriteFile(s.file, data, 0644); err != nil {
		return event, fmt.Errorf("error writing file: %v", err)
	}

	log.Printf("Added new event with ID %d", event.ID)
	return event, nil
}

// Middleware for logging HTTP requests
func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)

		// Get the client's IP address
		clientIP := r.RemoteAddr
		// If you're behind a proxy that sets X-Forwarded-For, you might want this instead:
		// clientIP := r.Header.Get("X-Forwarded-For")
		// if clientIP == "" {
		//     clientIP = r.RemoteAddr
		// }

		log.Printf(
			"%s %s %s IP: %s",
			r.Method,
			r.RequestURI,
			time.Since(start),
			clientIP,
		)
	})
}

// Middleware for setting CORS headers
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	// Create event store
	store, err := NewEventStore("events.json")
	if err != nil {
		log.Fatalf("Failed to create event store: %v", err)
	}

	// Create router
	mux := http.NewServeMux()

	// Custom 404 handler
	notFoundHandler := func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNotFound)
		html := `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Page Not Found</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #e0e0e0;
            margin: 0;
            padding: 0;
            background-color: #121212;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            text-align: center;
        }
       
        .container {
            max-width: 600px;
            padding: 40px;
            background-color: #1e1e1e;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }
       
        h1 {
            color: #81c3ff;
            margin-bottom: 20px;
            font-size: 3em;
        }
       
        p {
            margin-bottom: 30px;
            font-size: 1.2em;
        }
       
        .emoji {
            font-size: 5em;
            margin-bottom: 20px;
        }
       
        a {
            display: inline-block;
            background-color: #4285f4;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 4px;
            font-weight: bold;
            transition: background-color 0.3s;
        }
       
        a:hover {
            background-color: #356ac3;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="emoji">💨</div>
        <h1>404 - Gas Leak!</h1>
        <p>Oops! The page you're looking for has dissipated into thin air.</p>
        <a href="/">Back to Safety</a>
    </div>
</body>
</html>`
		fmt.Fprint(w, html)
	}

	// SUS endpoint
	mux.HandleFunc("/SUS", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		// We'll still send a valid HTTP status (let's use 418 I'm a teapot for fun)
		w.WriteHeader(418)
		fmt.Fprintf(w, "<html><head><title>666 DEMON PAGE</title>")
		fmt.Fprintf(w, "<style>")
		fmt.Fprintf(w, "body { background-color: black; color: red; font-family: monospace; margin: 0; padding: 0; }")
		fmt.Fprintf(w, "h1 { color: #FF0000; text-align: center; animation: pulse 2s infinite; }")
		fmt.Fprintf(w, "@keyframes pulse { 0%% { opacity: 1; } 50%% { opacity: 0.5; } 100%% { opacity: 1; } }")
		fmt.Fprintf(w, ".image-container { display: flex; justify-content: center; margin: 20px 0; }")
		fmt.Fprintf(w, ".escape-link { text-align: center; margin-top: 20px; padding: 10px; }")
		fmt.Fprintf(w, ".escape-link a { color: #FF0000; text-decoration: none; font-weight: bold; }")
		fmt.Fprintf(w, "</style>")
		fmt.Fprintf(w, "</head><body>")
		fmt.Fprintf(w, "<h1>666 - DEMON PAGE</h1>")
		fmt.Fprintf(w, "<div class='image-container'>")
		fmt.Fprintf(w, "  <!-- why is a cool key something like 'fuck_you98.27_ZROCK'???? idk :) -->")
		fmt.Fprintf(w, "  <a href='/gas_events/cool_thing.html'>")
		fmt.Fprintf(w, "  <img src='/gas_events/img/evil.png' alt='Demon Image' style='max-width: 500px;'>")
		fmt.Fprintf(w, "  </a>")
		fmt.Fprintf(w, "</div>")
		fmt.Fprintf(w, "<div class='escape-link'>")
		fmt.Fprintf(w, "  <a href='/'>ESCAPE IF YOU DARE</a>")
		fmt.Fprintf(w, "</div>")
		fmt.Fprintf(w, "</body></html>")
	})

	// API endpoints
	apiHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/events" {
			notFoundHandler(w, r)
			return
		}

		switch r.Method {
		case http.MethodGet:
			// Get all events
			log.Printf("GET /api/events - retrieving all events")
			events := store.GetEvents()
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(events)

		case http.MethodPost:
			// Add new event
			log.Printf("POST /api/events - adding new event")
			var event GasEvent
			if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				log.Printf("Error decoding request body: %v", err)
				return
			}

			event, err := store.AddEvent(event)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				log.Printf("Error adding event: %v", err)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(event)

		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			log.Printf("Method not allowed: %s", r.Method)
		}
	})

	// Apply middleware to API routes
	apiChain := loggingMiddleware(corsMiddleware(apiHandler))
	mux.Handle("/api/events", apiChain)

	// Serve static files
	fs := http.FileServer(http.Dir("static"))
	//mux.Handle("/", loggingMiddleware(fs))

	// Register the static file server
	fs = http.FileServer(http.Dir("static"))
	mux.Handle("/gas_events/", http.StripPrefix("/gas_events/", fs))

	// Register default handler for all other routes
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Only handle the root path directly
		if r.URL.Path == "/" {
			http.Redirect(w, r, "/gas_events/", http.StatusFound)
			return
		}

		// For all other unmatched routes, show the 404 page
		notFoundHandler(w, r)
	})

	// Start server
	addr := "0.0.0.0:2001" // Listen on all available interfaces
	log.Printf("Server starting on http://%s", addr)
	if err := http.ListenAndServe(addr, loggingMiddleware(mux)); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
