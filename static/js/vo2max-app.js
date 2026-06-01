import { VO2MaxChart } from './vo2max-chart.js';
import { Data } from './data.js';
import { DataUtils } from './data-utils.js';

export class VO2MaxApp {
    constructor() {
        this.allData = [];
        this.chart = new VO2MaxChart(document.getElementById('vo2maxChart').getContext('2d'));

        Papa.parse('./data/vo2max_data.csv', {
            download: true,
            header: true,
            complete: results => {
                this.allData = new Data(results.data);
                this.setDefaultDates();
                this.processData();
            }
        });

        document.getElementById('startDate').addEventListener('change', () => this.processData());
        document.getElementById('endDate').addEventListener('change', () => this.processData());
    }

    setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 90);
        const defaultStartDate = pastDate.toISOString().split('T')[0];

        document.getElementById('startDate').value = defaultStartDate;
        document.getElementById('endDate').value = today;
    }

    processData() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        // Calculate values for the entire historical series
        const allVO2MaxValues = this.allData.data.map(row => parseFloat(row.vo2max));

        const validAllVO2MaxValues = allVO2MaxValues.filter(value => !isNaN(value) && isFinite(value));

        const minValue = Math.floor(Math.min(...validAllVO2MaxValues) / 5) * 5;
        const maxValue = Math.ceil(Math.max(...validAllVO2MaxValues) / 5) * 5;

        // Filter data for the specified date range
        const filteredData = this.allData.filterByDateRange(startDate, endDate);
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
