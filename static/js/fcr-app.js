import { Data } from './data.js';
import { FCRChart } from './fcr-chart.js';
import { DataUtils } from './data-utils.js';

export class FCRApp {
    constructor() {
        this.allData = [];
        this.chart = new FCRChart(document.getElementById('fcrChart').getContext('2d'));

        Papa.parse('./data/fcr_data.csv', {
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

        // Calcola i valori per l'intera serie storica
        const allDates = this.allData.data.map(row => row.date);
        const allFcrValues = this.allData.data.map(row => parseFloat(row.fcr));

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
        const filteredData = this.allData.filterByDateRange(startDate, endDate);
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
