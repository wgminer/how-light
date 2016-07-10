'use strict';

var Contrast = (function () {

    var module = {};

    var hexToRgb = function (hex) {

        // Expand shorthand form (e.g. '03F') to full form (e.g. '0033FF')
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;

        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

        // Returns {r: '', g: '', b: ''}
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : false;
    }


    var luminance = function (rgbColor) {
        var a = [rgbColor.r, rgbColor.g, rgbColor.b].map(function(v) {
            v /= 255;
            return (v <= 0.03928) ?
                v / 12.92 :
                Math.pow( ((v+0.055)/1.055), 2.4 );
            });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }

    module.ratio = function (foreground, background) {

        var rgb1 = hexToRgb(foreground);
        var rgb2 = hexToRgb(background);

        if (!rgb1 || !rgb2) {
            return false;
        }

        var lum1 = luminance(rgb1);
        var lum2 = luminance(rgb2);

        var ratio = (Math.max(lum1, lum2) + 0.05)/(Math.min(lum1, lum2) + 0.05);

        return Math.round(ratio * 100) / 100;
    }

    module.wcag = function (foreground, background) {

        if (module.ratio(foreground, background) >= 4.5) {
            return true;
        } else {
            return false;
        }
    }

    return module;

})();

var lighten = function (color, amount) {
  
    var usePound = false;
  
    if (color[0] == '#') {
        color = color.slice(1);
        usePound = true;
    }
 
    var number = parseInt(color,16);
 
    var red = (number >> 16) + amount;
 
    if (red > 255) red = 255;
    else if  (red < 0) red = 0;
 
    var blue = ((number >> 8) & 0x00FF) + amount;
 
    if (blue > 255) blue = 255;
    else if  (blue < 0) blue = 0;
 
    var green = (number & 0x0000FF) + amount;
 
    if (green > 255) green = 255;
    else if (green < 0) green = 0;
 
    return (usePound ? '#' : '') + String('000000' + (green | (blue << 8) | (red << 16)).toString(16)).slice(-6);
  
}

var lightestColor = function (colorFixed, colorLighten) {

    var i = 0;
    var color = colorLighten;
    // console.log(Contrast.wcag(colorFixed, color));

    if  (Contrast.ratio(colorFixed, color) < 4.5) {
        return false;
    }

    do {
        // console.log(Contrast.ratio(colorFixed, color) + ':1');
        i+=.2;
        console.log(i);
        color = lighten(color, i);
    } while (Contrast.ratio(colorFixed, color) > 4.5 && i > -100000 && i < 100000) 

    // console.log(i);
    color = lighten(color, i);

    return color;
}


$(function () {

    var $background = $('#background-color');
    var $text = $('#text-color');

    var backgroundVal = $background.val();
    var textVal = $text.val();

    $('.preview')[0].style.backgroundColor = backgroundVal;
    $('#text-val').text(textVal + ' --> ' + textVal);

    // Should try and find the lightest text color possible
    $text.on('change paste keyup', function () {

        textVal = $text.val();

        if (textVal.length < 7) {
            return false;
        }
    
        var lightestVal = lightestColor(backgroundVal, textVal);
        $('.preview')[0].style.color = lightestVal;

        $('#text-val').text(textVal + ' --> ' + lightestVal);

    });

});