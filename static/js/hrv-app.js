import { HRVChart } from './hrv-chart.js';
import { DataUtils } from './data-utils.js';

export class HRVApp {
    constructor() {
        console.log('HRVApp constructor called');
        this.allData = [];
        this.chart = new HRVChart(document.getElementById('hrvChart').getContext('2d'));

        // Load data from API
        this.loadData();

        document.getElementById('startDate').addEventListener('change', () => this.processData());
        document.getElementById('endDate').addEventListener('change', () => this.processData());
    }

    async loadData() {
        try {
            console.log('Loading HRV data from API...');
            // Fetch all HRV data without date filters to get complete dataset
            const response = await fetch('/api/hrv');
            const data = await response.json();
            console.log('HRV data loaded:', data.length, 'records');

            this.allData = data.map(item => ({
                date: item.date,
                rmssd: item.hrv
            }));

            this.processData();
        } catch (error) {
            console.error('Error loading HRV data:', error);
        }
    }

    processData() {
        console.log('HRVApp processData called, data length:', this.allData.length);
        if (this.allData.length === 0) {
            console.log('No data to process yet');
            return;
        }

        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        console.log('Processing data for date range:', startDate, 'to', endDate);

        // Calcola i valori per l'intera serie storica
        const allDates = this.allData.map(row => row.date);
        const allRmssdValues = this.allData.map(row => parseFloat(row.rmssd));

        const utils = new DataUtils(allRmssdValues);
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

        const minValue = Math.floor(Math.min(...allRmssdValues, ...validAllLowerLimits) / 5) * 5;
        const maxValue = Math.ceil(Math.max(...allRmssdValues, ...validAllUpperLimits) / 5) * 5;

        // Filtra i dati per il range di date specificato
        const filteredData = this.allData.filter(row => {
            const date = new Date(row.date);
            return date >= new Date(startDate) && date <= new Date(endDate);
        });

        const filteredDates = filteredData.map(row => row.date);
        const filteredRmssdValues = filteredData.map(row => parseFloat(row.rmssd));

        // Filtra i valori della media mobile e dei limiti per il range di date specificato
        const startIndex = allDates.indexOf(filteredDates[0]);
        const endIndex = allDates.indexOf(filteredDates[filteredDates.length - 1]) + 1;

        const filteredMovingAvg7 = allMovingAvg7.slice(startIndex, endIndex);
        const filteredUpperLimits = allUpperLimits.slice(startIndex, endIndex);
        const filteredLowerLimits = allLowerLimits.slice(startIndex, endIndex);

        // Crea il grafico con i dati filtrati
        this.chart.createChart(filteredDates, filteredRmssdValues, filteredUpperLimits, filteredLowerLimits, filteredMovingAvg7, minValue, maxValue);
    }

    updateChart() {
        this.processData();
    }
}

// Made with Bob
