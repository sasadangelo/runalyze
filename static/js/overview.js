import './data-utils.js';
import './data.js';
import './hrv-chart.js';
import { HRVApp } from './hrv-app.js';
import './fcr-chart.js';
import { FCRApp } from './fcr-app.js';
import './tss-chart.js';
import { TSSApp } from './tss-app.js';

document.addEventListener('DOMContentLoaded', () => {
    window.hrvApp = new HRVApp();
    window.fcrApp = new FCRApp();
    window.tssApp = new TSSApp();
});
