'use strict';

var app = angular.module('howlight', []);

app.controller('AppCtrl', function ($scope, $rootScope, $timeout, Color) {

    $scope.calc = {
        text: '#000000',
        background: '#ffffff',
        ratio: Color.ratio('#ffffff', '#000000'),
        lightest: Color.lightest('#ffffff', '#000000'),
        lightestRatio: Color.ratio('#ffffff', Color.lightest('#ffffff', '#000000'))
    };

    $scope.compute = function () {

        if ($scope.calc.background.length > 1 && $scope.calc.background[0] != '#') {
            $scope.calc.background = '#' + $scope.calc.background;
        }

        var isValidColor = function (str) {
            return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(str);
        }

        console.log(isValidColor($scope.calc.background), isValidColor($scope.calc.text));

        if (isValidColor($scope.calc.background) && isValidColor($scope.calc.text)) {
            $scope.calc.ratio = Color.ratio($scope.calc.background, $scope.calc.text);
            $scope.calc.lightest = Color.lightest($scope.calc.background, $scope.calc.text);
            $scope.calc.lightestRatio = Color.ratio($scope.calc.background, Color.lightest($scope.calc.background, $scope.calc.text));
        }
    };

});

app.service('Color', function ($q, $http, $rootScope) {

    const module = {};

    var parseHex = function (hex) {

        if (hex[0] == '#') {
            hex = hex.slice(1);
        }

        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });

        return hex;
    }

    var hexToRgb = function (hex) {

        hex = parseHex(hex);

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

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

        if (foreground && background) {

            var rgb1 = hexToRgb(foreground);
            var rgb2 = hexToRgb(background);

            if (rgb1 == rgb2) {
                return false;
            }

            if (!rgb1 || !rgb2) {
                return false;
            }

            var lum1 = luminance(rgb1);
            var lum2 = luminance(rgb2);

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
            
        color = parseHex(color);

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

    module.lightest = function (bg, text) {

        bg = parseHex(bg);
        text = parseHex(text);

        console.log(text);

        var colorArray = [];
        var i = 1;

        // Darken text
        if (module.ratio(bg, text) <= 4.5) { 

            do {
                text = module.lighten(text, i);
                colorArray.unshift(text);
                console.log(i, text);
                i-=.01;
            } while (module.ratio(bg, text) <= 4.5 && i > -10);

            return colorArray[0];

        // Lighten text
        } else { 

            do {
                text = module.lighten(text, i);
                colorArray.unshift(text);
                console.log(i, text);
                i+=.01;
            } while (module.ratio(bg, text) >= 4.5 && i < 10);

            return colorArray[1];

        }
        
    }

    return module;

});

// $(function () {

//     var $background = $('#background-color');
//     var $text = $('#text-color');

//     var backgroundVal = $background.val();
//     var textVal = $text.val();

//     $('.preview')[0].style.backgroundColor = backgroundVal;
//     $('#text-val').text(textVal + ' --> ' + textVal);

//     // Should try and find the lightest text color possible
//     $text.on('change paste keyup', function () {

//         textVal = $text.val();

//         if (textVal.length < 7) {
//             return false;
//         }
    
//         var lightestVal = lightestColor(backgroundVal, textVal);
//         $('.preview')[0].style.color = lightestVal;

//         $('#text-val').text(textVal + ' --> ' + lightestVal);

//     });

// });