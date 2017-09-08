import { addEvent, removeEvent, addEventIfNeeded } from './modules/events';
import { autoRegisterDialog } from './modules/auto-register';
import { createIntervals } from './modules/intervals';
import { emergency, std_message } from './modules/messages';
import { hotSwap } from './modules/hotswap';
import { registerMDEs } from './modules/mde';
import { save, saveEvents, createPost, updateStats } from './modules/reddit';
import { saveIfEnter, _tabEvent, setSign } from './modules/captures';
import { setYoutube } from './modules/youtube';
import { showTab, createSortable, datetimeSupport, removeLoadingModal } from './modules/ui';
import { speechRecognition } from './modules/annyang';
import { updateCountdown, setLaunchTime, insertTime } from './modules/countdown';

autoRegisterDialog();

window.onload = () => {
    createSortable();
    registerMDEs();
    datetimeSupport();
    createIntervals();
};

document.onreadystatechange = () => {
    if(document.readyState === 'complete') {
        speechRecognition();
        removeLoadingModal();
    }
};
