import { TLChart } from './tl-chart.js';
import { Data } from './data.js';

export class TLApp {
    constructor() {
        this.allData = [];
        this.chart = new TLChart(document.getElementById('tlChart').getContext('2d'));

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
