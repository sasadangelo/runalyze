import { PMCChart } from './pmc-chart.js';
import { Data } from './data.js';

export class PMCApp {
    constructor() {
        this.allData = [];
        this.chart = new PMCChart(document.getElementById('pmcChart').getContext('2d'));

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

        const filteredData = this.allData.filterByDateRange(startDate, endDate);
        const dates = filteredData.map(row => row.date);
        const tssValues = filteredData.map(row => parseFloat(row.tss));

        let ctl = 0;
        let atl = 0;
        let tsb = 0;

        const ctlValues = [];
        const atlValues = [];
        const tsbValues = [];

        tssValues.forEach((tss, index) => {
            ctl = (tss * (1 - Math.exp(-1 / 42))) + (ctl * Math.exp(-1 / 42));
            atl = (tss * (1 - Math.exp(-1 / 7))) + (atl * Math.exp(-1 / 7));
            tsb = ctl - atl;

            ctlValues.push(ctl);
            atlValues.push(atl);
            tsbValues.push(tsb);
        });

        this.chart.createChart(dates, tssValues, ctlValues, atlValues, tsbValues);
    }

    updateChart() {
        this.processData();
    }
}
