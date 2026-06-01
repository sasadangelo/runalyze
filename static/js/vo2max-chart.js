export class VO2MaxChart {
    constructor(ctx) {
        this.ctx = ctx;
        this.chart = null;
    }

    createChart(dates, vo2maxValues, minValue, maxValue) {
        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(this.ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        type: 'line',
                        label: 'VO2max',
                        data: vo2maxValues,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderWidth: 2,
                        fill: true,
                        pointRadius: 3,
                        pointHoverRadius: 5
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: false,
                        min: minValue,
                        max: maxValue
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

// Made with Bob
