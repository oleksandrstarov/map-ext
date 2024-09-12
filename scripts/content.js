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
        .then((url) => loadMapData(url))

})()


async function loadMapData(url) {
    if(!url) {
        console.error('No map data url returned!');
        return;
    }

    const mapData = await fetch(url).then(res => res.json());

    if(!mapData) {
        console.error('No map data found!');
        return;
    }

    const isCourseRequired = !!window['customParams']?.['course'];
    //console.log(isCourseRequired);

    const tilesData = mapData.tileData.mapTileInfo.mapTiles;

    const images = await Promise.all(tilesData.map(({ url }) => {
        // load all images
        return new Promise((resolve) => {
            const img = new Image();
            //
            img.onload = () => resolve(img);
            img.crossOrigin="anonymous";
            img.src = url;
        });
    }));

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