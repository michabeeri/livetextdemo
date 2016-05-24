define(['lodash', 'thirdparty/libphonenumber.min'], function(_, libphonenumber) {
    'use strict';

    var phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
    var PNF = libphonenumber.PhoneNumberFormat;
    var countryCodeToRegionMap = createCountryCodesToRegionsMap();

    var singleDigitGlobalPattern = /\d/g;
    var noParenthesisPattern = /^[^\(\)]*$/;
    var legalParenthesisPattern = /^\+?\(\d{1,3}\)[^\(\)]*$/;
    var beginsWithPlusPattern = /^\+/;
    var countryCodeInParenthesisCapturePattern = /^\((\d{1,3})\)/;
    var separateCountryCodePattern = /^\d{1,3}[\s\-\.]/;
    var countryCodeCapturePattern = /^(\d{1,3})/;
    var countryCodeAfterPlusCapturePattern = /^\+?(\d{1,3})/;

    function isSevenToFifteenDigits (number) {
        var digitCount = number.match(singleDigitGlobalPattern).length;
        return digitCount >= 7 && digitCount <= 15;
    }

    function validateNumber(number, userRegion) {
        if (!isSevenToFifteenDigits(number)) {
            return false;
        }

        var hasNoParentasis = noParenthesisPattern.test(number);
        var hasLegalParentasis = legalParenthesisPattern.test(number);
        if (!hasNoParentasis && !hasLegalParentasis) {
            return false;
        }

        var isE164Format = beginsWithPlusPattern.test(number);
        if (isE164Format) {
            return validate(number);
        }

        if (hasLegalParentasis) {
            return validate(number, countryCodeInParenthesisCapturePattern.exec(number)[1]);
        }

        var hasSeparateCountryCode = separateCountryCodePattern.test(number);
        if (hasSeparateCountryCode) {
            return validate(number, countryCodeCapturePattern.exec(number)[1]);
        }

        return validateByGuessingCountryCode (number, userRegion);
    }

    function validateByGuessingCountryCode (number, userRegion) {
        var possibleCodes = [
            number.substring(0,1),
            number.substring(0,2),
            number.substring(0,3)
        ];

        _.forEach(possibleCodes, function (code) {
            if (validate(number, code)) {
                return true;
            }
        });

        try {
            return validate(number, phoneUtil.getCountryCodeForRegion(userRegion))
        } catch (e) {
            return false;
        }
    }

    function validate(number, countryCode) {
        var region;
        if (countryCode) {
            region = countryCodeToRegionMap[countryCode];
            if (!region) {
                return false
            }
        }

        try {
            var pn = phoneUtil.parse(number, region);
            if (phoneUtil.isValidNumber(pn)) {
                return true;
            } else {
                return false;
            }
        } catch (e) {
            return false;
        }
    }

    function createCountryCodesToRegionsMap() {
        return _.transform(phoneUtil.getSupportedRegions(), function (acc, reg) {
            acc[phoneUtil.getCountryCodeForRegion(reg)] = reg;
        }, {});
    }

    return {
        validateNumber: validateNumber
    };
});
