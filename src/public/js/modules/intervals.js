import { updateCountdown } from './countdown';

/**
 * initialize any intervals that are needed
 */
window.addEventListener('load', () => {
    // update countdown every second
    window.countdown = setInterval(updateCountdown, 1000);
    window.countdown_interval = 1000;
});
