'use strict';

define(['lodash', 'textPatternRecognizer'], function (_, textPatternRecognizer) {

    function createPhoneAnchorTag (phone) {
        return "<a class=\"phoneLink\" href=\"tel:" + phone + "\">" + phone + "</a>";
    }

    function createMailAnchorTag (mail) {
        return "<a class=\"mailLink\" href=\"mailto:" + mail + "\">" + mail + "</a>";
    }

    function createUrlAnchorTag (url) {
        return "<a class=\"url\" href=\"" + url + "\">" + url + "</a>";
    }

    function MarkPhones (htmlContent) {
        var recognizedItems = _.orderBy(textPatternRecognizer.findPatterns(htmlContent), 'index', 'desc');

        var processedItems = _.map(recognizedItems, function(item) {
           switch (item.patternType) {
               case textPatternRecognizer.PatternType.PHONE :
                   return _.assign({}, item, {value: createPhoneAnchorTag(item.value)});

               case textPatternRecognizer.PatternType.MAIL :
                   return _.assign({}, item, {value: createMailAnchorTag(item.value)});

               case textPatternRecognizer.PatternType.URL :
                   return _.assign({}, item, {value: createUrlAnchorTag(item.value)});

               throw "Unknown patternType";
           }
        });

        _.forEach(processedItems, function (item) {
            htmlContent = replaceWithAnchorTag(htmlContent, item);
        });

        return htmlContent;
    }

    function replaceWithAnchorTag(htmlContent, item) {
        return htmlContent.slice(0, item.index) + item.value + htmlContent.slice(item.index + item.key.length);
    }

    function generateText () {
        outputContainer.innerHTML = MarkPhones(inputContainer.value);
    }
    
    var outputContainer = document.getElementById("output-container");
    var inputContainer = document.getElementById("input-container");
    inputContainer.addEventListener("keyup", generateText);

});
