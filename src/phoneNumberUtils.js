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

        var hasLegalParentasis = /^[^\(\)]*(\(\d{1,4}\))?[^\(\)]*$/.test(number);
        if (!hasLegalParentasis) {
            return null;
        }

        var isE164Format = /^\+/.test(number);
        if (isE164Format) {
            return tryParseInternal(number);
        }

        var successfulParse = parseWithLeadingParentasis(number);
        if (successfulParse) {
            return successfulParse;
        }

        successfulParse = parseWithSeparatePrefix(number);
        if (successfulParse) {
            return successfulParse;
        }

        var cleanNumber = noLeadingZeroes(digitsOnly(number));

        successfulParse = parseLocal(cleanNumber, userGeo);
        if (successfulParse) {
            return successfulParse;
        }

        var possibleGuesses = makePossibleGuesses(cleanNumber);

        return _(possibleGuesses)
            .map(function (guess) {
                return tryParseInternal(guess.restOfNumber, guess.countryCode);
            })
            .compact()
            .first();
    }

    function parseLocal(number, userGeo) {
        var notLocal = number.indexOf(userGeo) == 0;
        if (notLocal) {
            return null;
        }

        return tryParseInternal(number, userGeo);
    }

    function parseWithLeadingParentasis(number) {
        var leadingParentasisExecResult = /^\([0]*([1-9]\d{0,3})\)/.exec(number);
        if (!leadingParentasisExecResult) {
            return null;
        }
        return tryParseInternal(number, leadingParentasisExecResult[1]);
    }

    function parseWithSeparatePrefix(number) {
        var separatePrefixExecResult = /^(\d{1,4})[ \-\.]/.exec(number);
        if (!separatePrefixExecResult) {
            return null;
        }
        return tryParseInternal(number, separatePrefixExecResult[1]);
    }

    function digitsOnly(number) {
        return number.match(/\d/g).join("");
    }

    function noLeadingZeroes(number) {
        return /^[0]*([^0].*)$/.exec(number)[1];
    }

    function makePossibleGuesses(number) {
        var cleanNumber = noLeadingZeroes(digitsOnly(number));
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

    function tryParseInternal(number, countryCode, loose) {
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
                if (pn) {
                    if (loose || phoneUtil.isValidNumber(pn)) {
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
        validateNumber: validateNumber
    };
});
