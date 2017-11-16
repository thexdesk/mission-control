import { updateCountdown } from './countdown';

window.addEventListener('load', () => {
    // update countdown every second
    window.countdown = setInterval(updateCountdown, 1000);
    window.countdown_interval = 1000;
});
