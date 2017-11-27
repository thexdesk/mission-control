import {
    speechRecognition
    } from './modules/annyang';
import './modules/auto-register';
import {
    saveIfEnter,
    tabEvent,
    setSign,
    submitRecovery
    } from './modules/captures';
import {
    updateCountdown,
    setLaunchTime,
    insertTime
    } from './modules/countdown';
import {
    addEvent,
    removeEvent,
    addEventIfNeeded
    } from './modules/events';
import {
    get,
    post
    } from './modules/fetchival_wrapper';
import {
    hotSwap
    } from './modules/hotswap';
import './modules/intervals';
import {
    get_interface_side,
    get_tab_shown,
    get_hide_info
    } from './modules/local_storage';
import './modules/mde';
import {
    emergency,
    std_message
    } from './modules/messages';
import {
    save,
    saveEvents,
    createPost
    } from './modules/reddit';
import {
    showTab,
    createSortable,
    datetimeSupport,
    removeLoadingModal
    } from './modules/ui';
import {
    setYoutube
    } from './modules/youtube';

window.onload = () => {
    // we don't need to do any of this on the initialization page
    if(window.location.pathname !== '/init') {
        createSortable();
        datetimeSupport();
    }
};

document.onreadystatechange = () => {
    // we don't need to do any of this on the initialization page
    if(window.location.pathname !== '/init') {
        // don't combine these if statements, since there might be more statements in the future
        if(document.readyState === 'complete') {
            // get some config from local/session storage
            get_interface_side();
            get_tab_shown();

            speechRecognition();
            removeLoadingModal();
        }
    }

    // initialization page only
    else {
        if(document.readyState === 'complete') {
            document.getElementById('recovery').addEventListener('submit', submitRecovery);
        }
    }
};
