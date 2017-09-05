import { autoRegisterDialog } from './modules/auto-register';
import { save, saveEvents, createPost, updateStats } from './modules/reddit';
import { addEvent, removeEvent, addEventIfNeeded } from './modules/events';
import { updateCountdown, setLaunchTime, insertTime } from './modules/countdown';
import { showTab, createSortable, datetimeSupport } from './modules/ui';
import { emergency, std_message } from './modules/messages';
import { removeLoadingModal } from './modules/loading-modal';
import { saveIfEnter, _tabEvent, setSign } from './modules/captures';
import { hotSwap } from './modules/hotswap.js';
import { createIntervals } from './modules/intervals';
import { registerMDEs } from './modules/mde';
import { setYoutube } from './modules/youtube';

autoRegisterDialog();

window.onload = () => {
    createSortable();
    registerMDEs();
    datetimeSupport();
    createIntervals();
};

document.onreadystatechange = () => {
    if(document.readyState === 'complete')
        removeLoadingModal();
};
