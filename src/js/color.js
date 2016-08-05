var Color = (function () {

    var module = {};

    module.parseHex = function (hex) {

        if (hex[0] == '#') {
            hex = hex.slice(1);
        }

        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });

        return hex;
    }

    module.hexToRgb = function (hex) {

        hex = module.parseHex(hex);

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : false;
    }

    module.luminance = function (rgbColor) {
        var a = [rgbColor.r, rgbColor.g, rgbColor.b].map(function(v) {
            v /= 255;
            return (v <= 0.03928) ?
                v / 12.92 :
                Math.pow( ((v+0.055)/1.055), 2.4 );
            });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }

    module.isValid = function (str) {
        return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(str);
    }

    module.ratio = function (foreground, background) {

        if (foreground && background) {

            var rgb1 = module.hexToRgb(foreground);
            var rgb2 = module.hexToRgb(background);

            if (rgb1 == rgb2) {
                return false;
            }

            if (!rgb1 || !rgb2) {
                return false;
            }

            var lum1 = module.luminance(rgb1);
            var lum2 = module.luminance(rgb2);

            var ratio = (Math.max(lum1, lum2) + 0.05)/(Math.min(lum1, lum2) + 0.05);

            return Math.round(ratio * 100) / 100;

        } else {

            return false;

        }
    }

    module.wcag = function (foreground, background) {
        if (module.ratio(foreground, background) >= 4.5) {
            return true;
        } else {
            return false;
        }
    }

    module.lighten = function (color, amount) {
            
        color = module.parseHex(color);

        var number = parseInt(color, 16);
     
        var red = (number >> 16) + amount;
     
        if (red > 255) red = 255;
        else if  (red < 0) red = 0;
     
        var blue = ((number >> 8) & 0x00FF) + amount;
     
        if (blue > 255) blue = 255;
        else if  (blue < 0) blue = 0;
     
        var green = (number & 0x0000FF) + amount;
     
        if (green > 255) green = 255;
        else if (green < 0) green = 0;
     
        return '#' + String('000000' + (green | (blue << 8) | (red << 16)).toString(16)).slice(-6);
      
    }

    module.lightest = function (fixedColor, lightenColor) {

        fixedColor = module.parseHex(fixedColor);
        lightenColor = module.parseHex(lightenColor);

        var colorArray = [];
        var i = 1;

        do {
            lightenColor = module.lighten(lightenColor, i);
            colorArray.unshift(lightenColor);
            i+=.005;
        } while (module.ratio(fixedColor, lightenColor) >= 4.5 && i < 10);

        return colorArray[1];        
    }

    module.darkest = function (fixedColor, darkenColor) {
        
        fixedColor = module.parseHex(fixedColor);
        darkenColor = module.parseHex(darkenColor);

        var colorArray = [];
        var i = 1;

        do {
            darkenColor = module.lighten(darkenColor, i);
            colorArray.unshift(darkenColor);
            i-=.005;
        } while (module.ratio(fixedColor, darkenColor) >= 4.5 && i > -10);

        return colorArray[0];
    }

    return module;

})();