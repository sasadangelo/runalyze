import { DurationWeeklyChart } from './duration-weekly-chart.js';

export class DurationWeeklyApp {
    constructor() {
        this.allData = [];
        this.chart = new DurationWeeklyChart(document.getElementById('durationWeeklyChart').getContext('2d'));

        // Load data from API
        this.loadData();

        document.getElementById('startDate').addEventListener('change', () => this.processData());
        document.getElementById('endDate').addEventListener('change', () => this.processData());
    }

    async loadData() {
        try {
            // Fetch all training data without date filters to get complete dataset
            const response = await fetch('/api/training');
            const data = await response.json();

            this.allData = data.map(item => ({
                date: new Date(item.date),
                duration: parseFloat(item.duration) || 0
            }));

            this.processData();
        } catch (error) {
            console.error('Error loading training data for Duration Weekly:', error);
        }
    }

    processData() {
        if (this.allData.length === 0) return;

        const startDate = new Date(document.getElementById('startDate').value);
        const endDate = new Date(document.getElementById('endDate').value);

        const filteredData = this.allData.filter(d => d.date >= startDate && d.date <= endDate);

        const weeklyDurations = this.calculateWeeklyDurations(filteredData);

        this.chart.createChart(Object.keys(weeklyDurations), Object.values(weeklyDurations));
    }

    calculateWeeklyDurations(data) {
        const weeklyDurations = {};

        data.forEach(d => {
            const weekStart = this.getStartOfWeek(d.date);
            if (!weeklyDurations[weekStart]) {
                weeklyDurations[weekStart] = 0;
            }
            weeklyDurations[weekStart] += d.duration;
        });

        return weeklyDurations;
    }

    getStartOfWeek(date) {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        const weekStart = new Date(date.setDate(diff));
        return weekStart.toISOString().split('T')[0]; // Return as YYYY-MM-DD
    }

    updateChart() {
        this.processData();
    }
}

// Made with Bob
