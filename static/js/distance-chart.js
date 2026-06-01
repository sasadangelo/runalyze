export class DistanceChart {
    constructor(ctx) {
        this.ctx = ctx;
        this.chart = null;
    }

    createChart(dates, distanceValues, minValue, maxValue) {
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
                        label: 'Distance (Km)',
                        data: distanceValues,
                        borderColor: 'rgba(128, 193, 191, 0.7)',
                        backgroundColor: 'rgba(128, 193, 191, 0.7)'
                    }
                ]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Daily Distance (Km)',
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
                            text: 'Km'
                        }
                    }
                }
            }
        });
    }
}

// Made with Bob
