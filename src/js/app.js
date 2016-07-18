'use strict';

var app = angular.module('howlight', []);

app.controller('AppCtrl', function ($scope, $rootScope, $timeout, Color) {

    $scope.input = {
        background: '#FFF',
        text: '#000',
        size: 10,
        isBold: false
    };

    $scope.isBoldArray = [
        { text: 'is', value: true }, 
        { text: 'is not', value: false }
    ];

    $scope.output = false;

    $scope.compute = function () {

        if (typeof $scope.input.background == 'undefined' || typeof $scope.input.text == 'undefined' || isNaN(parseInt($scope.input.size))) {
            return false;
        }

        // Add # to front of background color
        if ($scope.input.background.length > 1 && $scope.input.background[0] != '#') {
            $scope.input.background = '#' + $scope.input.background;
        }

        // Add # to front of text color
        if ($scope.input.text.length > 1 && $scope.input.text[0] != '#') {
            $scope.input.text = '#' + $scope.input.text;
        }

        function isValidColor(str) {
            return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(str);
        }

        if (!isValidColor($scope.input.background) || !isValidColor($scope.input.text)) {
            $scope.output = false;
            return false;
        }

        $scope.output = {
            ratio: Color.ratio($scope.input.background, $scope.input.text),
            lightest: Color.lightest($scope.input.background, $scope.input.text),
            darkest: Color.darkest($scope.input.text, $scope.input.background),
        }

        //     $scope.calc.ratio = Color.ratio($scope.calc.background, $scope.calc.text);
        //     $scope.calc.lightest = Color.lightest($scope.calc.background, $scope.calc.text);
        //     $scope.calc.lightestRatio = Color.ratio($scope.calc.background, Color.lightest($scope.calc.background, $scope.calc.text));
        // }
    };

    $scope.wcag = function () {

        var bold = $scope.input.isBold;
        var ratio = parseInt($scope.output.ratio);
        var size = parseInt($scope.input.size);
        var large = false;

        if (bold && size >= 18.66) {
            large = true;
        } else if (size >= 24) {
            large = true;
        } else {
            large = false;
        }

        console.log(ratio);

        if (large) {
            if (ratio < 3) {
                return false;
            } else if (ratio >= 3 && ratio < 4.5) {
                return 'AA';
            } else {
                return 'AAA';
            }
        } else {
            if (ratio < 4.5) {
                return false;
            } else if (ratio >= 4.5 && ratio < 7) {
                return 'AA';
            } else {
                return 'AAA';
            }
        }
    }

    $scope.compute();

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

    module.lightest = function (fixedColor, lightenColor) {

        fixedColor = parseHex(fixedColor);
        lightenColor = parseHex(lightenColor);

        var colorArray = [];
        var i = 1;

        do {
            lightenColor = module.lighten(lightenColor, i);
            colorArray.unshift(lightenColor);
            // console.log(i, lightenColor);
            i+=.001;
        } while (module.ratio(fixedColor, lightenColor) >= 4.5 && i < 10);

        return colorArray[1];        
    }

    module.darkest = function (fixedColor, darkenColor) {
        
        fixedColor = parseHex(fixedColor);
        darkenColor = parseHex(darkenColor);

        var colorArray = [];
        var i = 1;

        console.log('y');

        do {
            darkenColor = module.lighten(darkenColor, i);
            colorArray.unshift(darkenColor);
            console.log(i, darkenColor);
            i-=.001;
        } while (module.ratio(fixedColor, darkenColor) >= 4.5 && i > -10);

        return colorArray[0];
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