//./static/js/app.js
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const showFormBtn = document.getElementById('showForm');
    const showEventsBtn = document.getElementById('showEvents');
    const formSection = document.getElementById('formSection');
    const eventsSection = document.getElementById('eventsSection');
    const eventForm = document.getElementById('eventForm');
    const eventList = document.querySelector('.event-list');
    const analyticsContainer = document.querySelector('.analytics');
    
    // Filters
    const filterSmell = document.getElementById('filterSmell');
    const filterWetness = document.getElementById('filterWetness');
    const filterCollateral = document.getElementById('filterCollateral');
    const resetFiltersBtn = document.getElementById('resetFilters');
    
    // Loudness slider
    const loudnessSlider = document.getElementById('loudness');
    const loudnessValue = document.getElementById('loudnessValue');
    
    // State
    let events = [];
    let filteredEvents = [];
    
    // Initialize
    setCurrentDateTime();
    updateLoudnessValue();
    
    // Slider value display
    loudnessSlider.addEventListener('input', updateLoudnessValue);
    
    function updateLoudnessValue() {
        loudnessValue.textContent = loudnessSlider.value;
    }
    
    // Navigation
    showFormBtn.addEventListener('click', function() {
        formSection.classList.remove('hidden');
        eventsSection.classList.add('hidden');
        showFormBtn.classList.add('active');
        showEventsBtn.classList.remove('active');
    });
    
    showEventsBtn.addEventListener('click', function() {
        formSection.classList.add('hidden');
        eventsSection.classList.remove('hidden');
        showFormBtn.classList.remove('active');
        showEventsBtn.classList.add('active');
        
        // Refresh data when showing events
        fetchEvents();
    });
    
    // Set current datetime for the form
    function setCurrentDateTime() {
        const now = new Date();
        const localDateTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
            .toISOString()
            .slice(0, 16);
        
        document.getElementById('eventDate').value = localDateTime;
    }
    
    // Form Submission
    eventForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(eventForm);
        const collateral = Array.from(document.querySelectorAll('input[name="collateral"]:checked'))
            .map(checkbox => checkbox.value);
        
        // Create event object
        const eventData = {
            gamerTag: formData.get('gamerTag'),
            eventDate: formData.get('eventDate'),
            eventLocation: formData.get('eventLocation'),
            duration: parseFloat(formData.get('duration')),
            smellLevel: formData.get('smellLevel'),
            loudness: parseInt(formData.get('loudness')),
            wetness: formData.get('wetness'),
            collateral: collateral,
            victim: formData.get('victim'),
            notes: formData.get('notes')
        };
        
        // Submit event
        submitEvent(eventData);
    });
    
    // Filters
    filterSmell.addEventListener('change', applyFilters);
    filterWetness.addEventListener('change', applyFilters);
    filterCollateral.addEventListener('change', applyFilters);
    
    resetFiltersBtn.addEventListener('click', function() {
        filterSmell.value = '';
        filterWetness.value = '';
        filterCollateral.value = '';
        applyFilters();
    });
    
    function applyFilters() {
        const smellFilter = filterSmell.value;
        const wetnessFilter = filterWetness.value;
        const collateralFilter = filterCollateral.value;
        
        filteredEvents = events.filter(event => {
            // Apply smell filter
            if (smellFilter && event.smellLevel !== smellFilter) {
                return false;
            }
            
            // Apply wetness filter
            if (wetnessFilter && event.wetness !== wetnessFilter) {
                return false;
            }
            
            // Apply collateral filter
            if (collateralFilter && !event.collateral.includes(collateralFilter)) {
                return false;
            }
            
            return true;
        });
        
        renderEvents(filteredEvents);
        renderAnalytics(filteredEvents);
    }
    
    // API Functions
    async function fetchEvents() {
        showLoading(eventList);
        showLoading(analyticsContainer);
        
        try {
            const response = await fetch('/api/events');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            events = await response.json();
            filteredEvents = [...events];
            renderEvents(filteredEvents);
            renderAnalytics(filteredEvents);
        } catch (error) {
            console.error('Error fetching events:', error);
            showError('Failed to load events. Please try again later.');
        }
    }
    
    async function submitEvent(eventData) {
        try {
            const response = await fetch('/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventData)
            });
            
            if (response.ok) {
                const newEvent = await response.json();
                events.push(newEvent);
                filteredEvents = [...events];
                
                // Reset form
                eventForm.reset();
                setCurrentDateTime();
                updateLoudnessValue();
                
                // Show success message
                showToast('Event submitted successfully!');
                
                // Switch to events view
                showEventsBtn.click();
            } else {
                throw new Error('Failed to submit event');
            }
        } catch (error) {
            console.error('Error submitting event:', error);
            showToast('Error submitting event. Please try again.', true);
        }
    }
    
    // Utility Functions
    function showLoading(container) {
        container.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
            </div>
        `;
    }
    
    function showError(message) {
        eventList.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
            </div>
        `;
    }
    
    function showToast(message, isError = false) {
        const toast = document.createElement('div');
        toast.className = isError ? 'toast error' : 'toast';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Hide and remove toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
    
    // Rendering Functions
    function renderEvents(eventsToRender = filteredEvents) {
        if (!eventsToRender.length) {
            eventList.innerHTML = '<p class="no-data">No events found. Be the first to submit one!</p>';
            return;
        }
        
        eventList.innerHTML = '';
        
        // Sort events by date (newest first)
        const sortedEvents = [...eventsToRender].sort((a, b) => 
            new Date(b.eventDate) - new Date(a.eventDate)
        );
        
        sortedEvents.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            
            const date = new Date(event.eventDate).toLocaleString();
            
            // Customize card border based on smell level
            let smellColor = '';
            switch(event.smellLevel) {
                case 'None': 
                    smellColor = 'var(--success)'; 
                    break;
                case 'Mild': 
                    smellColor = '#8bc34a'; 
                    break;
                case 'Smelly': 
                    smellColor = '#ffc107'; 
                    break;
                case 'Terrible': 
                    smellColor = '#ff9800'; 
                    break;
                case 'Atomic': 
                    smellColor = 'var(--error)'; 
                    break;
                default: 
                    smellColor = 'var(--accent)';
            }
            eventCard.style.borderLeftColor = smellColor;
            
            eventCard.innerHTML = `
                <div class="event-header">
                    <h3>${event.gamerTag}'s Event</h3>
                    <span>${date}</span>
                </div>
                <div class="event-meta">
                    <div class="event-meta-item">${event.eventLocation}</div>
                    <div class="event-meta-item">Smell: ${event.smellLevel}</div>
                    <div class="event-meta-item">Loudness: ${event.loudness}/10</div>
                    <div class="event-meta-item">Wetness: ${event.wetness}</div>
                    <div class="event-meta-item">Duration: ${event.duration}s</div>
                </div>
                ${event.collateral && event.collateral.length ? `
                <div class="event-collateral">
                    <strong>Witnesses:</strong> ${event.collateral.join(', ')}
                </div>` : ''}
                ${event.victim ? `
                <div class="event-victim">
                    <strong>Primary Victim:</strong> ${event.victim}
                </div>` : ''}
                ${event.notes ? `
                <div class="event-notes">
                    <strong>Notes:</strong> ${event.notes}
                </div>` : ''}
            `;
            
            eventList.appendChild(eventCard);
        });
    }
    
    function renderAnalytics(eventsToAnalyze = filteredEvents) {
        if (!eventsToAnalyze.length) {
            analyticsContainer.innerHTML = '<p class="no-data">No data available for analytics.</p>';
            return;
        }
        
        // Calculate analytics
        const totalEvents = eventsToAnalyze.length;
        
        // Average duration
        const avgDuration = eventsToAnalyze.reduce((sum, event) => sum + event.duration, 0) / totalEvents;
        
        // Most common smell level
        const smellCounts = eventsToAnalyze.reduce((counts, event) => {
            counts[event.smellLevel] = (counts[event.smellLevel] || 0) + 1;
            return counts;
        }, {});
        const mostCommonSmell = Object.entries(smellCounts)
            .sort((a, b) => b[1] - a[1])[0][0];
        
        // Most common wetness
        const wetnessCounts = eventsToAnalyze.reduce((counts, event) => {
            counts[event.wetness] = (counts[event.wetness] || 0) + 1;
            return counts;
        }, {});
        const mostCommonWetness = Object.entries(wetnessCounts)
            .sort((a, b) => b[1] - a[1])[0][0];
        
        // Average loudness
        const avgLoudness = eventsToAnalyze.reduce((sum, event) => sum + event.loudness, 0) / totalEvents;
        
        // Most frequently affected
        const collateralCounts = eventsToAnalyze.flatMap(event => event.collateral || [])
            .reduce((counts, type) => {
                counts[type] = (counts[type] || 0) + 1;
                return counts;
            }, {});
        const mostAffected = Object.keys(collateralCounts).length 
            ? Object.entries(collateralCounts).sort((a, b) => b[1] - a[1])[0][0]
            : 'None';
        
        // Render analytics cards
        analyticsContainer.innerHTML = `
            <div class="analytics-card">
                <h3>Total Events</h3>
                <div class="analytics-value">${totalEvents}</div>
            </div>
            <div class="analytics-card">
                <h3>Avg Duration</h3>
                <div class="analytics-value">${avgDuration.toFixed(1)}s</div>
            </div>
            <div class="analytics-card">
                <h3>Most Common Smell</h3>
                <div class="analytics-value">${mostCommonSmell}</div>
            </div>
            <div class="analytics-card">
                <h3>Avg Loudness</h3>
                <div class="analytics-value">${avgLoudness.toFixed(1)}/10</div>
            </div>
            <div class="analytics-card">
                <h3>Typical Wetness</h3>
                <div class="analytics-value">${mostCommonWetness}</div>
            </div>
            <div class="analytics-card">
                <h3>Most Affected</h3>
                <div class="analytics-value">${mostAffected}</div>
            </div>
        `;
    }
});

/* */

//I'm so glad the 418 is at /SUS

/* */