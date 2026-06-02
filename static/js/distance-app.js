import { DistanceChart } from './distance-chart.js';

export class DistanceApp {
    constructor() {
        this.allData = [];
        this.chart = new DistanceChart(document.getElementById('distanceChart').getContext('2d'));

        // Set default dates
        this.setDefaultDates();

        // Load data from API
        this.loadData();

        document.getElementById('startDate').addEventListener('change', () => this.processData());
        document.getElementById('endDate').addEventListener('change', () => this.processData());
    }

    setDefaultDates() {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);

        document.getElementById('startDate').valueAsDate = startDate;
        document.getElementById('endDate').valueAsDate = endDate;
    }

    async loadData() {
        try {
            // Fetch training data from API
            const response = await fetch('/api/training');
            const data = await response.json();

            this.allData = data.map(item => ({
                date: item.date,
                distance: item.distance_km
            }));

            this.processData();
        } catch (error) {
            console.error('Error loading distance data:', error);
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
        const filteredDistanceValues = filteredData.map(row => parseFloat(row.distance));

        const minValue = 0;
        const maxValue = Math.ceil(Math.max(...filteredDistanceValues) / 5) * 5;

        // Crea il grafico con i dati filtrati
        this.chart.createChart(filteredDates, filteredDistanceValues, minValue, maxValue);
    }

    updateChart() {
        this.processData();
    }
}

// Made with Bob
