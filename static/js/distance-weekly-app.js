import { DistanceWeeklyChart } from './distance-weekly-chart.js';

export class DistanceWeeklyApp {
    constructor() {
        this.allData = [];
        this.chart = new DistanceWeeklyChart(document.getElementById('distanceWeeklyChart').getContext('2d'));

        Papa.parse('./data/training_data.csv', {
            download: true,
            header: true,
            complete: results => {
                this.allData = results.data.map(d => ({
                    date: new Date(d.date),
                    distance: parseFloat(d.distance)
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