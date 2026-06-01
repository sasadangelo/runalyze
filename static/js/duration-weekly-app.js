import { DurationWeeklyChart } from './duration-weekly-chart.js';

export class DurationWeeklyApp {
    constructor() {
        this.allData = [];
        this.chart = new DurationWeeklyChart(document.getElementById('durationWeeklyChart').getContext('2d'));

        Papa.parse('./data/training_data.csv', {
            download: true,
            header: true,
            complete: results => {
                this.allData = results.data.map(d => ({
                    date: new Date(d.date),
                    duration: parseFloat(d.duration)
                }));
                this.processData();
            }
        });

        document.getElementById('startDate').addEventListener('change', () => this.processData());
        document.getElementById('endDate').addEventListener('change', () => this.processData());
    }

    processData() {
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
