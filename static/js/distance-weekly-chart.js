export class DistanceWeeklyChart {
    constructor(ctx) {
        this.ctx = ctx;
        this.chart = null;
    }

    createChart(weekStarts, distances) {
        const data = {
            labels: weekStarts,
            datasets: [
                {
                    label: 'Weekly Volume',
                    data: distances,
                    backgroundColor: 'rgba(128, 193, 191, 0.7)',
                    borderColor: 'rgba(128, 193, 191, 0.7)',
                    borderWidth: 1
                }
            ]
        };

        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(this.ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'week'
                        },
                        title: {
                            display: true,
                            text: 'Week'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Distance (km)'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Weekly Volume (Km)',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                }
            }
        });
    }
}
