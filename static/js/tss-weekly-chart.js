export class TSSWeeklyChart {
    constructor(ctx) {
        this.ctx = ctx;
        this.chart = null;
    }

    createChart(dates, tssValues) {
        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(this.ctx, {
            type: 'bar',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'Weekly TSS',
                        data: tssValues,
                        borderColor: 'rgba(128, 193, 191, 0.7)',
                        backgroundColor: 'rgba(128, 193, 191, 0.7)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Weekly Volume (TSS)',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'TSS'
                        }
                    }
                }
            },
            plugins: {
                zoom: {
                    zoom: {
                        enabled: true,
                        mode: 'x'
                    },
                    pan: {
                        enabled: true,
                        mode: 'x'
                    }
                }
            }
        });
    }
}
