const { Canvas } = require('canvas');

const cnvs = require('canvas');

/**
 * 
 * @param {import('canvas').NodeCanvasRenderingContext2DSettings} ctx Canvas Context
 * @param {cnvs.Canvas} canvas Canvas
 * @param {String} text Caps text
 * @param {Number} textAreaHeight Red area, caps area height
 */
exports.createCaps = (ctx, canvas, text, textAreaHeight) => {
    
    let highfont = 100
    let lowfont = 15
    let fontsize 
    let returnlines = []

    for (let size = highfont; size > lowfont; size -= 2) {
        ctx.font = `bold ${size}px arial`
        if (ctx.measureText(text).width > canvas.width) {
            let lines = getLines(ctx, text, canvas.width)
            let gapsize = Math.round(size * 1.3) // 30% of font pixel is line height
            let totalfontheight = gapsize * lines.length

            if (totalfontheight <= textAreaHeight) {
                fontsize = size
                returnlines = lines
                break;
            }
        } else {
            fontsize = size
            returnlines = [text]
            break;
        }
    }
    return {
        fontsize,
        returnlines
    }
}


function getLines(ctx, text, maxWidth) {
    var words = text.split(" ");
    var lines = [];
    var currentLine = words[0];

    for (var i = 1; i < words.length; i++) {
        var word = words[i];
        var width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}