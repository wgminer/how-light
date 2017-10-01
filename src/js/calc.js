var Calc = (function () {

    // $scope.input = {
    //     background: '#FFF',
    //     text: '#000',
    //     size: 10,
    //     isBold: false
    // };

    // $scope.isBoldArray = [
    //     { text: 'is', value: true }, 
    //     { text: 'is not', value: false }
    // ];

    var module = {};

    var inputs = {
        background: document.getElementById('input-background'),
        text: document.getElementById('input-text'),
        size: document.getElementById('input-size'),
        bold: document.getElementById('input-bold')
    }

    var copy = {
        background: document.getElementById('input-copy-background'),
        text: document.getElementById('input-copy-text')
    }

    var outputs = {
        ratio: document.getElementById('output-ratio'),
        lightest: document.getElementById('output-lightest'),
        darkest: document.getElementById('output-darkest')
    }

    module.colors = function (background, text, size) {

        if (typeof background == 'undefined' || typeof text == 'undefined' || isNaN(parseInt(size))) {
            return false;
        }

        // Add # to front of background color
        if (background.length > 1 && background[0] != '#') {
            background = '#' + background;
        }

        // Add # to front of text color
        if (text.length > 1 && text[0] != '#') {
            text = '#' + text;
        }

        if (!Color.isValid(background) || !Color.isValid(text)) {
            // $scope.output = false;
            return false;
        }

        return {
            ratio: Color.ratio(background, text),
            lightest: Color.lightest(background, text),
            darkest: Color.darkest(text, background),
        }
    };

    module.compliance = function (ratio, px, isBold) {

        var px = parseInt(px);
        var isBold = isBold || false;

        if (isBold && px >= 18.66) {
            isLargeText = true;
        } else if (px >= 24) {
            isLargeText = true;
        } else {
            isLargeText = false;
        }

        if (isLargeText) {
            if (ratio < 3) {
                return 'None';
            } else if (ratio >= 3 && ratio < 4.5) {
                return 'AA';
            } else {
                return 'AAA';
            }
        } else {
            if (ratio < 4.5) {
                return 'None';
            } else if (ratio >= 4.5 && ratio < 7) {
                return 'AA';
            } else {
                return 'AAA';
            }
        }
    }

    function reset () {
        var hide = [
            'output-result',
            'output-text',
            'output-background',
            'not-compliant',
            'aa-compliant',
            'aaa-compliant',
        ];
        hide.forEach(function (str) {
            document.getElementById(str).style.display = 'none';
        });
    }

    function update () {

        reset();

        var background = inputs.background.value;
        var text = inputs.text.value;
        var size = inputs.size.value;
        var bold = inputs.bold.value === 'true' ? true : false;

        var output = module.colors(background, text, size);   
        var compliance = module.compliance(output.ratio, size, bold);

        if (output && compliance) {
            
            if (compliance === 'None') {
                var complianceStr = 'is not AA or AAA compliant.';
            } else if (compliance === 'AA') {
                var complianceStr = 'is not AA or AAA compliant.';
            } else if (compliance === 'AAA') {
                var complianceStr = 'is AA compliant but is not AAA compliant.';
            }

            var complianceHTML = 'This combination has a contrast ratio of <span class="code">' + output.ratio + ':1</span> and ' + complianceStr;
            var textHTML = 'Given the background color of <span class="code">' + background + '</span>, the lightest text color you can use to remain AA compliant is ' + output.lightest + '.';
            var backgroundHTML = 'Alternatively, you can keep the text color of <span class="code">' + text + '</span> and darken the background to <span class="code">' + output.darkest + '</span> and still remain compliant.';

            document.getElementById('output-compliance').innerHTML = complicanceHTML;
            document.getElementById('output-text').innerHTML = textHTML;
            document.getElementById('output-background').innerHTML = backgroundHTML;

        }

    }

    function bindEvents () {
        for (var key in inputs) {
            inputs[key].addEventListener('keyup', update, false);
        }
    }

    module.init = function () {
        inputs.background.value = '#FFFFFF';
        inputs.text.value = '#333333';
        inputs.size.value = '16';
        bindEvents();
        update();
    }

    return module;

})();

Calc.init();