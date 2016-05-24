'use strict';

define(['lodash', 'phoneNumberValidator'], function (_, phoneNumberValidator) {

    function createPhoneAnchorTag (phone) {
        return "<a class=\"phoneLink\" href=\"tel:" + phone + "\">" + phone + "</a>";
    }

    var candidatePhoneNumberPattern = /\+?\(?\d[\d\s\.\-\)]{5,20}\d/g;
    function findPhones (string) {
        var candidates = string.match(candidatePhoneNumberPattern );
        return _.filter(candidates, function (n) {
            return phoneNumberValidator.validateNumber(n, regionInput.value);
        });
    }

    function MarkPhones (htmlContent) {
        var phones = findPhones(htmlContent);
        _.forEach(phones, function (p) {
            htmlContent = htmlContent.replace(p, createPhoneAnchorTag(p))
        });

        return htmlContent;
    }

    function onKeyUp () {
        outputContainer.innerHTML = MarkPhones(inputContainer.value);
    }

    var regionInput = document.getElementById("geo-input");
    var outputContainer = document.getElementById("output-container");
    var inputContainer = document.getElementById("input-container");
    inputContainer.addEventListener("keyup", onKeyUp);
    regionInput.addEventListener("keyup", onKeyUp);

});
