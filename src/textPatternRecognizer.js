'use strict';

define(['lodash', 'phoneNumberUtils'], function (_, phoneNumberUtils) {

    var emailPattern = /(^|\s)([A-Z0-9][A-Z0-9._%+-]+@[A-Z0-9][A-Z0-9.-]+\.[A-Z]{2,})(?=$|\s)/ig; //http://www.regular-expressions.info/email.html
    var urlPattern =  /(^|\s)((?:https?|ftp):\/\/(?:[^\s/?.#-]+\.?)+(?:\/[^\s]*)?)(?=$|\s)/g; //https://mathiasbynens.be/demo/url-regex (@imme_emosol)
    var candidatePhoneNumberPattern = /\+?\(?\d(?:(?: | ?[\-\.\(\)] ?| ?[\-\.] ?[\(\)] ?)?\d{5,20}\d)/g;
    var allButAnchorsPattern = /(?:^|\/a>)((?:[^<]|<(?!a))+)(?:<a|$)/g;

    var Pattern = {
        "PHONE": {type: "PHONE", regexp: candidatePhoneNumberPattern, itemBuilder: phoneBuilder},
        "MAIL": {type: "MAIL", regexp: emailPattern, itemBuilder: mailBuilder},
        "URL": {type: "URL", regexp: urlPattern, itemBuilder: urlBuilder}
    };

    function findPatterns (subject, userGeo) {
        if (!_.isString(subject)) {
            return [];
        }

        var subjectsArray = tokenizeByAnchors(subject);
        var allPatterns = _.flatten([findPhoneNumbers(subjectsArray, userGeo), findEmails(subjectsArray), findUrls(subjectsArray)]);
        return resolveCollisions(allPatterns);
    }

    function findUrls(subjectsArray) {
        return findItems(subjectsArray, Pattern.URL);
    }

    function findEmails(subjectsArray) {
        return findItems(subjectsArray, Pattern.MAIL);
    }

    function findPhoneNumbers(subjectsArray, userGeo) {
        var candidates = findItems(subjectsArray, Pattern.PHONE);

        return _.filter(candidates, function(can) {
            can.value = phoneNumberUtils.tryParseNumber(can.key, userGeo);
            return !!can.value;
        });
    }

    function findItems(subjectsArray, pattern) {
        return _(subjectsArray)
            .map(function (sbj) {
                return getItems(sbj, pattern) || [];
            })
            .flatten()
            .value();
    }

    function getItems(subject, pattern) {
        var singleExec, items = [];
        while ((singleExec = pattern.regexp.exec(subject))) {
            items.push(pattern.itemBuilder(singleExec));
        }
        return items;
    }

    function phoneBuilder(executionResult) {
        return {
            key: executionResult[0],
            value: executionResult[0],
            index: executionResult.index,
            pattern: Pattern.PHONE
        }
    }

    function mailBuilder(executionResult) {
        return {
            key: executionResult[2],
            value: executionResult[2],
            index: executionResult[1].length + executionResult.index,
            pattern: Pattern.MAIL
        }
    }

    function urlBuilder(executionResult) {
        return {
            key: executionResult[2],
            value: executionResult[2],
            index: executionResult[1].length + executionResult.index,
            pattern: Pattern.URL
        }
    }

    function tokenizeByAnchors(subject) {
        var singleExec, tokens = [];
        while ((singleExec = allButAnchorsPattern.exec(subject))) {
            tokens.push(singleExec[1]);
        }
        return tokens;
    }

    function resolveCollisions(resultList) {
        var currentResult = null;
        var reducedResultList = [];
        var orderedResultList = _.orderBy(resultList, 'index', 'asc');

        for (var i = 0; i < orderedResultList.length; i++) {
            if (currentResult && orderedResultList[i].index <= currentResult.index + currentResult.key.length) {
                continue;
            }

            currentResult = orderedResultList[i];
            reducedResultList.push(orderedResultList[i]);
        }

        return reducedResultList;
    }

    return {
        Pattern: Pattern,
        findPatterns: findPatterns,
        findUrls: findUrls,
        findEmails: findEmails,
        findPhoneNumbers: findPhoneNumbers,
        tokenizeByAnchors: tokenizeByAnchors
    };

});
