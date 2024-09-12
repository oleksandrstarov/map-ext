function setParam(key, value) {
    window.customParams = { [key]: value }
}

chrome.runtime.onMessage.addListener((message) => {

    if(message.action === 'load_map') {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.scripting.executeScript({
                target : {tabId : tabs[0].id},
                func : setParam,
                args: ['course', false ]
            }).then(() => callScript(tabs[0].id))
        })

    }

    if(message.action === 'load_course') {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.scripting.executeScript({
                target : {tabId : tabs[0].id},
                func : setParam,
                args: ['course', true ]
            }).then(() => callScript(tabs[0].id))
        })

    }
})



async function callScript(id) {
    return chrome.scripting.executeScript({
        target: { tabId: id },
        files: ["scripts/content.js"]
    });
}