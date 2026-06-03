import { FCRChart } from './fcr-chart.js';
import { DataUtils } from './data-utils.js';

export class FCRApp {
    constructor() {
        this.allData = [];
        this.chart = new FCRChart(document.getElementById('fcrChart').getContext('2d'));

        // Load data from API
        this.loadData();

        document.getElementById('startDate').addEventListener('change', () => this.processData());
        document.getElementById('endDate').addEventListener('change', () => this.processData());
    }

    async loadData() {
        try {
            // Fetch all resting HR data without date filters to get complete dataset
            const response = await fetch('/api/resting-hr');
            const data = await response.json();

            this.allData = data.map(item => ({
                date: item.date,
                fcr: item.resting_hr
            }));

            this.processData();
        } catch (error) {
            console.error('Error loading resting HR data:', error);
        }
    }

    processData() {
        if (this.allData.length === 0) return;

        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        // Calcola i valori per l'intera serie storica
        const allDates = this.allData.map(row => row.date);
        const allFcrValues = this.allData.map(row => parseFloat(row.fcr));

        const utils = new DataUtils(allFcrValues);
        const allMovingAvg7 = utils.movingAverage(7);
        const allMovingAvg30 = utils.movingAverage(30);
        const allMovingStdDev30 = utils.movingStandardDeviation(30);

        const allUpperLimits = allMovingAvg30.map((avg, index) => {
            const stdDev = allMovingStdDev30[index];
            return avg !== null && stdDev !== null ? avg + stdDev : null;
        });

        const allLowerLimits = allMovingAvg30.map((avg, index) => {
            const stdDev = allMovingStdDev30[index];
            return avg !== null && stdDev !== null ? avg - stdDev : null;
        });

        const validAllLowerLimits = allLowerLimits.filter(value => value !== null);
        const validAllUpperLimits = allUpperLimits.filter(value => value !== null);

        const minValue = Math.floor(Math.min(...allFcrValues, ...validAllLowerLimits) / 5) * 5;
        const maxValue = Math.ceil(Math.max(...allFcrValues, ...validAllUpperLimits) / 5) * 5;

        // Filtra i dati per il range di date specificato
        const filteredData = this.allData.filter(row => {
            const date = new Date(row.date);
            return date >= new Date(startDate) && date <= new Date(endDate);
        });

        const filteredDates = filteredData.map(row => row.date);
        const filteredFcrValues = filteredData.map(row => parseFloat(row.fcr));

        // Filtra i valori della media mobile e dei limiti per il range di date specificato
        const startIndex = allDates.indexOf(filteredDates[0]);
        const endIndex = allDates.indexOf(filteredDates[filteredDates.length - 1]) + 1;

        const filteredMovingAvg7 = allMovingAvg7.slice(startIndex, endIndex);
        const filteredUpperLimits = allUpperLimits.slice(startIndex, endIndex);
        const filteredLowerLimits = allLowerLimits.slice(startIndex, endIndex);

        // Crea il grafico con i dati filtrati
        this.chart.createChart(filteredDates, filteredFcrValues, filteredUpperLimits, filteredLowerLimits, filteredMovingAvg7, minValue, maxValue);
    }

    updateChart() {
        this.processData();
    }
}

// Made with Bob
