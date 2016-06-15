define(['lodash', 'thirdparty/libphonenumber.min'], function(_, libphonenumber) {
    'use strict';
    var phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
    var PNF = libphonenumber.PhoneNumberFormat;
    var countryCodeToRegionMap = createCountryCodesToRegionsMap();

    function validateNumber(number, userGeo) {
        return tryParseNumber(number, userGeo) !== null;
    }

    function tryParseNumber(number, userGeo) {
        if (!number) {
            return null;
        }

        if (!isSevenToFifteenDigits(number)) {
            return null;
        }

        var beginsWithParentasis = /^\+?\(\d{1,4}\)/.test(number);
        var hasLegalParentasis = /^[^\(\)]*(\(\d{1,4}\))?[^\(\)]*$/.test(number);
        if (!hasLegalParentasis) {
            return null;
        }

        var isE164Format = /^\+/.test(number);
        if (isE164Format) {
            return tryParseInternal(number);
        }

        var userCode = getUserCountryCode(userGeo);
        var localNumber = tryParseInternal(number, userCode, true);
        if (localNumber) {
            return localNumber;
        }

        if (beginsWithParentasis) {
            var numberBeginsWithParentasis = tryParseInternal(number, /^\([0]{0,2}(\d{1,4})\)/.exec(number)[1]);
            if (numberBeginsWithParentasis) {
                return numberBeginsWithParentasis;
            }
        }

        var hasSeparatePrefix = /^\d{1,4}[ \-\.]/.test(number);
        if (hasSeparatePrefix) {
            var numberHasSeparatePrefix = tryParseInternal(number, /^(\d{1,4})/.exec(number)[1]);
            if (numberHasSeparatePrefix) {
                return numberHasSeparatePrefix;
            }
        }

        var possibleGuesses = _(makePossibleGuesses(number))
            .map(function (code) {
                return tryParseInternal(removeZeroes(number), code);
            })
            .compact()
            .value();

        return _.first(possibleGuesses);
    }

    function 

    function removeZeroes(number) {
        var execResult = /^[0]*([1-9])$/.exec(number);
        return execResult ? execResult[1] : null;
    }

    function makePossibleGuesses(number) {
        return _([
                /^[0]{0,3}([1-9])/.exec(number),
                /^[0]{0,2}([1-9]{2})/.exec(number),
                /^[0]?([1-9]{3})/.exec(number),
                /^([1-9]{4})/.exec(number)
            ])
            .compact()
            .map(function (executionResult){
                return executionResult[1];
            })
            .value();
    }

    function tryParseInternal(number, countryCode, strict) {
        var regions = [null];
        if (countryCode) {
            regions = countryCodeToRegionMap[countryCode];
            if (!regions) {
                return null;
            }
        }

        strict = true;
        var validPossibilities = _.map(regions, function (region) {
            try {
                var pn = phoneUtil.parse(number, region);
                if (pn) {
                    if (!strict || phoneUtil.isValidNumber(pn)) {
                        return phoneUtil.format(pn, PNF.E164);
                    }
                }
            } catch (e) {
                // fail silently;
            }
        });

        if (validPossibilities.length > 0) {
            return validPossibilities[0];
        }

        return null;
    }

    function isSevenToFifteenDigits (number) {
        var digits = number.match(/\d/g);
        if (!digits){
            return false;
        }

        return digits.length >= 7 && digits.length <= 15;
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

    function getUserCountryCode () {
        return "972";
    }

    return {
        tryParseNumber: tryParseNumber,
        validateNumber: validateNumber
    };
});
