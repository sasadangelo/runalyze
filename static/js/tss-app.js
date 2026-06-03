import { TSSChart } from './tss-chart.js';
import { DataUtils } from './data-utils.js';

export class TSSApp {
    constructor() {
        this.allData = [];
        this.chart = new TSSChart(document.getElementById('tssChart').getContext('2d'));

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
                date: item.date,
                tss: item.tss || 0
            }));

            this.processData();
        } catch (error) {
            console.error('Error loading training data:', error);
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
        const filteredTssValues = filteredData.map(row => parseFloat(row.tss));

        const minValue = 0;
        const maxValue = Math.ceil(Math.max(...filteredTssValues) / 10) * 10;

        // Crea il grafico con i dati filtrati
        this.chart.createChart(filteredDates, filteredTssValues, minValue, maxValue);
    }

    updateChart() {
        this.processData();
    }
}

// Made with Bob
