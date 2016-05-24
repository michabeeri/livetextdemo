'use strict';

requirejs.config({
    baseUrl: 'src',
    paths: {
        lodash: 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.3.0/lodash',
        libphonenumber: "thirdparty/libphonenumber.min"
    },
    shim: {
        lodash: { exports: '_' }
    }
});

requirejs(["liveTextDemo"], function () {});
