import { DurationChart } from './duration-chart.js';
import { Data } from './data.js';

export class DurationApp {
    constructor() {
        this.allData = [];
        this.chart = new DurationChart(document.getElementById('durationChart').getContext('2d'));

        Papa.parse('./data/training_data.csv', {
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

        // Filtra i dati per il range di date specificato
        const filteredData = this.allData.filterByDateRange(startDate, endDate);
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
