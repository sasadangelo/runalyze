import { TSSChart } from './tss-chart.js';
import { DataUtils } from './data-utils.js';

export class TSSApp {
    constructor() {
        console.log('TSSApp constructor called');
        this.allData = [];
        this.chart = new TSSChart(document.getElementById('tssChart').getContext('2d'));

        // Load data from API
        this.loadData();

        document.getElementById('startDate').addEventListener('change', () => this.processData());
        document.getElementById('endDate').addEventListener('change', () => this.processData());
    }

    async loadData() {
        try {
            console.log('Loading TSS data from API...');
            // Fetch all training data without date filters to get complete dataset
            const response = await fetch('/api/training');
            const data = await response.json();
            console.log('TSS data loaded:', data.length, 'records');

            this.allData = data.map(item => ({
                date: item.date,
                tss: item.tss || 0
            }));

            this.processData();
        } catch (error) {
            console.error('Error loading training data:', error);
        }
    }

    processData() {
        console.log('TSSApp processData called, data length:', this.allData.length);
        if (this.allData.length === 0) {
            console.log('No data to process yet');
            return;
        }

        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        console.log('Processing data for date range:', startDate, 'to', endDate);

        // Filtra i dati per il range di date specificato
        const filteredData = this.allData.filter(row => {
            const date = new Date(row.date);
            return date >= new Date(startDate) && date <= new Date(endDate);
        });

        const filteredDates = filteredData.map(row => row.date);
        const filteredTssValues = filteredData.map(row => parseFloat(row.tss));

        const minValue = 0;
        const maxValue = Math.ceil(Math.max(...filteredTssValues) / 10) * 10;

        console.log('Creating TSS chart with', filteredDates.length, 'data points');
        // Crea il grafico con i dati filtrati
        this.chart.createChart(filteredDates, filteredTssValues, minValue, maxValue);
    }

    updateChart() {
        this.processData();
    }
}

// Made with Bob
