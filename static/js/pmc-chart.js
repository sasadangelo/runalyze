export class PMCChart {
    constructor(ctx) {
        this.ctx = ctx;
        this.chart = null;
    }

    createChart(dates, tssValues, ctlValues, atlValues, tsbValues) {
        const data = {
            labels: dates,
            datasets: [
                {
                    label: 'CTL (Fitness)',
                    data: ctlValues,
                    borderColor: 'rgba(64, 124, 182, 0.7)',
                    backgroundColor: 'rgba(64, 124, 182, 0.7)',
                    borderWidth: 2,
                    fill: false,
                    type: 'line',
                    pointRadius: 0,
                    pointHoverRadius: 3
                },
                {
                    label: 'ATL (Fatigue)',
                    data: atlValues,
                    borderColor: 'rgba(220, 103, 101, 0.7)',
                    backgroundColor: 'rgba(220, 103, 101, 0.7)',
                    borderWidth: 2,
                    fill: false,
                    type: 'line',
                    pointRadius: 0,
                    pointHoverRadius: 3
                },
                {
                    label: 'TSB (Form)',
                    data: tsbValues,
                    borderColor: 'rgba(246, 222, 130, 0.7)',
                    backgroundColor: 'rgba(246, 222, 130, 0.7)',
                    borderWidth: 2,
                    fill: false,
                    type: 'line',
                    pointRadius: 0,
                    pointHoverRadius: 3
                },
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
                            unit: 'day'
                        },
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Score'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Performance Management Chart (PMC)',
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
                    },
                    annotation: {
                        annotations: {
                            // ATL Optimal Zone (0-40)
                            atlGreen: {
                                type: 'box',
                                yMin: 0,
                                yMax: 40,
                                backgroundColor: 'rgba(128, 193, 191, 0.15)',
                                borderWidth: 0,
                                label: {
                                    display: true,
                                    content: 'ATL Optimal (0-40)',
                                    position: {
                                        x: 'start',
                                        y: 'start'
                                    },
                                    color: 'rgba(64, 124, 182, 0.8)',
                                    font: {
                                        size: 11
                                    }
                                }
                            },
                            // TSB Optimal Zone (-20 to -10)
                            tsbGreen: {
                                type: 'box',
                                yMin: -20,
                                yMax: -10,
                                backgroundColor: 'rgba(128, 193, 191, 0.15)',
                                borderWidth: 0,
                                label: {
                                    display: true,
                                    content: 'TSB Optimal (-20 to -10)',
                                    position: {
                                        x: 'start',
                                        y: 'end'
                                    },
                                    color: 'rgba(64, 124, 182, 0.8)',
                                    font: {
                                        size: 11
                                    }
                                }
                            }
                        }
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
