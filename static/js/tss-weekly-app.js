import { TSSWeeklyChart } from './tss-weekly-chart.js';
import { Data } from './data.js';
import { DataUtils } from './data-utils.js';

export class TSSWeeklyApp {
    constructor() {
        this.allData = [];
        this.chart = new TSSWeeklyChart(document.getElementById('tssWeeklyChart').getContext('2d'));

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

        // Calcola i valori settimanali
        const weeklyData = this.calculateWeeklyTSS(startDate, endDate);

        // Crea il grafico con i dati settimanali
        this.chart.createChart(weeklyData.dates, weeklyData.tssValues);
    }

    calculateWeeklyTSS(startDate, endDate) {
        const filteredData = this.allData.filterByDateRange(startDate, endDate);
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
