import { TLChart } from './tl-chart.js';

export class TLApp {
    constructor() {
        this.allData = [];
        this.chart = new TLChart(document.getElementById('tlChart').getContext('2d'));

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
            console.error('Error loading training data for TL:', error);
        }
    }

    processData() {
        if (this.allData.length === 0) return;

        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        // Filter data by date range
        const filteredData = this.allData.filter(row => {
            const date = new Date(row.date);
            return date >= new Date(startDate) && date <= new Date(endDate);
        });

        const filteredDates = filteredData.map(row => row.date);
        const filteredTSSValues = filteredData.map(row => parseFloat(row.tss));

        let ctlValues = [0];
        let atlValues = [0];
        let tlValues = [0];

        for (let i = 1; i < filteredTSSValues.length; i++) {
            const tss = filteredTSSValues[i];
            const previousCTL = ctlValues[i - 1];
            const previousATL = atlValues[i - 1];

            const ctl = (tss * (1 - Math.exp(-1 / 42))) + (previousCTL * Math.exp(-1 / 42));
            const atl = (tss * (1 - Math.exp(-1 / 7))) + (previousATL * Math.exp(-1 / 7));
            const tl = ctl !== 0 ? atl / ctl : 0;

            ctlValues.push(ctl);
            atlValues.push(atl);
            tlValues.push(tl);
        }

        this.chart.createChart(filteredDates, tlValues);
    }

    updateChart() {
        this.processData();
    }
}
