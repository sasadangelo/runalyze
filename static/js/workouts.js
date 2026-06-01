// Workouts App - Main JavaScript

let workoutsData = [];
let currentWorkout = null;
let paceChart = null;
let hrChart = null;

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    loadWorkouts();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.addEventListener('click', showWorkoutsList);
    }
}

// Load workouts from JSON file
async function loadWorkouts() {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const containerEl = document.getElementById('workouts-container');

    try {
        const response = await fetch('data/workouts.json');
        if (!response.ok) {
            throw new Error('Failed to load workouts data');
        }

        workoutsData = await response.json();

        loadingEl.style.display = 'none';

        if (workoutsData.length === 0) {
            const tbody = document.getElementById('workouts-tbody');
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">No workouts found. Run fetch_workouts.py to download your data.</td></tr>';
        } else {
            displayWorkouts();
        }
    } catch (error) {
        console.error('Error loading workouts:', error);
        loadingEl.style.display = 'none';
        errorEl.textContent = 'Error loading workouts. Please make sure you have run fetch_workouts.py first.';
        errorEl.style.display = 'block';
    }
}

// Display workouts in table
function displayWorkouts() {
    const tbody = document.getElementById('workouts-tbody');
    tbody.innerHTML = '';

    workoutsData.forEach(workout => {
        const row = createWorkoutRow(workout);
        tbody.appendChild(row);
    });
}

// Create a workout table row element
function createWorkoutRow(workout) {
    const row = document.createElement('tr');
    row.onclick = () => showWorkoutDetail(workout);

    const formattedDate = formatDate(workout.date);
    const duration = formatDuration(workout.duration);
    const pace = formatPace(workout.pace);

    row.innerHTML = `
        <td class="workout-date-cell">${formattedDate}</td>
        <td class="workout-name-cell">${workout.name}</td>
        <td>${workout.distance} km</td>
        <td>${duration}</td>
        <td>${pace}</td>
        <td>${workout.avgHR} bpm</td>
    `;

    return row;
}

// Show workout detail view
async function showWorkoutDetail(workout) {
    currentWorkout = workout;

    // Hide list view, show detail view
    document.getElementById('workouts-list-view').style.display = 'none';
    document.getElementById('workout-detail-view').style.display = 'block';

    // Update header
    document.getElementById('workout-title').textContent = workout.name;
    document.getElementById('workout-date').textContent = `${formatDate(workout.date)} at ${workout.time}`;

    // Update stats
    document.getElementById('detail-duration').textContent = formatDuration(workout.duration);
    document.getElementById('detail-distance').textContent = `${workout.distance} km`;
    document.getElementById('detail-pace').textContent = formatPace(workout.pace);
    document.getElementById('detail-calories').textContent = `${workout.calories} kcal`;
    document.getElementById('detail-avg-hr').textContent = `${workout.avgHR} bpm`;
    document.getElementById('detail-max-hr').textContent = `${workout.maxHR} bpm`;

    // Load and display charts
    await loadWorkoutDetails(workout.id);
}

// Load detailed workout data
async function loadWorkoutDetails(activityId) {
    try {
        // For now, we'll create sample data since we need to implement
        // the API endpoint to fetch detailed lap data
        // In a real implementation, this would fetch from a backend API
        const detailsFile = `data/workout_${activityId}.json`;

        try {
            const response = await fetch(detailsFile);
            if (response.ok) {
                const details = await response.json();
                displayCharts(details);
                return;
            }
        } catch (e) {
            // File doesn't exist, create sample data
        }

        // Create sample data based on workout info
        const sampleDetails = createSampleDetails(currentWorkout);
        displayCharts(sampleDetails);

    } catch (error) {
        console.error('Error loading workout details:', error);
    }
}

// Create sample details for demonstration
function createSampleDetails(workout) {
    const numLaps = Math.max(1, Math.floor(workout.distance));
    const pace = [];
    const heartRate = [];

    for (let i = 1; i <= numLaps; i++) {
        // Add some variation to pace and HR
        const paceVariation = (Math.random() - 0.5) * 0.3;
        const hrVariation = Math.floor((Math.random() - 0.5) * 10);

        pace.push({
            lap: i,
            distance: workout.distance / numLaps,
            pace: workout.pace + paceVariation
        });

        heartRate.push({
            lap: i,
            avgHR: workout.avgHR + hrVariation
        });
    }

    return { pace, heartRate };
}

// Display charts
function displayCharts(details) {
    displayPaceChart(details.pace);
    displayHRChart(details.heartRate);
}

// Display pace chart
function displayPaceChart(paceData) {
    const ctx = document.getElementById('pace-chart');

    if (paceChart) {
        paceChart.destroy();
    }

    const labels = paceData.map(d => `Lap ${d.lap}`);
    const data = paceData.map(d => d.pace);

    paceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pace (min/km)',
                data: data,
                borderColor: '#142e51',
                backgroundColor: 'rgba(20, 46, 81, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Pace (min/km)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Lap'
                    }
                }
            }
        }
    });
}

// Display heart rate chart
function displayHRChart(hrData) {
    const ctx = document.getElementById('hr-chart');

    if (hrChart) {
        hrChart.destroy();
    }

    // Check if we have time-series data (second by second) or lap data
    let labels, data, chartType, xAxisTitle;

    if (hrData.length > 0 && hrData[0].time !== undefined) {
        // Time-series data (second by second)
        // Sample data to avoid too many points (every 5 seconds)
        const sampledData = hrData.filter((_, index) => index % 5 === 0);
        labels = sampledData.map((d, i) => {
            const seconds = Math.floor(d.time / 1000);
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        });
        data = sampledData.map(d => d.hr);
        chartType = 'line';
        xAxisTitle = 'Time';
    } else {
        // Lap data
        labels = hrData.map(d => `Lap ${d.lap}`);
        data = hrData.map(d => d.avgHR);
        chartType = 'bar';
        xAxisTitle = 'Lap';
    }

    hrChart = new Chart(ctx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: [{
                label: 'Heart Rate (bpm)',
                data: data,
                backgroundColor: chartType === 'line' ? 'rgba(220, 53, 69, 0.1)' : 'rgba(220, 53, 69, 0.7)',
                borderColor: 'rgba(220, 53, 69, 1)',
                borderWidth: 2,
                fill: chartType === 'line',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Heart Rate (bpm)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: xAxisTitle
                    },
                    ticks: {
                        maxTicksLimit: 20
                    }
                }
            }
        }
    });
}

// Show workouts list
function showWorkoutsList() {
    document.getElementById('workout-detail-view').style.display = 'none';
    document.getElementById('workouts-list-view').style.display = 'block';

    // Destroy charts to free memory
    if (paceChart) {
        paceChart.destroy();
        paceChart = null;
    }
    if (hrChart) {
        hrChart.destroy();
        hrChart = null;
    }
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);

    if (hours > 0) {
        return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
}

function formatPace(pace) {
    if (pace === 0) return 'N/A';

    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')} /km`;
}

// Made with Bob
