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
        var localNumber = tryParseInternal(number, userCode);
        if (localNumber) {
            return localNumber;
        }

        if (beginsWithParentasis) {
            return tryParseInternal(number, /^\((\d{1,4})\)/.exec(number)[1]);
        }

        var hasSeparatePrefix = /^\d{1,4}[ \-\.]/.test(number);
        if (hasSeparatePrefix) {
            return tryParseInternal(number, /^(\d{1,4})/.exec(number)[1]);
        }

        var possibleGuesses = _([number.substring(0, 1), number.substring(0, 2), number.substring(0, 3), number.substring(0, 4)])
            .map(function (code) {
                return tryParseInternal(number, code);
            })
            .compact()
            .value();

        return _.first(possibleGuesses);
    }

    function tryParseInternal(number, countryCode) {
        var regions = [null];
        if (countryCode) {
            regions = countryCodeToRegionMap[countryCode];
            if (!regions) {
                return null;
            }
        }

        var validPossibilities = _.map(regions, function (region) {
            try {
                var pn = phoneUtil.parse(number, region);
                if (phoneUtil.isValidNumber(pn)) { //if (pn) {
                    return phoneUtil.format(pn, PNF.E164);
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
