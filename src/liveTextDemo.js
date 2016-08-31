'use strict';

define(['lodash'], function (_) {

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
    var regularSite = document.getElementById('regular-site');
    var newSite = document.getElementById('new-site');
    handleAddress();


    function handleAddress(){
        var address = addressInput.value;
        desktopSite.src = address + '?ReactSource=d793eaebc1f3ca098d092d5ce44db9593ab5ad3a';
        regularSite.src = address + '?ReactSource=d793eaebc1f3ca098d092d5ce44db9593ab5ad3a&showMobileView=true';
        newSite.src = address + '?ReactSource=d793eaebc1f3ca098d092d5ce44db9593ab5ad3a&showMobileView=true&experiments=newFontTransform';
    }

    function setShowAlways() {
        console.log(permanentShowAlways || temporaryShowAlways);
        var show = permanentShowAlways || temporaryShowAlways;
        if (previousShowAlways !== show) {
            previousShowAlways = show;
            _.forEach([desktopSite, regularSite, newSite], function(iframe){
                iframe.contentWindow.postMessage('show-always', '*');
            })
        }
    }

    function onShowAlwaysCheckboxChange(event) {
        permanentShowAlways = event.currentTarget.checked;
        setShowAlways();
    }
});
