'use strict';

define(['lodash', 'phoneNumberUtils'], function (_, phoneNumberUtils) {

    var PatternType = {
        "PHONE": "PHONE",
        "MAIL": "MAIL",
        "URL": "URL"
    };

    var emailPattern = /(?:^|\s)([A-Z0-9][A-Z0-9._%+-]+@[A-Z0-9][A-Z0-9.-]+\.[A-Z]{2,})(?=$|\s)/ig; //http://www.regular-expressions.info/email.html
    var urlPattern =  /(?:^|\s)((?:https?|ftp):\/\/(?:[^\s/?.#-]+\.?)+(?:\/[^\s]*)?)(?=$|\s)/g; //https://mathiasbynens.be/demo/url-regex (@imme_emosol)
    var candidatePhoneNumberPattern = /(\+?\(?\d(?:(?: | ?[\-\.\(\)] ?| ?[\-\.] ?[\(\)] ?)?\d){5,20}\d)/g;
    var allButAnchorsPattern = /(?:^|\/a>)((?:[^<]|<(?!a))+)(?:<a|$)/g;

    function findPatterns (subject, userGeo) {
        if (!_.isString(subject)) {
            return {};
        }

        var subjectsArray = tokenizeByAnchors(subject);
        var allPatterns = _.flatten([findPhoneNumbers(subjectsArray, userGeo), findEmails(subjectsArray), findUrls(subjectsArray)]);
        return resolveCollisions(allPatterns);
    }

    function findUrls(subjectsArray) {
        return _(subjectsArray)
            .map(function (sbj) {
                return getUrls(sbj) || [];
            })
            .flatten()
            .compact()
            .value();
    }

    function findEmails(subjectsArray) {
        return _(subjectsArray)
            .map(function (sbj) {
                return getEmails(sbj) || [];
            })
            .flatten()
            .compact()
            .value();
    }

    function findPhoneNumbers(subjectsArray, userGeo) {
        var candidates = _(subjectsArray)
            .map(function (sbj) {
                return getPhoneCandidates(sbj) || [];
            })
            .flatten()
            .compact()
            .value();

        return _.filter(candidates, function(can) {
            can.value = phoneNumberUtils.tryParseNumber(can.key, userGeo);
            return !!can.value;
        });
    }
    function getUrls(subject) {
        var singleExec, urls = [];
        while ((singleExec = urlPattern.exec(subject))) {
            urls.push({
                key: singleExec[1],
                value: singleExec[1],
                index: singleExec.index,
                patternType: PatternType.URL
            });
        }
        return urls;
    }

    function getEmails(subject) {
        var singleExec, emails = [];
        while ((singleExec = emailPattern.exec(subject))) {
            emails.push({
                key: singleExec[1],
                value: singleExec[1],
                index: singleExec.index,
                patternType: PatternType.MAIL
            });
        }
        return emails;
    }

    function getPhoneCandidates(subject) {
        var singleExec, phones = [];
        while ((singleExec = candidatePhoneNumberPattern.exec(subject))) {
            phones.push({
                key: singleExec[1],
                value: singleExec[1],
                index: singleExec.index,
                patternType: PatternType.PHONE
            });
        }
        return phones;
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
        PatternType: PatternType,
        findPatterns: findPatterns,
        findUrls: findUrls,
        findEmails: findEmails,
        findPhoneNumbers: findPhoneNumbers,
        tokenizeByAnchors: tokenizeByAnchors
    };

});
