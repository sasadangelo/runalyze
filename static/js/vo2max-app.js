import { VO2MaxChart } from './vo2max-chart.js';
import { DataUtils } from './data-utils.js';

export class VO2MaxApp {
    constructor() {
        this.allData = [];
        this.chart = new VO2MaxChart(document.getElementById('vo2maxChart').getContext('2d'));

        // Load data from API
        this.loadData();

        document.getElementById('startDate').addEventListener('change', () => this.processData());
        document.getElementById('endDate').addEventListener('change', () => this.processData());
    }

    async loadData() {
        try {
            // Fetch VO2max data from training API
            const response = await fetch('/api/training');
            const data = await response.json();

            // Filter only entries with vo2max values
            this.allData = data
                .filter(item => item.vo2max != null)
                .map(item => ({
                    date: item.date,
                    vo2max: item.vo2max
                }));

            this.processData();
        } catch (error) {
            console.error('Error loading VO2max data:', error);
        }
    }

    processData() {
        if (this.allData.length === 0) return;

        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        // Calculate values for the entire historical series
        const allVO2MaxValues = this.allData.map(row => parseFloat(row.vo2max));

        const validAllVO2MaxValues = allVO2MaxValues.filter(value => !isNaN(value) && isFinite(value));

        const minValue = Math.floor(Math.min(...validAllVO2MaxValues) / 5) * 5;
        const maxValue = Math.ceil(Math.max(...validAllVO2MaxValues) / 5) * 5;

        // Filter data for the specified date range
        const filteredData = this.allData.filter(row => {
            const date = new Date(row.date);
            return date >= new Date(startDate) && date <= new Date(endDate);
        });

        const filteredDates = filteredData.map(row => row.date);
        const filteredVO2MaxValues = filteredData.map(row => parseFloat(row.vo2max));

        // Create the chart with filtered data
        this.chart.createChart(filteredDates, filteredVO2MaxValues, minValue, maxValue);
    }

    updateChart() {
        this.processData();
    }
}

// Made with Bob