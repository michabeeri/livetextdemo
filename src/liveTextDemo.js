'use strict';

define(['lodash', 'phoneNumberValidator'], function (_, phoneNumberValidator) {

    function createPhoneAnchorTag (phone) {
        return "<a class=\"phoneLink\" href=\"tel:" + phone + "\">" + phone + "</a>";
    }

    var candidatePhoneNumberPattern = /\+?\(?\d[\d\s\.\-\)]{5,20}\d/g;
    function findPhones (string) {
        var candidates = string.match(candidatePhoneNumberPattern );
        return _.filter(candidates, function (n) {
            return phoneNumberValidator.validateNumber(n, regionSelect.value);
        });
    }

    function MarkPhones (htmlContent) {
        var phones = findPhones(htmlContent);
        _.forEach(phones, function (p) {
            htmlContent = htmlContent.replace(p, createPhoneAnchorTag(p))
        });

        return htmlContent;
    }

    function generateText () {
        outputContainer.innerHTML = MarkPhones(inputContainer.value);
    }

    var regionSelect = document.getElementById("geo-select");
    var outputContainer = document.getElementById("output-container");
    var inputContainer = document.getElementById("input-container");
    inputContainer.addEventListener("keyup", generateText);
    regionSelect.addEventListener("change", generateText);

});
