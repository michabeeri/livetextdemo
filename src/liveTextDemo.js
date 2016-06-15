'use strict';

define(['lodash', 'textPatternRecognizer'], function (_, textPatternRecognizer) {

    function createPhoneAnchorTag (item) {
        return "<a class=\"phoneLink\" href=\"tel:" + item.value + "\">" + item.key + "</a>";
    }

    function createMailAnchorTag (item) {
        return "<a class=\"mailLink\" href=\"mailto:" + item.value + "\">" + item.key + "</a>";
    }

    function createUrlAnchorTag (item) {
        return "<a class=\"url\" href=\"" + item.value + "\">" + item.key + "</a>";
    }

    function MarkPhones (htmlContent) {
        var recognizedItems = textPatternRecognizer.findPatterns(htmlContent, countryCode.value)

        var processedItems = _(recognizedItems)
            .orderBy('index', 'desc')
            .map(function(item) {
                switch (item.patternType) {
                   case textPatternRecognizer.PatternType.PHONE :
                       return _.assign({}, item, {markup: createPhoneAnchorTag(item)});

                   case textPatternRecognizer.PatternType.MAIL :
                       return _.assign({}, item, {markup: createMailAnchorTag(item)});

                   case textPatternRecognizer.PatternType.URL :
                       return _.assign({}, item, {markup: createUrlAnchorTag(item)});

                   throw "Unknown patternType";
                }
            })
            .value();

        _.forEach(processedItems, function (item) {
            htmlContent = replaceWithAnchorTag(htmlContent, item);
        });

        return htmlContent;
    }

    function replaceWithAnchorTag(htmlContent, item) {
        return htmlContent.slice(0, item.index) + item.markup + htmlContent.slice(item.index + item.key.length);
    }

    function generateText () {
        outputContainer.innerHTML = MarkPhones(inputContainer.value);
    }
    
    var outputContainer = document.getElementById("output-container");
    var inputContainer = document.getElementById("input-container");
    var countryCode = document.getElementById("country-code");
    inputContainer.addEventListener("keyup", generateText);
    countryCode.addEventListener("keyup", generateText);

});
