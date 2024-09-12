document
    .querySelector('#btn-save-map')
    .addEventListener('click', handleMapLoad);

document
    .querySelector('#btn-save-course')
    .addEventListener('click', handleCourseLoad);

async function handleMapLoad() {
    chrome.runtime.sendMessage({ action: 'load_map' })
}

async function handleCourseLoad() {
    chrome.runtime.sendMessage({ action: 'load_course' })
}