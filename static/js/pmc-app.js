import { PMCChart } from './pmc-chart.js';

export class PMCApp {
    constructor() {
        this.allData = [];
        this.chart = new PMCChart(document.getElementById('pmcChart').getContext('2d'));

        // Load data from API
        this.loadData();

        document.getElementById('startDate').addEventListener('change', () => this.processData());
        document.getElementById('endDate').addEventListener('change', () => this.processData());
    }

    async loadData() {
        try {
            // Fetch only running activities for PMC calculation
            const response = await fetch('/api/training?activity_type=running');
            const data = await response.json();

            this.allData = data.map(item => ({
                date: item.date.split(' ')[0],  // Extract only date part (YYYY-MM-DD)
                tss: item.tss || 0
            }));

            console.log(`Loaded ${this.allData.length} running activities for PMC`);

            this.processData();
        } catch (error) {
            console.error('Error loading training data for PMC:', error);
        }
    }

    processData() {
        if (this.allData.length === 0) {
            console.log('No data to process');
            return;
        }

        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        console.log(`Processing data from ${startDate} to ${endDate}`);

        // Sort all data by date to ensure chronological order
        const sortedData = [...this.allData].sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        );

        console.log(`First activity: ${sortedData[0].date}, TSS: ${sortedData[0].tss}`);
        console.log(`Last activity: ${sortedData[sortedData.length - 1].date}, TSS: ${sortedData[sortedData.length - 1].tss}`);

        // Create a map of date -> TSS for quick lookup
        // Sum TSS values if there are multiple activities on the same day
        const tssMap = new Map();
        sortedData.forEach(row => {
            const date = row.date;
            const tss = parseFloat(row.tss) || 0;
            const currentTss = tssMap.get(date) || 0;
            tssMap.set(date, currentTss + tss);
        });

        console.log(`TSS map has ${tssMap.size} days with activities`);

        // Find the date range for all data
        const firstDate = new Date(sortedData[0].date);
        const lastDate = new Date(sortedData[sortedData.length - 1].date);

        // Create a complete daily series (including rest days with TSS=0)
        const allCalculations = [];
        let ctl = 0;
        let atl = 0;

        const currentDate = new Date(firstDate);
        while (currentDate <= lastDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const tss = tssMap.get(dateStr) || 0;

            // Exponential moving average formulas
            // CTL (Chronic Training Load) - 42 day exponential moving average
            ctl = (tss * (1 - Math.exp(-1 / 42))) + (ctl * Math.exp(-1 / 42));

            // ATL (Acute Training Load) - 7 day exponential moving average
            atl = (tss * (1 - Math.exp(-1 / 7))) + (atl * Math.exp(-1 / 7));

            // TSB (Training Stress Balance) = CTL - ATL
            const tsb = ctl - atl;

            allCalculations.push({
                date: dateStr,
                tss: tss,
                ctl: ctl,
                atl: atl,
                tsb: tsb
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        console.log(`Created ${allCalculations.length} daily calculations`);
        console.log(`Last calculation - CTL: ${allCalculations[allCalculations.length - 1].ctl.toFixed(1)}, ATL: ${allCalculations[allCalculations.length - 1].atl.toFixed(1)}, TSB: ${allCalculations[allCalculations.length - 1].tsb.toFixed(1)}`);

        // Now filter only for display based on date range
        const filteredCalculations = allCalculations.filter(item => {
            const date = new Date(item.date);
            return date >= new Date(startDate) && date <= new Date(endDate);
        });

        console.log(`Filtered to ${filteredCalculations.length} days for display`);

        // Extract arrays for chart
        const dates = filteredCalculations.map(item => item.date);
        const tssValues = filteredCalculations.map(item => item.tss);
        const ctlValues = filteredCalculations.map(item => item.ctl);
        const atlValues = filteredCalculations.map(item => item.atl);
        const tsbValues = filteredCalculations.map(item => item.tsb);

        console.log(`Chart data - dates: ${dates.length}, CTL range: ${Math.min(...ctlValues).toFixed(1)}-${Math.max(...ctlValues).toFixed(1)}`);

        this.chart.createChart(dates, tssValues, ctlValues, atlValues, tsbValues);
    }

    updateChart() {
        this.processData();
    }
}
