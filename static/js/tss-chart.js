export class TSSChart {
    constructor(ctx) {
        this.ctx = ctx;
        this.chart = null;
    }

    createChart(dates, tssValues, minValue, maxValue) {
        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(this.ctx, {
            type: 'bar',
            data: {
                labels: dates,
                datasets: [
                    {
                        type: 'bar',
                        label: 'TSS',
                        data: tssValues,
                        borderColor: 'rgba(128, 193, 191, 0.7)',
                        backgroundColor: 'rgba(128, 193, 191, 0.7)'
                    }
                ]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Training Stress Score (TSS)',
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
                        min: minValue,
                        max: maxValue,
                        title: {
                            display: true,
                            text: 'TSS'
                        }
                    }
                }
            }
        });
    }
}
