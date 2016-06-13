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
        var patterns = textPatternRecognizer.findPatterns(htmlContent);
        _.forEach(_.keys(patterns.phoneNumbers), function (k) {
            htmlContent = htmlContent.replace(k, createPhoneAnchorTag(patterns.phoneNumbers[k]));
        });

        _.forEach(patterns.emails, function (mail) {
            htmlContent = htmlContent.replace(mail, createMailAnchorTag(mail));
        });

        _.forEach(patterns.urls, function (url) {
            htmlContent = htmlContent.replace(url, createUrlAnchorTag(url));
        });

        return htmlContent;
    }

    function generateText () {
        outputContainer.innerHTML = MarkPhones(inputContainer.value);
    }
    
    var outputContainer = document.getElementById("output-container");
    var inputContainer = document.getElementById("input-container");
    inputContainer.addEventListener("keyup", generateText);

});
