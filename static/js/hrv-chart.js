export class HRVChart {
    constructor(ctx) {
        this.ctx = ctx;
        this.chart = null;
    }

    createChart(dates, rmssdValues, upperLimits, lowerLimits, movingAvg7, minValue, maxValue) {
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
                        label: 'HRV',
                        data: rmssdValues,
                        backgroundColor: (ctx) => {
                            const index = ctx.dataIndex;
                            const value = ctx.dataset.data[index];
                            const lowerLimit = lowerLimits[index];

                            // Se il lower limit non è ancora calcolato, mostra in grigio
                            if (lowerLimit === null || lowerLimit === undefined || isNaN(lowerLimit) || !isFinite(lowerLimit)) {
                                return 'rgba(169, 169, 169, 0.7)'; // grigio per dati insufficienti
                            }

                            if (value >= lowerLimit) {
                                return 'rgba(128, 193, 191, 0.7)'; // verde: nel range normale
                            } else if ((value < lowerLimit && value >= lowerLimit * 0.9)) {
                                return 'rgba(246, 222, 130, 0.7)'; // giallo: entro il 10% del limite
                            } else if ((value < lowerLimit * 0.9)) {
                                return 'rgba(220, 103, 101, 0.7)'; // rosso: fuori del 10% del limite
                            }

                            // Fallback per casi non gestiti
                            return 'rgba(169, 169, 169, 0.7)';
                        },
                    },
                    {
                        type: 'line',
                        label: 'Upper Limit',
                        data: upperLimits,
                        borderColor: 'rgba(64, 124, 182, 0.2)',
                        borderWidth: 1,
                        fill: -1,
                        backgroundColor: 'rgba(64, 124, 182, 0.2)',
                        pointRadius: 0,
                        pointHoverRadius: 0
                    },
                    {
                        type: 'line',
                        label: 'Lower Limit',
                        data: lowerLimits,
                        borderColor: 'rgba(64, 124, 182, 0.2)',
                        borderWidth: 1,
                        fill: +1,
                        backgroundColor: 'rgba(64, 124, 182, 0.2)',
                        pointRadius: 0,
                        pointHoverRadius: 0
                    },
                    {
                        type: 'line',
                        label: 'Trend(7-Days)',
                        data: movingAvg7,
                        borderColor: 'rgba(64, 124, 182, 0.8)',
                        borderWidth: 1,
                        fill: false,
                        backgroundColor: 'rgba(64, 124, 182, 0.8)',
                        pointRadius: 0,
                        pointHoverRadius: 3
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
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
