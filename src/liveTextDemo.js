'use strict';

define(['lodash'], function (_) {

    var reactSource = 'http://localhost';//'51a47caaae481797fa1290466d19cd6ee7ca20a6'; //'http://localhost';
    var previousShowAlways = false;
    var permanentShowAlways = false;
    var temporaryShowAlways = false;

    var addressInput = document.getElementById('address-input');
    addressInput.addEventListener('keyup', function (e){
        if(e.key === 'Enter') {
            handleAddress();
        }
    });

    var debouncedHide = _.debounce(
        function() {
            temporaryShowAlways = false;
            setShowAlways();
        },
        300,
        {'leading': false, 'trailing': true});
    window.addEventListener('keydown', function (e){
        if(e.key === 'S') {
            e.preventDefault();
            temporaryShowAlways = true;
            debouncedHide();
            setShowAlways();
        }
    });

    var openButton = document.getElementById('open-button');
    openButton.addEventListener('click', handleAddress);

    var showAlwaysCheckBox = document.getElementById('show-always-input');
    showAlwaysCheckBox.addEventListener('change', onShowAlwaysCheckboxChange);

    var desktopSite = document.getElementById('desktop-site');
    var original = document.getElementById('original-site');
    var originalNoScale = document.getElementById('original-withoutScale-site');
    var newSite = document.getElementById('new-site');
    handleAddress();


    function handleAddress(){
        var address = _.includes(addressInput.value,'?debug=all') ? addressInput.value + '&' : addressInput.value + '?';
        desktopSite.src = address + 'ReactSource=' + reactSource;
        original.src = address + 'ReactSource=' + reactSource + '&showMobileView=true';
        originalNoScale.src = address + 'ReactSource=' + reactSource + '&showMobileView=true&experiments=ignoreScale';
        newSite.src = address + 'ReactSource=' + reactSource + '&showMobileView=true&experiments=newFontTransform,ignoreScale';
    }

    function setShowAlways() {
        console.log(permanentShowAlways || temporaryShowAlways);
        var show = permanentShowAlways || temporaryShowAlways;
        if (previousShowAlways !== show) {
            previousShowAlways = show;
            _.forEach([desktopSite, original, originalNoScale, newSite], function(iframe){
                iframe.contentWindow.postMessage('show-always', '*');
            })
        }
    }

    function onShowAlwaysCheckboxChange(event) {
        permanentShowAlways = event.currentTarget.checked;
        setShowAlways();
    }
});
