(function (params) {
    'use strict';
    // fetch class info

    const classId = new URL(window.location)
        .searchParams.get('classId');

    if(!classId) {
        console.error('Malformed url, no ClassId parameter found');
        return;
    }

    fetch('https://www.livelox.com/Data/ClassInfo', {
        method: 'POST',
        body: JSON.stringify({
            eventId: null,
            classIds: [classId],
            courseIds:[],
            relayLegs:[],
            relayLegGroupIds:[]
        }),
        headers: {
            'content-type': 'application/json',
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'x-requested-with': 'XMLHttpRequest'
        }
    })
        .then((res) => res.json())
        .then((data) => data.general.classBlobUrl)
        .then((url) => url ? fetch(url): loadClassBlob([classId]))
        .then(res => res.json())
        .then(mapData => loadMapData(mapData));

})()

async function loadClassBlob(classIds) {
    return fetch('https://www.livelox.com/Data/ClassBlob', {
        method: 'POST',
        body: JSON.stringify(
            {
                eventId: null,
                classIds: classIds,
                courseIds: null,
                relayLegs: [],
                relayLegGroupIds: [],
                routeReductionProperties: { distanceTolerance: 1, speedTolerance: 0.1 },
                includeMap: true,
                includeCourses: true,
                skipStoreInCache: false
            }),
        headers: {
            'content-type': 'application/json',
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'x-requested-with': 'XMLHttpRequest'
        }
    })
}

async function loadMapData(mapData) {
    console.log(mapData);
    if(!mapData) {
        console.error('No map data found!');
        return;
    }

    const isCourseRequired = !!window['customParams']?.['course'];
    //console.log(isCourseRequired);

    const tilesData = mapData.tileData.mapTileInfo.mapTiles;

    const isProxyRequired = !tilesData[0].url.startsWith('https://livelox.blob.core.windows.net/');

    let images = [];
//https://www.livelox.com/Viewer/OLGY-Rally-OL/Rally-OL?classId=837892&tab=player
    if (isProxyRequired) {

        const proxied = await Promise.all(tilesData.map(({ url }) => {
            ////
                    /// local: http://localhost:3000/api/proxy
                    /// deployed: https://next-lyart-rho.vercel.app/api/proxy
            ////
            return fetch('https://next-lyart-rho.vercel.app/api/proxy', { method: 'POST', body: JSON.stringify({ url })}).then(res => res.blob());
        }));

        images = await Promise.all(proxied.map((data) => {
            // load all images from our proxy
            return new Promise((resolve) => {
                const img = new Image();
                //
                img.onload = () => resolve(img);
                img.src = URL.createObjectURL(data);
            });
        }));

    } else {
        images = await Promise.all(tilesData.map(({ url }) => {
            // load all images directly from hosting
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.crossOrigin="anonymous";
                img.src = url;
            });
        }));
    }

    const canvas = document.createElement('canvas');
    canvas.width = mapData.map.width;
    canvas.height = mapData.map.height;

    // draw images to the canvas
    const ctx = canvas.getContext('2d');

    images.forEach((image, index) => {
        ctx.drawImage(image, tilesData[index].x, tilesData[index].y);
    })

    const w = window.open('about:blank');
    const image = new Image();
    image.src = canvas.toDataURL('image/png');

    w.document.querySelector('body').appendChild(image);
}