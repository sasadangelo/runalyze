import { DurationChart } from './duration-chart.js';

export class DurationApp {
    constructor() {
        this.allData = [];
        this.chart = new DurationChart(document.getElementById('durationChart').getContext('2d'));

        // Load data from API
        this.loadData();

        document.getElementById('startDate').addEventListener('change', () => this.processData());
        document.getElementById('endDate').addEventListener('change', () => this.processData());
    }

    async loadData() {
        try {
            // Fetch training data from API
            const response = await fetch('/api/training');
            const data = await response.json();

            this.allData = data.map(item => ({
                date: item.date,
                duration: item.duration_hours
            }));

            this.processData();
        } catch (error) {
            console.error('Error loading duration data:', error);
        }
    }

    processData() {
        if (this.allData.length === 0) return;

        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        // Filtra i dati per il range di date specificato
        const filteredData = this.allData.filter(row => {
            const date = new Date(row.date);
            return date >= new Date(startDate) && date <= new Date(endDate);
        });

        const filteredDates = filteredData.map(row => row.date);
        const filteredDurationValues = filteredData.map(row => parseFloat(row.duration));

        const minValue = 0;
        const maxValue = Math.ceil(Math.max(...filteredDurationValues) / 10) * 10;

        // Crea il grafico con i dati filtrati
        this.chart.createChart(filteredDates, filteredDurationValues, minValue, maxValue);
    }

    updateChart() {
        this.processData();
    }
}

// Made with Bob
