import { DistanceWeeklyChart } from './distance-weekly-chart.js';

export class DistanceWeeklyApp {
    constructor() {
        this.allData = [];
        this.chart = new DistanceWeeklyChart(document.getElementById('distanceWeeklyChart').getContext('2d'));

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
                distance: parseFloat(item.distance) || 0
            }));

            this.processData();
        } catch (error) {
            console.error('Error loading training data for Distance Weekly:', error);
        }
    }

    processData() {
        if (this.allData.length === 0) return;

        const startDate = new Date(document.getElementById('startDate').value);
        const endDate = new Date(document.getElementById('endDate').value);

        const filteredData = this.allData.filter(d => d.date >= startDate && d.date <= endDate);

        const weeklyDistances = this.calculateWeeklyDistances(filteredData);

        this.chart.createChart(Object.keys(weeklyDistances), Object.values(weeklyDistances));
    }

    calculateWeeklyDistances(data) {
        const weeklyDistances = {};

        data.forEach(d => {
            const weekStart = this.getStartOfWeek(d.date);
            if (!weeklyDistances[weekStart]) {
                weeklyDistances[weekStart] = 0;
            }
            weeklyDistances[weekStart] += d.distance;
        });

        return weeklyDistances;
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