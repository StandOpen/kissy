/**
 * @ignore
 * detect if current browser supports various features.
 * @author yiminghe@gmail.com
 */
(function (S, undefined) {
    var win = S.Env.host,
        UA = S.UA,
        VENDORS = [
            'Webkit',
            'Moz',
            'O',
            // ms is special .... !
            'ms'
        ],
        // for nodejs
        doc = win.document||{},
        isMsPointerSupported,
    // ie11
        isPointerSupported,
        isTransform3dSupported,
    // nodejs
        documentElement = doc && doc.documentElement,
        navigator,
        documentElementStyle,
        isClassListSupportedState = true,
        isQuerySelectorSupportedState = false,
    // phantomjs issue: http://code.google.com/p/phantomjs/issues/detail?id=375
        isTouchEventSupportedState = ('ontouchstart' in doc) && !(UA.phantomjs),
        vendorInfos = {},
        ie = UA.ieMode;

    if (documentElement) {
        // broken ie8
        if (documentElement.querySelector && ie !== 8) {
            isQuerySelectorSupportedState = true;
        }
        documentElementStyle = documentElement.style;
        isClassListSupportedState = 'classList' in documentElement;
        navigator = win.navigator || {};
        isMsPointerSupported = 'msPointerEnabled' in navigator;
        isPointerSupported = 'pointerEnabled' in navigator;
    }

    // return prefixed css prefix name
    function getVendorInfo(name) {
        if (vendorInfos[name]) {
            return vendorInfos[name];
        }
        // if already prefixed or need not to prefix
        if (!documentElementStyle || name in documentElementStyle) {
            vendorInfos[name] = {
                name: name,
                prefix: ''
            };
        } else {
            var upperFirstName = name.charAt(0).toUpperCase() + name.slice(1),
                vendorName,
                i = VENDORS.length;

            while (i--) {
                vendorName = VENDORS[i] + upperFirstName;
                if (vendorName in documentElementStyle) {
                    vendorInfos[name] = {
                        name: vendorName,
                        prefix: VENDORS[i]
                    };
                }
            }

            vendorInfos[name] = vendorInfos[name] || {
                name: name,
                prefix: false
            };
        }
        return  vendorInfos[name];
    }

    /**
     * browser features detection
     * @class KISSY.Features
     * @private
     * @singleton
     */
    S.Features = {
        // http://blogs.msdn.com/b/ie/archive/2011/09/20/touch-input-for-ie10-and-metro-style-apps.aspx
        /**
         * whether support microsoft pointer event.
         * @type {Boolean}
         */
        isMsPointerSupported: function () {
            // ie11 onMSPointerDown but e.type==pointerdown
            return isMsPointerSupported;
        },

        /**
         * whether support microsoft pointer event (ie11).
         * @type {Boolean}
         */
        isPointerSupported: function () {
            // ie11
            return isPointerSupported;
        },

        /**
         * whether support touch event.
         * @return {Boolean}
         */
        isTouchEventSupported: function () {
            return isTouchEventSupportedState;
        },

        isTouchGestureSupported: function () {
            return isTouchEventSupportedState || isPointerSupported || isMsPointerSupported;
        },

        /**
         * whether support device motion event
         * @returns {boolean}
         */
        isDeviceMotionSupported: function () {
            return !!win.DeviceMotionEvent;
        },

        /**
         * whether support hashchange event
         * @returns {boolean}
         */
        isHashChangeSupported: function () {
            // ie8 支持 hashchange
            // 但 ie8 以上切换浏览器模式到 ie7（兼容模式），
            // 会导致 'onhashchange' in window === true，但是不触发事件
            return ('onhashchange' in win) && (!ie || ie > 7);
        },

        /**
         * whether support css transform 3d
         * @returns {boolean}
         */
        isTransform3dSupported: function () {
            if (isTransform3dSupported !== undefined) {
                return isTransform3dSupported;
            }
            if (!documentElement || getVendorInfo('transform').prefix === false) {
                isTransform3dSupported = false;
            } else {
                // https://gist.github.com/lorenzopolidori/3794226
                // ie9 does not support 3d transform
                // http://msdn.microsoft.com/en-us/ie/ff468705
                var el = doc.createElement('p');
                var transformProperty = getVendorInfo('transform').name;
                documentElement.insertBefore(el, documentElement.firstChild);
                el.style[transformProperty] = 'translate3d(1px,1px,1px)';
                var computedStyle = win.getComputedStyle(el);
                var has3d = computedStyle.getPropertyValue(transformProperty) || computedStyle[transformProperty];
                documentElement.removeChild(el);
                isTransform3dSupported = (has3d !== undefined && has3d.length > 0 && has3d !== 'none');
            }

            return isTransform3dSupported;
        },

        /**
         * whether support class list api
         * @returns {boolean}
         */
        isClassListSupported: function () {
            return isClassListSupportedState;
        },

        /**
         * whether support querySelectorAll
         * @returns {boolean}
         */
        isQuerySelectorSupported: function () {
            // force to use js selector engine
            return !S.config('dom/selector') && isQuerySelectorSupportedState;
        },

        getVendorCssPropPrefix: function (name) {
            return getVendorInfo(name).prefix;
        },

        getVendorCssPropName: function (name) {
            return getVendorInfo(name).name;
        }
    };
})(KISSY);