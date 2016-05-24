'use strict';

define(['lodash', 'phoneNumberValidator'], function (_, phoneNumberValidator) {

    function createPhoneAnchorTag (phone) {
        return "<a class=\"phoneLink\" href=\"tel:" + phone + "\">" + phone + "</a>";
    }

    var candidatePhoneNumberPattern = /\+?\(?\d[\d\s\.\-\)]{5,20}\d/g;
    function findPhones (string) {
        var candidates = string.match(candidatePhoneNumberPattern );
        return _.filter(candidates, function (n) {
            return phoneNumberValidator.validateNumber(n, "IL");
        });
    }

    function MarkPhones (htmlContent) {
        var phones = findPhones(htmlContent);
        _.forEach(phones, function (p) {
            htmlContent = htmlContent.replace(p, createPhoneAnchorTag(p))
        });

        return htmlContent;
    }

    function onKeyUp (event) {
        outputContainer.innerHTML = MarkPhones(event.target.value);
    }

    var outputContainer = document.getElementById("output-container");
    document.getElementById("input-container").addEventListener("keyup", onKeyUp);

});
