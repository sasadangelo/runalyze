export class DurationWeeklyChart {
    constructor(ctx) {
        this.ctx = ctx;
        this.chart = null;
    }

    createChart(weekStarts, durations) {
        const data = {
            labels: weekStarts,
            datasets: [
                {
                    label: 'Weekly Duration',
                    data: durations,
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
                            text: 'Duration (min)'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Weekly Volume (Duration)',
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

// Made with Bob
