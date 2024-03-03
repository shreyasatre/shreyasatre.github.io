/**
*
* Semantic UI Alert
* Credits: Adapted from https://diw112.github.io/semanticUiAlert/
* 
* Shows an alert box based on Semantic UI styles. 
* 
* Default values before subsequent use can be set by setting options values of 
* the hidden object 'defaults' of the plugin as shown in the following example.
  
    $[pluginName].defaults = {
        title: 'Notification',
        message: 'Your attention is required', 
        type: 'info', 
        position: 'top-center', 
        sticky: false, 
        progressBar: true, 
        autoHideDelay: 5000, 
        theme: 'immersive', 
        callback: null, 
        callbackData: null 
  };
 
*
**/

/* This is an IIFE (https://developer.mozilla.org/en-US/docs/Glossary/IIFE) */
(function ($) {

    var gAlertContainer; // Container for the alerts.
    var pluginName = 'suiAlert'; // This is the function name used to refer to the plugin by the caller.
    var pluginOptions = {
        /* Default values if none are specified by the caller. */
        title: 'Alert', // Main title of the alert box.
        message: 'Your attention is required', // Message to display as an alert.
        type: 'info', // Type of alert; available values are - info, success, warning, error.
        position: 'top-center', // Position of the alert box; available values are -> top-right, top-left, top-center, bottom-right, bottom-left, bottom-center.
        sticky: false, // When TRUE, alert will remain on screen until manually dismissed by the user; when FALSE, alert will disappear after a delay specified by 'autoHideDelay'.
        progressBar: true, // When TRUE, displays a progress bar on the alert while 'sticky' is FALSE.
        autoHideDelay: 5000, // Amount of time in milliseconds to show the alert box on screen before it disappears.
        theme: 'immersive', // Available values are: basic, immersive.
        callback: null, // Function to call after displaying the alert box.
        callbackData: null // Data to forward to the callback function.
    };

    /* Plugin definition. */
    $[pluginName] = function (options) {

        // Combine plugin defaults, caller defaults, and parameter options.
        var alertOptions = $.extend({}, pluginOptions, $[pluginName].defaults, options);

        // The UI settings of the alert box. These cannot be refered from outside the plugin.
        var uiSettings = {
            alertIcon: '',
            alertBoxClass: ''
        };

        /* UI settings based on the theme and the type of alert requested. */
        if (alertOptions.theme === 'immersive') {

            switch (alertOptions.type) {

                case 'error':
                    uiSettings.alertIcon = 'remove circle icon';
                    uiSettings.alertBoxClass = 'ui icon message' + ' suiAlert-container__error';
                    break;

                case 'info':
                    uiSettings.alertIcon = 'info circle icon';
                    uiSettings.alertBoxClass = 'ui icon message' + ' suiAlert-container__info';
                    break;

                case 'success':
                    uiSettings.alertIcon = 'check circle icon';
                    uiSettings.alertBoxClass = 'ui icon message' + ' suiAlert-container__success';
                    break;

                case 'warning':
                    uiSettings.alertIcon = 'warning circle icon';
                    uiSettings.alertBoxClass = 'ui icon message' + ' suiAlert-container__warning';
                    break;

                default:
                    uiSettings.alertIcon = 'info circle icon';
                    uiSettings.alertBoxClass = 'ui icon message' + ' suiAlert-container__info';
                    break;

            }

        } else if (alertOptions.theme === 'basic') {
            switch (alertOptions.type) {

                case 'error':
                    uiSettings.alertIcon = 'remove circle icon';
                    uiSettings.alertBoxClass = 'ui negative icon message';
                    break;

                case 'info':
                    uiSettings.alertIcon = 'info circle icon';
                    uiSettings.alertBoxClass = 'ui info icon message';
                    break;

                case 'success':
                    uiSettings.alertIcon = 'check circle icon';
                    uiSettings.alertBoxClass = 'ui positive icon message';
                    break;

                case 'warning':
                    uiSettings.alertIcon = 'warning circle icon';
                    uiSettings.alertBoxClass = 'ui warning icon message';
                    break;

                default:
                    uiSettings.alertIcon = 'info circle icon';
                    uiSettings.alertBoxClass = 'ui info icon message';
                    break;

            }
        }

        // Check if alert container is added to the body of the document.
        if (!$('body > .suiAlert__' + alertOptions.position).length) {

            // Create new container if it doesn't exist for the current requested position.
            gAlertContainer = $('<div></div>')
                .addClass('suiAlert-container')
                .addClass('suiAlert__' + alertOptions.position)
                .appendTo('body');

        } else {

            // Get the existing container for the current position.
            gAlertContainer = $('.suiAlert__' + alertOptions.position);
        }

        // Create an alert box with its contents.
        var alertBox = $('<div></div>')
            .addClass(uiSettings.alertBoxClass);

        var alertContentIcon = $('<i></i>')
            .addClass(uiSettings.alertIcon);

        var alertContentClose = $('<i></i>')
            .addClass('close icon');

        var alertContent = $('<div></div>')
            .addClass('content');

        var alertContentHeader = $('<div></div>')
            .addClass('header')
            .append(alertOptions.title);

        var alertContentPara = $('<p></p>')
            .append(alertOptions.message);

        var alertProgressBar = $('<div></div>')
            .addClass('suiAlert-loading-bar');

        // Attach alert contents to the alert box.
        alertContentIcon.appendTo(alertBox);
        alertContentClose.appendTo(alertBox);
        alertContent.appendTo(alertBox);
        alertContentHeader.appendTo(alertContent);
        alertContentPara.appendTo(alertContent);

        // No progress bar if alert is supposed to be sticky.
        if (alertOptions.sticky === false && alertOptions.progressBar === true) {
            alertProgressBar.appendTo(alertBox);
        }

        alertBox.appendTo(gAlertContainer);
        uiAlertShow();

        /* If the alert is not sticky, set the alert to disappear after specified delay. */
        if (alertOptions.sticky === false) {

            var hideTimer = 0; // Timer used to track display of the alert.

            /**
            * Bind to the alert box's mouse-enter and mouse-leave events.
            **/
            $(alertBox)
                .on('mouseenter', function () {
                    uiAlertPause();
                })
                .on('mouseleave', function () {
                    uiAlertHideWithDelay();
                });

            uiAlertHideWithDelay();

        }

        /* If callback is not null, try to call it. */
        if ($.isFunction(alertOptions.callback) === true) {

            if (alertOptions.callbackData !== null) {
                alertOptions.callback.call(this, alertOptions.callbackData);
            } else {
                alertOptions.callback.call(this);
            }

        }

        /**
        * Sets the alert to disappear after a specified delay. Also animates the 
        * progress bar if it is displayed.
        **/
        function uiAlertHideWithDelay() {

            // Start progress bar animation.
            $(alertProgressBar).css({
                'width': '0%',
                'transition': 'width linear ' + alertOptions.autoHideDelay + 'ms'
            });

            hideTimer = setTimeout(function () {

                // Manually fade out and then remove.
                alertBox.animate({
                    opacity: '0',
                }, 300, function () {
                    alertBox.remove();
                });

            }, (alertOptions.autoHideDelay));
        }

        /**
        * Resets the timer that tracks when to hide the alert. Also stop the 
        * animation of the progress bar if it is displayed. 
        **/
        function uiAlertPause() {

            clearTimeout(hideTimer);

            // Stop progress bar animation.
            $(alertProgressBar).css({
                'width': '100%',
                'transition': 'width linear 0ms'
            });

        }

        /**
        * Manually shows the alert box.
        **/
        function uiAlertShow() {

            // Manually fade in the alert box.
            alertBox
                .animate({
                opacity: '1',
                }, 300);

        }

        /**
        * Bind to the click event for the alert box's close button.
        **/
        $(alertContentClose).on('click', function () {

            // Manually fade out and then remove.
            alertBox.animate({
                opacity: '0',
            }, 300, function () {
                alertBox.remove();
            });

        });

    };

}(jQuery));