define(['lodash', 'thirdparty/libphonenumber.min'], function(_, libphonenumber) {
    'use strict';
    var phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
    var PNF = libphonenumber.PhoneNumberFormat;
    var countryCodeToRegionMap = createCountryCodesToRegionsMap();

    var validationRules = [
        validateNotEmpty,
        validateLegalParenthesis,
        validateLegalSeparators
    ];

    var parsingRules = [
        tryParseWithLeadingParenthesis,
        tryParseWithSeparatePrefix,
        tryParseLocal,
        tryParseByGuessingCountryCode
    ];

    function tryParseNumber(number, userCountryCode) {
        for (var i=0; i < validationRules.length; i++) {
            if(!validationRules[i](number)) {
                return null;
            }
        }

        var isE164Format = /^\+/.test(number);
        if (isE164Format) {
            return tryParseInternal(number, null);
        }

        for (var j=0; j < parsingRules.length; j++) {
            var successfulParse = parsingRules[j](number, userCountryCode);
            if(successfulParse) {
                return successfulParse;
            }
        }

        return null;
    }

    function validateNotEmpty(number) {
        return !!number;
    }

    function validateLegalParenthesis(number) {
        return /^[^\(\)]*(?:\(\d{1,4}\))?[^\(\)]*$/.test(number);
    }

    function validateLegalSeparators(number) {
        return !/\-\-|\.\./.test(number);
    }

    function tryParseWithLeadingParenthesis(number) {
        var leadingParenthesisExecResult = /^\([0]*([1-9]\d{0,3})\)/.exec(number);
        if (!leadingParenthesisExecResult) {
            return null;
        }

        var cleanNumber = clearNonDigitsAndLeadingZeroes(number);
        return tryParseWithCountryCode(cleanNumber, leadingParenthesisExecResult[1]);
    }

    function tryParseWithSeparatePrefix(number) {
        var separatePrefixExecResult = /^0*(\d{1,4})[ \-\.]/.exec(number);
        if (!separatePrefixExecResult) {
            return null;
        }

        var cleanNumber = clearNonDigitsAndLeadingZeroes(number);
        return tryParseWithCountryCode(cleanNumber, separatePrefixExecResult[1]);
    }

    function tryParseLocal(number, userCountryCode) {
        var cleanNumber = clearNonDigitsAndLeadingZeroes(number);
        return tryParseWithCountryCode(cleanNumber, userCountryCode);
    }

    function tryParseByGuessingCountryCode(number) {
        var possibleGuesses = makePossibleGuesses(number);
        return _(possibleGuesses)
            .map(function (guess) {
                return tryParseWithCountryCode(guess.restOfNumber, guess.countryCode);
            })
            .compact()
            .first();
    }

    function clearNonDigitsAndLeadingZeroes(number) {
        var digitsOnly = number.match(/\d/g).join("");
        return /^[0]*([^0].*)$/.exec(digitsOnly)[1];
    }

    function makePossibleGuesses(number) {
        var cleanNumber = clearNonDigitsAndLeadingZeroes(number);
        return _([
                /^([1-9])(\d*)$/.exec(cleanNumber),
                /^([1-9]\d)(\d*)$/.exec(cleanNumber),
                /^([1-9]\d{2})(\d*)$/.exec(cleanNumber),
                /^([1-9]\d{3})(\d*)$/.exec(cleanNumber)
            ])
            .compact()
            .map(function (executionResult){
                return {
                    countryCode: executionResult[1],
                    restOfNumber: executionResult[2]
                };
            })
            .value();
    }

    function tryParseWithCountryCode(number, countryCode) {
        var regions = getPossibleRegions(countryCode)
        if (!regions) {
            return null;
        }

        return _(regions)
            .map(function (region) {
                return tryParseInternal(number, region);
            })
            .compact()
            .first();
    }

    function getPossibleRegions(countryCode) {
        if (!countryCode) {
            return null;
        }

        return countryCodeToRegionMap[countryCode];
    }

    function tryParseInternal(number, region) {
        try {
            var pn = phoneUtil.parse(number, region);
            if (pn && phoneUtil.isValidNumber(pn)) {
                return phoneUtil.format(pn, PNF.E164);
            }
        } catch (e) {
            // fail silently;
        }
        return null;
    }

    function createCountryCodesToRegionsMap() {
        return _.transform(phoneUtil.getSupportedRegions(), function (acc, reg) {
            var code = phoneUtil.getCountryCodeForRegion(reg);
            if (!acc[code]) {
                acc[code] = [];
            }
            acc[code].push(reg);
        }, {});
    }

    return {
        tryParseNumber: tryParseNumber,
        validateNotEmpty: validateNotEmpty,
        validateLegalParenthesis: validateLegalParenthesis,
        validateLegalSeparators: validateLegalSeparators,
        tryParseWithLeadingParenthesis: tryParseWithLeadingParenthesis,
        tryParseWithSeparatePrefix: tryParseWithSeparatePrefix,
        tryParseLocal: tryParseLocal,
        tryParseByGuessingCountryCode: tryParseByGuessingCountryCode,
        clearNonDigitsAndLeadingZeroes: clearNonDigitsAndLeadingZeroes,
        makePossibleGuesses: makePossibleGuesses,
        tryParseWithCountryCode: tryParseWithCountryCode
    };
});
