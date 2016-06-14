'use strict';

define(['lodash', 'phoneNumberUtils'], function (_, phoneNumberUtils) {

    var emailPattern = /(?:^|\s)([A-Z0-9][A-Z0-9._%+-]+@[A-Z0-9][A-Z0-9.-]+\.[A-Z]{2,})(?=$|\s)/ig; //http://www.regular-expressions.info/email.html
    var urlPattern =  /(?:^|\s)((?:https?|ftp):\/\/(?:[^\s/?.#-]+\.?)+(?:\/[^\s]*)?)(?=$|\s)/g; //https://mathiasbynens.be/demo/url-regex (@imme_emosol)
    var candidatePhoneNumberPattern = /\+?\(?\d(?:(?: | ?[\-\.\(\)] ?| ?[\-\.] ?[\(\)] ?)?\d){5,20}\d/g;
    var allButAnchorsPattern = /(?:^|\/a>)((?:[^<]|<(?!a))+)(?:<a|$)/g;

    function findPatterns (subject, userGeo) {
        if (!_.isString(subject)) {
            return {};
        }

        var subjectsArray = tokenizeByAnchors(subject);
        var phoneNumbers = findPhoneNumbers(subjectsArray, userGeo);

        subjectsArray = tokenizeByKeys(subjectsArray, _.keys(phoneNumbers));
        var emails = findEmails(subjectsArray);

        subjectsArray = tokenizeByKeys(subjectsArray, emails);
        var urls = findUrls(subjectsArray);

        return {
            phoneNumbers: phoneNumbers,
            emails: emails,
            urls: urls
        }
    }

    function findUrls(subjectsArray) {
        return _(subjectsArray)
            .map(function (sbj) {
                return getUrls(sbj) || [];
            })
            .flatten()
            .compact()
            .uniq()
            .value();
    }

    function findEmails(subjectsArray) {
        return _(subjectsArray)
            .map(function (sbj) {
                return getEmails(sbj) || [];
            })
            .flatten()
            .compact()
            .uniq()
            .value();
    }

    function findPhoneNumbers(subjectsArray, userGeo) {
        var candidates = _(subjectsArray)
            .map(function (str) {
                return identifyPossiblePhoneNumbers(str);
            })
            .flatten()
            .compact()
            .value();

        return _.transform(candidates, function (acc, candidate) {
            var pn = phoneNumberUtils.tryParseNumber(candidate, userGeo);
            if (pn) {
                acc[candidate] = pn;
            }
        }, {});
    }
    function getUrls(subject) {
        var singleExec, urls = [];
        while ((singleExec = urlPattern.exec(subject))) {
            urls.push(singleExec[1]);
        }
        return urls;
    }

    function getEmails(subject) {
        var singleExec, emails = [];
        while ((singleExec = emailPattern.exec(subject))) {
            emails.push(singleExec[1]);
        }
        return emails;
    }

    function tokenizeByAnchors(subject) {
        var singleExec, tokens = [];
        while ((singleExec = allButAnchorsPattern.exec(subject))) {
            tokens.push(singleExec[1]);
        }
        return tokens;
    }

    function tokenizeByKeys(subjectsArray, keys) {
        var tokenAfter = subjectsArray.slice();
        var tokenBefore = null;

        for (var keyIndex = 0; keyIndex < keys.length; keyIndex++){

            tokenBefore = tokenAfter;
            tokenAfter = [];
            for (var tokenIndex = 0; tokenIndex < tokenBefore.length; tokenIndex++){
                var newTokens = _.split(tokenBefore[tokenIndex], keys[keyIndex]);
                if (newTokens.length > 0) {
                    tokenAfter = _.concat(tokenAfter, newTokens);

                } else {
                    tokenAfter.push(tokenBefore[tokenIndex]);
                }
            }
        }

        return tokenAfter;
    }

    function identifyPossiblePhoneNumbers(subject) {
        return subject.match(candidatePhoneNumberPattern) || [];
    }

    return {
        findPatterns: findPatterns,
        findUrls: findUrls,
        findEmails: findEmails,
        findPhoneNumbers: findPhoneNumbers,
        tokenizeByAnchors: tokenizeByAnchors,
        identifyPossiblePhoneNumbers: identifyPossiblePhoneNumbers
    };

});
