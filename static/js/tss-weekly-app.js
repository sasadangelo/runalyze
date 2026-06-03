import { TSSWeeklyChart } from './tss-weekly-chart.js';

export class TSSWeeklyApp {
    constructor() {
        this.allData = [];
        this.chart = new TSSWeeklyChart(document.getElementById('tssWeeklyChart').getContext('2d'));

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
            console.error('Error loading training data for TSS Weekly:', error);
        }
    }

    processData() {
        if (this.allData.length === 0) return;

        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        // Calcola i valori settimanali
        const weeklyData = this.calculateWeeklyTSS(startDate, endDate);

        // Crea il grafico con i dati settimanali
        this.chart.createChart(weeklyData.dates, weeklyData.tssValues);
    }

    calculateWeeklyTSS(startDate, endDate) {
        const filteredData = this.allData.filter(row => {
            const date = new Date(row.date);
            return date >= new Date(startDate) && date <= new Date(endDate);
        });

        const weeklyData = {};

        filteredData.forEach(row => {
            const date = new Date(row.date);
            const weekStart = this.getStartOfWeek(date);
            const weekKey = weekStart.toISOString().split('T')[0];

            if (!weeklyData[weekKey]) {
                weeklyData[weekKey] = 0;
            }

            weeklyData[weekKey] += parseFloat(row.tss);
        });

        const dates = Object.keys(weeklyData);
        const tssValues = Object.values(weeklyData);

        return { dates, tssValues };
    }

    getStartOfWeek(date) {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        return new Date(date.setDate(diff));
    }

    updateChart() {
        this.processData();
    }
}
