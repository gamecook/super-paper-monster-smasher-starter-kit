/**
 *  @hit-area.js
 *  @version: 1.1.0
 *  @author: Jesse Freeman
 *  @date: June 2013
 *  @copyright (c) 2013 Jesse Freeman, under The MIT License (see LICENSE)
 *
 *  v1.1.0 - Refactored pluggin to now inject hit area logic into the input class.
 */
ig.module(
    'bootstrap.plugins.hit-area'
)
    .requires(
    'impact.input'
)
    .defines(function () {

        /* HandJs v1.0.12 */
        (function () {
            // Polyfilling indexOf for old browsers
            if (!Array.prototype.indexOf) {
                Array.prototype.indexOf = function (searchElement) {
                    var t = Object(this);
                    var len = t.length >>> 0;
                    if (len === 0) {
                        return -1;
                    }
                    var n = 0;
                    if (arguments.length > 0) {
                        n = Number(arguments[1]);
                        if (n != n) { // shortcut for verifying if it's NaN
                            n = 0;
                        } else if (n != 0 && n != Infinity && n != -Infinity) {
                            n = (n > 0 || -1) * Math.floor(Math.abs(n));
                        }
                    }
                    if (n >= len) {
                        return -1;
                    }
                    var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
                    for (; k < len; k++) {
                        if (k in t && t[k] === searchElement) {
                            return k;
                        }
                    }
                    return -1;
                };
            }

            // Installing Hand.js
            var supportedEventsNames = ["PointerDown", "PointerUp", "PointerMove", "PointerOver", "PointerOut", "PointerCancel", "PointerEnter", "PointerLeave",
                                        "pointerdown", "pointerup", "pointermove", "pointerover", "pointerout", "pointercancel", "pointerenter", "pointerleave"
            ];

            var POINTER_TYPE_TOUCH = "touch";
            var POINTER_TYPE_PEN = "pen";
            var POINTER_TYPE_MOUSE = "mouse";

            var previousTargets = {};

            // Touch events
            var generateTouchClonedEvent = function (sourceEvent, newName) {
                // Considering touch events are almost like super mouse events
                var evObj;

                if (document.createEvent) {
                    evObj = document.createEvent('MouseEvents');
                    evObj.initMouseEvent(newName, true, true, window, 1, sourceEvent.screenX, sourceEvent.screenY,
                        sourceEvent.clientX, sourceEvent.clientY, sourceEvent.ctrlKey, sourceEvent.altKey,
                        sourceEvent.shiftKey, sourceEvent.metaKey, sourceEvent.button, null);
                }
                else {
                    evObj = document.createEventObject();
                    evObj.screenX = sourceEvent.screenX;
                    evObj.screenY = sourceEvent.screenY;
                    evObj.clientX = sourceEvent.clientX;
                    evObj.clientY = sourceEvent.clientY;
                    evObj.ctrlKey = sourceEvent.ctrlKey;
                    evObj.altKey = sourceEvent.altKey;
                    evObj.shiftKey = sourceEvent.shiftKey;
                    evObj.metaKey = sourceEvent.metaKey;
                    evObj.button = sourceEvent.button;
                }
                // offsets
                if (evObj.offsetX === undefined) {
                    if (sourceEvent.offsetX !== undefined) {

                        // For Opera which creates readonly properties
                        if (Object && Object.defineProperty !== undefined) {
                            Object.defineProperty(evObj, "offsetX", {
                                writable: true
                            });
                            Object.defineProperty(evObj, "offsetY", {
                                writable: true
                            });
                        }

                        evObj.offsetX = sourceEvent.offsetX;
                        evObj.offsetY = sourceEvent.offsetY;
                    }
                    else if (sourceEvent.layerX !== undefined) {
                        evObj.offsetX = sourceEvent.layerX - sourceEvent.currentTarget.offsetLeft;
                        evObj.offsetY = sourceEvent.layerY - sourceEvent.currentTarget.offsetTop;
                    }
                }

                // adding missing properties

                if (sourceEvent.isPrimary !== undefined)
                    evObj.isPrimary = sourceEvent.isPrimary;
                else
                    evObj.isPrimary = true;

                if (sourceEvent.pressure)
                    evObj.pressure = sourceEvent.pressure;
                else {
                    var button = 0;

                    if (sourceEvent.which !== undefined)
                        button = sourceEvent.which;
                    else if (sourceEvent.button !== undefined) {
                        button = sourceEvent.button;
                    }
                    evObj.pressure = (button == 0) ? 0 : 0.5;
                }


                if (sourceEvent.rotation)
                    evObj.rotation = sourceEvent.rotation;
                else
                    evObj.rotation = 0;

                // Timestamp
                if (sourceEvent.hwTimestamp)
                    evObj.hwTimestamp = sourceEvent.hwTimestamp;
                else
                    evObj.hwTimestamp = 0;

                // Tilts
                if (sourceEvent.tiltX)
                    evObj.tiltX = sourceEvent.tiltX;
                else
                    evObj.tiltX = 0;

                if (sourceEvent.tiltY)
                    evObj.tiltY = sourceEvent.tiltY;
                else
                    evObj.tiltY = 0;

                // Width and Height
                if (sourceEvent.height)
                    evObj.height = sourceEvent.height;
                else
                    evObj.height = 0;

                if (sourceEvent.width)
                    evObj.width = sourceEvent.width;
                else
                    evObj.width = 0;

                // PreventDefault
                evObj.preventDefault = function () {
                    if (sourceEvent.preventDefault !== undefined)
                        sourceEvent.preventDefault();
                };

                // Constants
                evObj.POINTER_TYPE_TOUCH = POINTER_TYPE_TOUCH;
                evObj.POINTER_TYPE_PEN = POINTER_TYPE_PEN;
                evObj.POINTER_TYPE_MOUSE = POINTER_TYPE_MOUSE;

                // Pointer values
                evObj.pointerId = sourceEvent.pointerId;
                evObj.pointerType = sourceEvent.pointerType;

                switch (evObj.pointerType) {// Old spec version check
                    case 2:
                        evObj.pointerType = evObj.POINTER_TYPE_TOUCH;
                        break;
                    case 3:
                        evObj.pointerType = evObj.POINTER_TYPE_PEN;
                        break;
                    case 4:
                        evObj.pointerType = evObj.POINTER_TYPE_MOUSE;
                        break;
                }

                // If force preventDefault
                if (sourceEvent.currentTarget && sourceEvent.currentTarget.handjs_forcePreventDefault === true)
                    evObj.preventDefault();

                // Fire event
                if (sourceEvent.target) {
                    sourceEvent.target.dispatchEvent(evObj);
                } else {
                    sourceEvent.srcElement.fireEvent("on" + getMouseEquivalentEventName(newName), evObj); // We must fallback to mouse event for very old browsers
                }
            };

            var generateMouseProxy = function (evt, eventName) {
                evt.pointerId = 1;
                evt.pointerType = POINTER_TYPE_MOUSE;
                generateTouchClonedEvent(evt, eventName);
            };

            var generateTouchEventProxy = function (name, touchPoint, target, eventObject) {
                var touchPointId = touchPoint.identifier + 2; // Just to not override mouse id

                touchPoint.pointerId = touchPointId;
                touchPoint.pointerType = POINTER_TYPE_TOUCH;
                touchPoint.currentTarget = target;
                touchPoint.target = target;

                if (eventObject.preventDefault !== undefined) {
                    touchPoint.preventDefault = function () {
                        eventObject.preventDefault();
                    };
                }

                generateTouchClonedEvent(touchPoint, name);
            };

            var generateTouchEventProxyIfRegistered = function (eventName, touchPoint, target, eventObject) { // Check if user registered this event
                if (target._handjs_registeredEvents) {
                    for (var index = 0; index < target._handjs_registeredEvents.length; index++) {
                        if (target._handjs_registeredEvents[index].toLowerCase() === eventName) {

                            generateTouchEventProxy(target._handjs_registeredEvents[index], touchPoint, target, eventObject);
                        }
                    }
                }
            };

            var handleOtherEvent = function (eventObject, name, useLocalTarget, checkRegistration) {
                if (eventObject.preventManipulation)
                    eventObject.preventManipulation();

                for (var i = 0; i < eventObject.changedTouches.length; ++i) {
                    var touchPoint = eventObject.changedTouches[i];

                    if (useLocalTarget) {
                        previousTargets[touchPoint.identifier] = touchPoint.target;
                    }

                    if (checkRegistration) {
                        generateTouchEventProxyIfRegistered(name, touchPoint, previousTargets[touchPoint.identifier], eventObject);
                    } else {
                        generateTouchEventProxy(name, touchPoint, previousTargets[touchPoint.identifier], eventObject);
                    }
                }
            };

            var getMouseEquivalentEventName = function (eventName) {
                return eventName.toLowerCase().replace("pointer", "mouse");
            };

            var getPrefixEventName = function (item, prefix, eventName) {
                var newEventName;

                if (eventName == eventName.toLowerCase()) {
                    var indexOfUpperCase = supportedEventsNames.indexOf(eventName) - (supportedEventsNames.length / 2);
                    newEventName = prefix + supportedEventsNames[indexOfUpperCase];
                }
                else {
                    newEventName = prefix + eventName;
                }

                // Fallback to PointerOver if PointerEnter is not currently supported
                if (newEventName === prefix + "PointerEnter" && item["on" + prefix.toLowerCase() + "pointerenter"] === undefined) {
                    newEventName = prefix + "PointerOver";
                }

                // Fallback to PointerOut if PointerLeave is not currently supported
                if (newEventName === prefix + "PointerLeave" && item["on" + prefix.toLowerCase() + "pointerleave"] === undefined) {
                    newEventName = prefix + "PointerOut";
                }

                return newEventName;
            };

            var registerOrUnregisterEvent = function (item, name, func, enable) {
                if (enable) {
                    item.addEventListener(name, func, false);
                } else {
                    item.removeEventListener(name, func);
                }
            };

            var setTouchAware = function (item, eventName, enable) {
                // If item is already touch aware, do nothing
                if (item.onpointerdown !== undefined) {
                    return;
                }

                // IE 10
                if (item.onmspointerdown !== undefined) {
                    var msEventName = getPrefixEventName(item, "MS", eventName);

                    registerOrUnregisterEvent(item, msEventName, function (evt) { generateTouchClonedEvent(evt, eventName); }, enable);

                    // We can return because MSPointerXXX integrate mouse support
                    return;
                }

                // Chrome, Firefox
                if (item.ontouchstart !== undefined) {
                    switch (eventName.toLowerCase()) {
                        case "pointermove":
                            registerOrUnregisterEvent(item, "touchmove", function (evt) { handleOtherEvent(evt, eventName); }, enable);
                            break;
                        case "pointercancel":
                            registerOrUnregisterEvent(item, "touchcancel", function (evt) { handleOtherEvent(evt, eventName); }, enable);
                            break;
                        case "pointerdown":
                        case "pointerup":
                        case "pointerout":
                        case "pointerover":
                        case "pointerleave":
                        case "pointerenter":
                            // These events will be handled by the window.ontouchmove function
                            if (!item._handjs_registeredEvents) {
                                item._handjs_registeredEvents = [];
                            }
                            var index = item._handjs_registeredEvents.indexOf(eventName);

                            if (enable) {
                                if (index === -1) {
                                    item._handjs_registeredEvents.push(eventName);
                                }
                            } else {
                                item._handjs_registeredEvents.splice(index, 1);
                            }
                            break;
                    }
                }

                // Fallback to mouse
                switch (eventName.toLowerCase()) {
                    case "pointerdown":
                        registerOrUnregisterEvent(item, "mousedown", function (evt) { generateMouseProxy(evt, eventName); }, enable);
                        break;
                    case "pointermove":
                        registerOrUnregisterEvent(item, "mousemove", function (evt) { generateMouseProxy(evt, eventName); }, enable);
                        break;
                    case "pointerup":
                        registerOrUnregisterEvent(item, "mouseup", function (evt) { generateMouseProxy(evt, eventName); }, enable);
                        break;
                    case "pointerover":
                        registerOrUnregisterEvent(item, "mouseover", function (evt) { generateMouseProxy(evt, eventName); }, enable);
                        break;
                    case "pointerout":
                        registerOrUnregisterEvent(item, "mouseout", function (evt) { generateMouseProxy(evt, eventName); }, enable);
                        break;
                    case "pointerenter":
                        if (item.onmouseenter === undefined) { // Fallback to mouseover
                            registerOrUnregisterEvent(item, "mouseover", function (evt) { generateMouseProxy(evt, eventName); }, enable);
                        } else {
                            registerOrUnregisterEvent(item, "mouseenter", function (evt) { generateMouseProxy(evt, eventName); }, enable);
                        }
                        break;
                    case "pointerleave":
                        if (item.onmouseleave === undefined) { // Fallback to mouseout
                            registerOrUnregisterEvent(item, "mouseout", function (evt) { generateMouseProxy(evt, eventName); }, enable);
                        } else {
                            registerOrUnregisterEvent(item, "mouseleave", function (evt) { generateMouseProxy(evt, eventName); }, enable);
                        }
                        break;
                }
            };

            // Intercept addEventListener calls by changing the prototype
            var interceptAddEventListener = function (root) {
                var current = root.prototype ? root.prototype.addEventListener : root.addEventListener;

                var customAddEventListener = function (name, func, capture) {
                    // Branch when a PointerXXX is used
                    if (supportedEventsNames.indexOf(name) != -1) {
                        setTouchAware(this, name, true);
                    }

                    if (current === undefined) {
                        this.attachEvent("on" + getMouseEquivalentEventName(name), func);
                    } else {
                        current.call(this, name, func, capture);
                    }
                };

                if (root.prototype) {
                    root.prototype.addEventListener = customAddEventListener;
                } else {
                    root.addEventListener = customAddEventListener;
                }
            };

            // Intercept removeEventListener calls by changing the prototype
            var interceptRemoveEventListener = function (root) {
                var current = root.prototype ? root.prototype.removeEventListener : root.removeEventListener;

                var customRemoveEventListener = function (name, func, capture) {
                    // Release when a PointerXXX is used
                    if (supportedEventsNames.indexOf(name) != -1) {
                        setTouchAware(this, name, false);
                    }

                    if (current === undefined) {
                        this.detachEvent(getMouseEquivalentEventName(name), func);
                    } else {
                        current.call(this, name, func, capture);
                    }
                };
                if (root.prototype) {
                    root.prototype.removeEventListener = customRemoveEventListener;
                } else {
                    root.removeEventListener = customRemoveEventListener;
                }
            };

            // Hooks
            interceptAddEventListener(document);
            interceptAddEventListener(HTMLBodyElement);
            interceptAddEventListener(HTMLDivElement);
            interceptAddEventListener(HTMLImageElement);
            interceptAddEventListener(HTMLSpanElement);
            interceptAddEventListener(HTMLUListElement);
            interceptAddEventListener(HTMLAnchorElement);
            interceptAddEventListener(HTMLLIElement);
            if (window.HTMLCanvasElement) {
                interceptAddEventListener(HTMLCanvasElement);
            }
            if (window.SVGElement) {
                interceptAddEventListener(SVGElement);
            }


            interceptRemoveEventListener(document);
            interceptRemoveEventListener(HTMLBodyElement);
            interceptRemoveEventListener(HTMLDivElement);
            interceptRemoveEventListener(HTMLImageElement);
            interceptRemoveEventListener(HTMLSpanElement);
            interceptRemoveEventListener(HTMLUListElement);
            interceptRemoveEventListener(HTMLAnchorElement);
            interceptRemoveEventListener(HTMLLIElement);
            if (window.HTMLCanvasElement) {
                interceptRemoveEventListener(HTMLCanvasElement);
            }
            if (window.SVGElement) {
                interceptRemoveEventListener(SVGElement);
            }

            // Handling move on window to detect pointerleave/out/over
            if (window.ontouchstart !== undefined) {
                window.addEventListener('touchstart', function (eventObject) {
                    for (var i = 0; i < eventObject.changedTouches.length; ++i) {
                        var touchPoint = eventObject.changedTouches[i];
                        previousTargets[touchPoint.identifier] = touchPoint.target;

                        generateTouchEventProxyIfRegistered("pointerenter", touchPoint, touchPoint.target, eventObject);
                        generateTouchEventProxyIfRegistered("pointerover", touchPoint, touchPoint.target, eventObject);
                        generateTouchEventProxyIfRegistered("pointerdown", touchPoint, touchPoint.target, eventObject);
                    }
                });

                window.addEventListener('touchend', function (eventObject) {
                    for (var i = 0; i < eventObject.changedTouches.length; ++i) {
                        var touchPoint = eventObject.changedTouches[i];
                        var currentTarget = previousTargets[touchPoint.identifier];

                        generateTouchEventProxyIfRegistered("pointerup", touchPoint, currentTarget, eventObject);
                        generateTouchEventProxyIfRegistered("pointerout", touchPoint, currentTarget, eventObject);
                        generateTouchEventProxyIfRegistered("pointerleave", touchPoint, currentTarget, eventObject);
                    }
                });

                window.addEventListener('touchmove', function (eventObject) {
                    for (var i = 0; i < eventObject.changedTouches.length; ++i) {
                        var touchPoint = eventObject.changedTouches[i];
                        var newTarget = document.elementFromPoint(touchPoint.clientX, touchPoint.clientY);
                        var currentTarget = previousTargets[touchPoint.identifier];

                        if (currentTarget === newTarget) {
                            continue; // We can skip this as the pointer is effectively over the current target
                        }

                        if (currentTarget) {
                            // Raise out
                            generateTouchEventProxyIfRegistered("pointerout", touchPoint, currentTarget, eventObject);

                            // Raise leave
                            if (!currentTarget.contains(newTarget)) { // Leave must be called if the new target is not a child of the current
                                generateTouchEventProxyIfRegistered("pointerleave", touchPoint, currentTarget, eventObject);
                            }
                        }

                        if (newTarget) {
                            // Raise over
                            generateTouchEventProxyIfRegistered("pointerover", touchPoint, newTarget, eventObject);

                            // Raise enter
                            if (!newTarget.contains(currentTarget)) { // Leave must be called if the new target is not the parent of the current
                                generateTouchEventProxyIfRegistered("pointerenter", touchPoint, newTarget, eventObject);
                            }
                        }
                        previousTargets[touchPoint.identifier] = newTarget;
                    }
                });
            }

            // Extension to navigator
            if (navigator.pointerEnabled === undefined) {

                // Indicates if the browser will fire pointer events for pointing input
                navigator.pointerEnabled = true;

                // IE
                if (navigator.msPointerEnabled) {
                    navigator.maxTouchPoints = navigator.msMaxTouchPoints;
                }
            }

            // Handling touch-action css rule
            if (document.styleSheets && document.addEventListener) {
                document.addEventListener("DOMContentLoaded", function () {

                    var trim = function (string) {
                        return string.replace(/^\s+|\s+$/, '');
                    };

                    var processStylesheet = function (unfilteredSheet) {
                        var globalRegex = new RegExp(".+?{.*?}", "m");
                        var selectorRegex = new RegExp(".+?{", "m");

                        while (unfilteredSheet != "") {
                            var block = globalRegex.exec(unfilteredSheet)[0];
                            unfilteredSheet = trim(unfilteredSheet.replace(block, ""));
                            var selectorText = trim(selectorRegex.exec(block)[0].replace("{", ""));

                            // Checking if the user wanted to deactivate the default behavior
                            if (block.replace(/\s/g, "").indexOf("touch-action:none") != -1) {
                                var elements = document.querySelectorAll(selectorText);

                                for (var elementIndex = 0; elementIndex < elements.length; elementIndex++) {
                                    var element = elements[elementIndex];

                                    if (element.style.msTouchAction !== undefined) {
                                        element.style.msTouchAction = "none";
                                    }
                                    else {
                                        element.handjs_forcePreventDefault = true;
                                    }
                                }
                            }
                        }
                    }; // Looking for touch-action in referenced stylesheets
                    try {
                        for (var index = 0; index < document.styleSheets.length; index++) {
                            var sheet = document.styleSheets[index];

                            if (sheet.href == undefined) { // it is an inline style
                                continue;
                            }

                            // Loading the original stylesheet
                            var xhr = new XMLHttpRequest();
                            xhr.open("get", sheet.href, false);
                            xhr.send();

                            var unfilteredSheet = xhr.responseText.replace(/(\n|\r)/g, "");

                            processStylesheet(unfilteredSheet);
                        }
                    } catch (e) {
                        // Silently fail...
                    }

                    // Looking for touch-action in inline styles
                    var styles = document.getElementsByTagName("style");
                    for (var index = 0; index < styles.length; index++) {
                        var inlineSheet = styles[index];

                        var inlineUnfilteredSheet = trim(inlineSheet.innerHTML.replace(/(\n|\r)/g, ""));

                        processStylesheet(inlineUnfilteredSheet);
                    }
                }, false);
            }

        })();

        /* Inject code for input class */
        ig.Input.inject({
            hitAreas: [],
            debugHitAreas: true,
            pointers: {},
            touchType: null,
            init: function () {
                //Setup new pointer events on canvas and link them to the input class
                var el = ig.system.canvas;
                el.addEventListener("selectstart", function(e) { e.preventDefault(); }, false);
                el.addEventListener('PointerDown', this.touchStart.bind(this), false);
                el.addEventListener('PointerUp', this.touchEnd.bind(this), false);
                el.addEventListener('PointerMove', this.touchMove.bind(this), false);
            },
            unbind: function (key) {
                this.parent(key);
                this.removeHitArea(key);
            },
            unbindAll: function () {
                this.parent();
                this.hitAreas = [];
            },
            initMouse: function () {
                // TODO need to figrue out/test how to handle other mouse events
                if (this.isUsingMouse) { return; }
                this.isUsingMouse = true;
                var mouseWheelBound = this.mousewheel.bind(this);
                ig.system.canvas.addEventListener('mousewheel', mouseWheelBound, false);
                ig.system.canvas.addEventListener('DOMMouseScroll', mouseWheelBound, false);
                ig.system.canvas.addEventListener('contextmenu', this.contextmenu.bind(this), false);
            },
            touchStart: function (ev) {
                ev.preventDefault();
                this.touchType = ev.pointerType;

                // calculate the correct x,y position from canvas
                var tmpX = Math.round((ev.x - Number(canvas.style.left.slice(0, -2))) * (ig.system.canvas.width / Number(canvas.style.width.slice(0, -2))));
                var tmpY = Math.round((ev.y - Number(canvas.style.top.slice(0, -2))) * (ig.system.canvas.height / Number(canvas.style.height.slice(0, -2))));

                // test
                var hits = this.testHitAreas(tmpX, tmpY);

                this.pointers[ev.pointerId] = { x: tmpX, y: tmpY, hits: hits };

                var total = hits.length;
                for (var i = 0; i < total; i++) {
                    var action = hits[i];
                    this.actions[action] = true;
                    if (!this.locks[action]) {
                        this.presses[action] = true;
                        this.locks[action] = true;
                        //console.log(action, "pressed");
                    }
                }

            },
            touchMove: function (ev) {

                ev.preventDefault();

                var tmpX = Math.round((ev.x - Number(canvas.style.left.slice(0, -2))) * (ig.system.canvas.width / Number(canvas.style.width.slice(0, -2))));
                var tmpY = Math.round((ev.y - Number(canvas.style.top.slice(0, -2))) * (ig.system.canvas.height / Number(canvas.style.height.slice(0, -2))));

                if (this.pointers.hasOwnProperty(ev.pointerId)) {
                    this.pointers[ev.pointerId].x = tmpX;
                    this.pointers[ev.pointerId].y = tmpY;
                }
            },
            touchEnd: function (ev) {
                ev.preventDefault();

                var hits = this.pointers[ev.pointerId].hits;
                //console.log("release", hits);
                var total = hits.length;
                for (var i = 0; i < total; i++) {
                    var action = hits[i];
                    this.delayedKeyup[action] = true;
                }

                delete this.pointers[ev.pointerId];
            },
            registerHitArea: function (name, x, y, width, height, touchType, debugColor) {
                var newHitArea = new Rectangle(x, y, width, height, debugColor);
                newHitArea.name = name;
                newHitArea.touchType = touchType || "any";
                //console.log("type", newHitArea.touchType);
                this.hitAreas.push(newHitArea);
                return newHitArea;
            },
            testHitAreas: function (x, y) {
                var results = [];
                var i = 0;
                var total = this.hitAreas.length;
                var tmpHitArea;

                for (i; i < total; i++) {
                    tmpHitArea = this.hitAreas[i];
                    if (tmpHitArea.touchType == "any" || tmpHitArea.touchType == this.touchType) {
                        if (tmpHitArea.contains(x, y)) {
                            results.push(tmpHitArea.name);
                        }
                    }
                }

                return results;
            },
            getHitArea: function (name) {
                var i = 0;
                var total = this.hitAreas.length;
                var tmpHitArea;

                for (i; i < total; i++) {
                    tmpHitArea = this.hitAreas[i];
                    if (tmpHitArea.name == name)
                        return tmpHitArea;
                }

                return null;
            },
            updateHitArea: function (name, properties) {

                var tmpHitArea = this.getHitArea(name);
                if (!tmpHitArea)
                    return;

                for (var propt in properties) {
                    tmpHitArea[propt] = properties[propt];
                }
            },
            removeHitArea: function (name) {
                var i = 0;
                var total = this.hitAreas.length;
                var tmpHitArea;

                for (i; i < total; i++) {
                    tmpHitArea = this.hitAreas[i];
                    if (tmpHitArea.name == name);
                    //TODO remvove from array and return the hitarea
                }
            },
            clearHitAreas: function () {
                this.hitAreas = [];
            },
            draw: function () {

                // Debug for hitareas
                var total = this.hitAreas.length;
                var i = 0;
                var ctx = ig.system.context;
                var rect;
                for (i; i < total; i++) {
                    rect = this.hitAreas[i];
                    if (rect.name != "left" || rect.name != "right") {
                        ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
                        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
                    }
                }

            }
        });

        Rectangle = ig.Class.extend({
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            debugColor: 0xffffff,
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            init: function (x, y, width, height, debugColor) {
                this.resize(x, y, width, height);

                //TODO need to make sure this works
                if (debugColor)
                    this.debugColor = debugColor;
            },
            resize: function (x, y, width, height) {
                this.x = x;
                this.y = y;
                this.width = width;
                this.height = height;
                this.left = this.x;
                this.right = this.x + this.width;
                this.top = this.y;
                this.bottom = this.y + this.height;
            },
            contains: function (x, y) {
                if (x >= this.x && x <= this.right && y >= this.y && y <= this.bottom) {
                    return true;
                }
                return false;
            }

        })

    })