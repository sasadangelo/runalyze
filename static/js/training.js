import { DataUtils } from './data-utils.js';
import './data.js';
import './pmc-chart.js';
import { PMCApp } from './pmc-app.js';
import './tss-chart.js';
import { TSSApp } from './tss-app.js';
import './distance-chart.js';
import { DistanceApp } from './distance-app.js';
import './duration-chart.js';
import { DurationApp } from './duration-app.js';
import './tss-weekly-chart.js';
import { TSSWeeklyApp } from './tss-weekly-app.js';
import './tl-chart.js';
import { TLApp } from './tl-app.js';
import './distance-weekly-chart.js';
import { DistanceWeeklyApp } from './distance-weekly-app.js';
import './duration-weekly-chart.js';
import { DurationWeeklyApp } from './duration-weekly-app.js';
import './vo2max-chart.js';
import { VO2MaxApp } from './vo2max-app.js';

console.log('Training.js loaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('Training DOMContentLoaded event fired');

    // Set default dates (90 days back)
    DataUtils.setDefaultDates(90);

    // Initialize all apps (they will load data and process when ready)
    window.pmcApp = new PMCApp();
    window.tssApp = new TSSApp();
    window.distanceApp = new DistanceApp();
    window.durationApp = new DurationApp();
    window.tssWeeklyApp = new TSSWeeklyApp();
    window.tlApp = new TLApp();
    window.distanceWeeklyApp = new DistanceWeeklyApp();
    window.durationWeeklyApp = new DurationWeeklyApp();
    window.vo2maxApp = new VO2MaxApp();
});

// Expose update function globally for the button onclick
window.updateAllCharts = function () {
    console.log('updateAllCharts called');
    if (window.pmcApp) window.pmcApp.updateChart();
    if (window.tssApp) window.tssApp.updateChart();
    if (window.distanceApp) window.distanceApp.updateChart();
    if (window.durationApp) window.durationApp.updateChart();
    if (window.tssWeeklyApp) window.tssWeeklyApp.updateChart();
    if (window.tlApp) window.tlApp.updateChart();
    if (window.distanceWeeklyApp) window.distanceWeeklyApp.updateChart();
    if (window.durationWeeklyApp) window.durationWeeklyApp.updateChart();
    if (window.vo2maxApp) window.vo2maxApp.updateChart();
};
