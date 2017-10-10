'use strict';

let runningTimer = false;
let shapeName = 'triangle';

const SHAPES = { };
const PAUSE = 30;
const POINTS_PER_TICK = 100;

let canvas, ctx;
let currentPoint;
let currentShape;

let isSimpleDrawing = true;
let isSimpleConstruction = true;

// const counters = [];
let counter;

function addShape( name, vertexCount, startAngle = 0 ) {

    startAngle = startAngle * Math.PI / 180;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const size = Math.min( cx, cy ) * 0.9;

    SHAPES[ name ] = Array( vertexCount ).join().split(',').map( (_, index) => {
        const angle = startAngle + index / vertexCount * 2 * Math.PI;
        const x = size * Math.sin( angle );
        const y = size * Math.cos( angle );
        return {
            x: cx + x,
            y: cy - y,
        };
    });
}

function addPoints( points ) {
    const ctxData = ctx.getImageData( 0, 0, canvas.width, canvas.height );

    points.forEach( point => {
        if (isSimpleDrawing) {
            drawPointSimple( ctxData, point.x, point.y );
        }
        else {
            drawPoint( ctxData, point.x, point.y );

            const x = Math.floor( point.x );
            const y = Math.floor( point.y );

            for (let i = -0.5; i < 0.5; i += 0.5) {
                for (let j = -0.5; j < 0.5; j += 0.5) {
                    const x_ = Math.floor( point.x + i );
                    const y_ = Math.floor( point.y + j );
                    if (x_ !== x || y_ !== y) {
                        drawPoint( ctxData, x_, y_ );
                    }
                }
            }
        }
    });

    ctx.putImageData( ctxData, 0, 0 );
}

function drawPoint( ctxData, x, y ) {
    const ix = Math.floor( x );
    const iy = Math.floor( y );
    const dx = x - ix - 0.5;
    const dy = y - iy - 0.5;
    const dist = Math.sqrt( dx * dx + dy * dy );

    const byteOffset = 4 * (iy * canvas.width + ix);

    const c = Math.floor( 255 * dist );
    ctxData.data[ byteOffset + 0 ] = ctxData.data[ byteOffset + 0 ] & c;
    ctxData.data[ byteOffset + 1 ] = ctxData.data[ byteOffset + 1 ] & c;
    ctxData.data[ byteOffset + 2 ] = ctxData.data[ byteOffset + 2 ] & c;
    ctxData.data[ byteOffset + 3 ] = 255;
}

function drawPointSimple( ctxData, x, y ) {
    const ix = Math.floor( x );
    const iy = Math.floor( y );
    const byteOffset = 4 * (iy * canvas.width + ix);

    ctxData.data[ byteOffset + 0 ] = 0;
    ctxData.data[ byteOffset + 1 ] = 0;
    ctxData.data[ byteOffset + 2 ] = 0;
    ctxData.data[ byteOffset + 3 ] = 255;
}

function addNextPoints( count ) {
    const points = [];

    for (let i = 0; i < count; i++) {
        const vertexIndex = Math.floor( Math.random() * currentShape.length );
        const vertex = currentShape[ vertexIndex ];
        const dx = currentPoint.x - vertex.x;
        const dy = currentPoint.y - vertex.y;

        const li = isSimpleConstruction ?
                currentShape.length - 1 :
                1 + Math.ceil( Math.random() * (currentShape.length - 2) );

        currentPoint = {
            x: vertex.x + dx / li,
            y: vertex.y + dy / li,
        };

        points.push( currentPoint );
    }

    addPoints( points );

    // increase( counters[ vertexIndex ] );
    increase( counter, count );
}

function increase( el, count ) {
    el.textContent = ( count + +el.textContent ) + '';
}

function tick() {
    addNextPoints( POINTS_PER_TICK );
    if (runningTimer) {
        setTimeout( tick, PAUSE );
    };
}

function start( shapeName ) {
    ctx.fillStyle = '#ffc';
    ctx.fillRect( 0, 0, canvas.width, canvas.height );

    currentShape = SHAPES[ shapeName ];
    addPoints( currentShape );

    // for (let i = 0; i < currentShape.length; i++) {
    //     const counter = document.createElement('div');
    //     counter.textContent = '0';
    //     document.body.appendChild(counter);
    //     counters.push( counter );
    // }

    counter = document.querySelector( '#counter' );
    counter.textContent = '0';

    currentPoint = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
    };

    runningTimer = setTimeout( tick, PAUSE );
}

function init() {
    canvas = window.document.querySelector( '#canvas' );
    ctx = canvas.getContext( '2d' );

    addShape( 'triangle', 3 );
    addShape( 'square', 4, 45 );
    addShape( 'pentagon', 5 );
    addShape( 'hexagon', 6 );

    const select = window.document.querySelector( '#shapes' );
    Object.keys( SHAPES ).forEach( key => {
        const option = window.document.createElement( 'option' );
        option.value = key;
        option.textContent = key;
        select.appendChild( option );
    });

    select.addEventListener( 'change', e => {
        start( select[ select.selectedIndex ].value );
        stop.disabled = false;
    });

    const simpleDrawing = window.document.querySelector( '#simple-drawing' );
    simpleDrawing.checked = isSimpleDrawing;
    simpleDrawing.addEventListener( 'change', e => {
        isSimpleDrawing = simpleDrawing.checked;
    });

    const simpleConstruction = window.document.querySelector( '#simple-construction' );
    simpleConstruction.checked = isSimpleConstruction;
    simpleConstruction.addEventListener( 'change', e => {
        isSimpleConstruction = simpleConstruction.checked;
    });

    const stop = window.document.querySelector( '#stop' );
    stop.addEventListener( 'click', e => {
        runningTimer = null;
        stop.disabled = true;
    });

    window.document.addEventListener( 'keyup', e => {
        if ((e.key || e.char) === 'Escape') {
            runningTimer = null;
        }
    });

    start( select[ select.selectedIndex ].value );
}

init();
