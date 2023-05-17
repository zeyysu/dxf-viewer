// Forked from three/examples/js/controls/OrbitControls.js to implement additional features (e.g.
// zooming on cursor).
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    OrbitControls: function() {
        return OrbitControls;
    },
    MapControls: function() {
        return MapControls;
    }
});
var _three = /*#__PURE__*/ _interop_require_wildcard(require("three"));
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {};
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
var OrbitControls = function OrbitControls(object, domElement) {
    var getAutoRotationAngle = function getAutoRotationAngle() {
        return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
    };
    var getZoomScale = function getZoomScale() {
        return Math.pow(0.95, scope.zoomSpeed);
    };
    var rotateLeft = function rotateLeft(angle) {
        sphericalDelta.theta -= angle;
    };
    var rotateUp = function rotateUp(angle) {
        sphericalDelta.phi -= angle;
    };
    var zoomPan = function zoomPan(zoomRatio, zoomCenter) {
        var panX = (zoomCenter.x - scope.domElement.width / 2) * (zoomRatio - 1) / zoomRatio;
        var panY = (zoomCenter.y - scope.domElement.height / 2) * (zoomRatio - 1) / zoomRatio;
        pan(-panX, -panY);
    };
    var dollyOut = function dollyOut(dollyScale, zoomCenter) {
        if (scope.object.isPerspectiveCamera) {
            scale /= dollyScale;
        } else if (scope.object.isOrthographicCamera) {
            var newZoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom * dollyScale));
            zoomPan(newZoom / scope.object.zoom, zoomCenter);
            scope.object.zoom = newZoom;
            scope.object.updateProjectionMatrix();
            zoomChanged = true;
        } else {
            console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.");
            scope.enableZoom = false;
        }
    };
    var dollyIn = function dollyIn(dollyScale, zoomCenter) {
        if (scope.object.isPerspectiveCamera) {
            scale *= dollyScale;
        } else if (scope.object.isOrthographicCamera) {
            var newZoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom / dollyScale));
            zoomPan(newZoom / scope.object.zoom, zoomCenter);
            scope.object.zoom = newZoom;
            scope.object.updateProjectionMatrix();
            zoomChanged = true;
        } else {
            console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.");
            scope.enableZoom = false;
        }
    };
    var handleMouseDownRotate = //
    // event callbacks - update the object state
    //
    function handleMouseDownRotate(event) {
        rotateStart.set(event.clientX, event.clientY);
    };
    var handleMouseDownDolly = function handleMouseDownDolly(event) {
        dollyStart.set(event.clientX, event.clientY);
    };
    var handleMouseDownPan = function handleMouseDownPan(event) {
        panStart.set(event.clientX, event.clientY);
    };
    var handleMouseMoveRotate = function handleMouseMoveRotate(event) {
        rotateEnd.set(event.clientX, event.clientY);
        rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);
        var element = scope.domElement;
        rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight); // yes, height
        rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);
        rotateStart.copy(rotateEnd);
        scope.update();
    };
    var handleMouseMoveDolly = function handleMouseMoveDolly(event) {
        dollyEnd.set(event.clientX, event.clientY);
        dollyDelta.subVectors(dollyEnd, dollyStart);
        if (dollyDelta.y > 0) {
            dollyOut(getZoomScale());
        } else if (dollyDelta.y < 0) {
            dollyIn(getZoomScale());
        }
        dollyStart.copy(dollyEnd);
        scope.update();
    };
    var handleMouseMovePan = function handleMouseMovePan(event) {
        panEnd.set(event.clientX, event.clientY);
        panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);
        pan(panDelta.x, panDelta.y);
        panStart.copy(panEnd);
        scope.update();
    };
    var handleMouseUp = function handleMouseUp() {
    // no-op
    };
    var handleMouseWheel = function handleMouseWheel(event) {
        var canvasRect = scope.domElement.getBoundingClientRect();
        var zoomCenter = new _three.Vector2(event.clientX - canvasRect.left, event.clientY - canvasRect.top);
        if (event.deltaY < 0) {
            dollyIn(getZoomScale(), zoomCenter);
        } else if (event.deltaY > 0) {
            dollyOut(getZoomScale(), zoomCenter);
        }
        scope.update();
    };
    var handleKeyDown = function handleKeyDown(event) {
        var needsUpdate = false;
        switch(event.keyCode){
            case scope.keys.UP:
                pan(0, scope.keyPanSpeed);
                needsUpdate = true;
                break;
            case scope.keys.BOTTOM:
                pan(0, -scope.keyPanSpeed);
                needsUpdate = true;
                break;
            case scope.keys.LEFT:
                pan(scope.keyPanSpeed, 0);
                needsUpdate = true;
                break;
            case scope.keys.RIGHT:
                pan(-scope.keyPanSpeed, 0);
                needsUpdate = true;
                break;
        }
        if (needsUpdate) {
            // prevent the browser from scrolling on cursor keys
            event.preventDefault();
            scope.update();
        }
    };
    var handleTouchStartRotate = function handleTouchStartRotate(event) {
        if (event.touches.length == 1) {
            rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
        } else {
            var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
            var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);
            rotateStart.set(x, y);
        }
    };
    var handleTouchStartPan = function handleTouchStartPan(event) {
        if (event.touches.length == 1) {
            panStart.set(event.touches[0].pageX, event.touches[0].pageY);
        } else {
            var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
            var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);
            panStart.set(x, y);
        }
    };
    var handleTouchStartDolly = function handleTouchStartDolly(event) {
        var dx = event.touches[0].pageX - event.touches[1].pageX;
        var dy = event.touches[0].pageY - event.touches[1].pageY;
        var distance = Math.sqrt(dx * dx + dy * dy);
        dollyStart.set(0, distance);
    };
    var handleTouchStartDollyPan = function handleTouchStartDollyPan(event) {
        if (scope.enableZoom) handleTouchStartDolly(event);
        if (scope.enablePan) handleTouchStartPan(event);
    };
    var handleTouchStartDollyRotate = function handleTouchStartDollyRotate(event) {
        if (scope.enableZoom) handleTouchStartDolly(event);
        if (scope.enableRotate) handleTouchStartRotate(event);
    };
    var handleTouchMoveRotate = function handleTouchMoveRotate(event) {
        if (event.touches.length == 1) {
            rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
        } else {
            var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
            var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);
            rotateEnd.set(x, y);
        }
        rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);
        var element = scope.domElement;
        rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight); // yes, height
        rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);
        rotateStart.copy(rotateEnd);
    };
    var handleTouchMovePan = function handleTouchMovePan(event) {
        if (event.touches.length == 1) {
            panEnd.set(event.touches[0].pageX, event.touches[0].pageY);
        } else {
            var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
            var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);
            panEnd.set(x, y);
        }
        panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);
        pan(panDelta.x, panDelta.y);
        panStart.copy(panEnd);
    };
    var handleTouchMoveDolly = function handleTouchMoveDolly(event) {
        var dx = event.touches[0].pageX - event.touches[1].pageX;
        var dy = event.touches[0].pageY - event.touches[1].pageY;
        var distance = Math.sqrt(dx * dx + dy * dy);
        dollyEnd.set(0, distance);
        dollyDelta.set(0, Math.pow(dollyEnd.y / dollyStart.y, scope.zoomSpeed));
        dollyOut(dollyDelta.y);
        dollyStart.copy(dollyEnd);
    };
    var handleTouchMoveDollyPan = function handleTouchMoveDollyPan(event) {
        if (scope.enableZoom) handleTouchMoveDolly(event);
        if (scope.enablePan) handleTouchMovePan(event);
    };
    var handleTouchMoveDollyRotate = function handleTouchMoveDollyRotate(event) {
        if (scope.enableZoom) handleTouchMoveDolly(event);
        if (scope.enableRotate) handleTouchMoveRotate(event);
    };
    var handleTouchEnd = function handleTouchEnd() {
    // no-op
    };
    var onPointerDown = //
    // event handlers - FSM: listen for events and reset state
    //
    function onPointerDown(event) {
        if (scope.enabled === false) return;
        switch(event.pointerType){
            case "mouse":
            case "pen":
                onMouseDown(event);
                break;
        }
    };
    var onPointerMove = function onPointerMove(event) {
        if (scope.enabled === false) return;
        switch(event.pointerType){
            case "mouse":
            case "pen":
                onMouseMove(event);
                break;
        }
    };
    var onPointerUp = function onPointerUp(event) {
        switch(event.pointerType){
            case "mouse":
            case "pen":
                onMouseUp(event);
                break;
        }
    };
    var onMouseDown = function onMouseDown(event) {
        // Prevent the browser from scrolling.
        event.preventDefault();
        // Manually set the focus since calling preventDefault above
        // prevents the browser from setting it automatically.
        scope.domElement.focus ? scope.domElement.focus() : window.focus();
        var mouseAction;
        switch(event.button){
            case 0:
                mouseAction = scope.mouseButtons.LEFT;
                break;
            case 1:
                mouseAction = scope.mouseButtons.MIDDLE;
                break;
            case 2:
                mouseAction = scope.mouseButtons.RIGHT;
                break;
            default:
                mouseAction = -1;
        }
        switch(mouseAction){
            case _three.MOUSE.DOLLY:
                if (scope.enableZoom === false) return;
                handleMouseDownDolly(event);
                state = STATE.DOLLY;
                break;
            case _three.MOUSE.ROTATE:
                if (event.ctrlKey || event.metaKey || event.shiftKey) {
                    if (scope.enablePan === false) return;
                    handleMouseDownPan(event);
                    state = STATE.PAN;
                } else {
                    if (scope.enableRotate === false) return;
                    handleMouseDownRotate(event);
                    state = STATE.ROTATE;
                }
                break;
            case _three.MOUSE.PAN:
                if (event.ctrlKey || event.metaKey || event.shiftKey) {
                    if (scope.enableRotate === false) return;
                    handleMouseDownRotate(event);
                    state = STATE.ROTATE;
                } else {
                    if (scope.enablePan === false) return;
                    handleMouseDownPan(event);
                    state = STATE.PAN;
                }
                break;
            default:
                state = STATE.NONE;
        }
        if (state !== STATE.NONE) {
            scope.domElement.ownerDocument.addEventListener("pointermove", onPointerMove);
            scope.domElement.ownerDocument.addEventListener("pointerup", onPointerUp);
            scope.dispatchEvent(startEvent);
        }
    };
    var onMouseMove = function onMouseMove(event) {
        if (scope.enabled === false) return;
        event.preventDefault();
        switch(state){
            case STATE.ROTATE:
                if (scope.enableRotate === false) return;
                handleMouseMoveRotate(event);
                break;
            case STATE.DOLLY:
                if (scope.enableZoom === false) return;
                handleMouseMoveDolly(event);
                break;
            case STATE.PAN:
                if (scope.enablePan === false) return;
                handleMouseMovePan(event);
                break;
        }
    };
    var onMouseUp = function onMouseUp(event) {
        scope.domElement.ownerDocument.removeEventListener("pointermove", onPointerMove);
        scope.domElement.ownerDocument.removeEventListener("pointerup", onPointerUp);
        if (scope.enabled === false) return;
        handleMouseUp(event);
        scope.dispatchEvent(endEvent);
        state = STATE.NONE;
    };
    var onMouseWheel = function onMouseWheel(event) {
        if (scope.enabled === false || scope.enableZoom === false || state !== STATE.NONE && state !== STATE.ROTATE) return;
        event.preventDefault();
        event.stopPropagation();
        scope.dispatchEvent(startEvent);
        handleMouseWheel(event);
        scope.dispatchEvent(endEvent);
    };
    var onKeyDown = function onKeyDown(event) {
        if (scope.enabled === false || scope.enablePan === false) return;
        handleKeyDown(event);
    };
    var onTouchStart = function onTouchStart(event) {
        if (scope.enabled === false) return;
        event.preventDefault(); // prevent scrolling
        switch(event.touches.length){
            case 1:
                switch(scope.touches.ONE){
                    case _three.TOUCH.ROTATE:
                        if (scope.enableRotate === false) return;
                        handleTouchStartRotate(event);
                        state = STATE.TOUCH_ROTATE;
                        break;
                    case _three.TOUCH.PAN:
                        if (scope.enablePan === false) return;
                        handleTouchStartPan(event);
                        state = STATE.TOUCH_PAN;
                        break;
                    default:
                        state = STATE.NONE;
                }
                break;
            case 2:
                switch(scope.touches.TWO){
                    case _three.TOUCH.DOLLY_PAN:
                        if (scope.enableZoom === false && scope.enablePan === false) return;
                        handleTouchStartDollyPan(event);
                        state = STATE.TOUCH_DOLLY_PAN;
                        break;
                    case _three.TOUCH.DOLLY_ROTATE:
                        if (scope.enableZoom === false && scope.enableRotate === false) return;
                        handleTouchStartDollyRotate(event);
                        state = STATE.TOUCH_DOLLY_ROTATE;
                        break;
                    default:
                        state = STATE.NONE;
                }
                break;
            default:
                state = STATE.NONE;
        }
        if (state !== STATE.NONE) {
            scope.dispatchEvent(startEvent);
        }
    };
    var onTouchMove = function onTouchMove(event) {
        if (scope.enabled === false) return;
        event.preventDefault(); // prevent scrolling
        event.stopPropagation();
        switch(state){
            case STATE.TOUCH_ROTATE:
                if (scope.enableRotate === false) return;
                handleTouchMoveRotate(event);
                scope.update();
                break;
            case STATE.TOUCH_PAN:
                if (scope.enablePan === false) return;
                handleTouchMovePan(event);
                scope.update();
                break;
            case STATE.TOUCH_DOLLY_PAN:
                if (scope.enableZoom === false && scope.enablePan === false) return;
                handleTouchMoveDollyPan(event);
                scope.update();
                break;
            case STATE.TOUCH_DOLLY_ROTATE:
                if (scope.enableZoom === false && scope.enableRotate === false) return;
                handleTouchMoveDollyRotate(event);
                scope.update();
                break;
            default:
                state = STATE.NONE;
        }
    };
    var onTouchEnd = function onTouchEnd(event) {
        if (scope.enabled === false) return;
        handleTouchEnd(event);
        scope.dispatchEvent(endEvent);
        state = STATE.NONE;
    };
    var onContextMenu = function onContextMenu(event) {
        if (scope.enabled === false) return;
        event.preventDefault();
    };
    if (domElement === undefined) console.warn('THREE.OrbitControls: The second parameter "domElement" is now mandatory.');
    // if ( domElement === document ) console.error( 'THREE.OrbitControls: "document" should not be used as the target "domElement". Please use "renderer.domElement" instead.' );
    this.object = object;
    this.domElement = domElement;
    // Set to false to disable this control
    this.enabled = true;
    // "target" sets the location of focus, where the object orbits around
    this.target = new _three.Vector3();
    // How far you can dolly in and out ( PerspectiveCamera only )
    this.minDistance = 0;
    this.maxDistance = Infinity;
    // How far you can zoom in and out ( OrthographicCamera only )
    this.minZoom = 0;
    this.maxZoom = Infinity;
    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians.
    this.minPolarAngle = 0; // radians
    this.maxPolarAngle = Math.PI; // radians
    // How far you can orbit horizontally, upper and lower limits.
    // If set, the interval [ min, max ] must be a sub-interval of [ - 2 PI, 2 PI ], with ( max - min < 2 PI )
    this.minAzimuthAngle = -Infinity; // radians
    this.maxAzimuthAngle = Infinity; // radians
    // Set to true to enable damping (inertia)
    // If damping is enabled, you must call controls.update() in your animation loop
    this.enableDamping = false;
    this.dampingFactor = 0.05;
    // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
    // Set to false to disable zooming
    this.enableZoom = true;
    this.zoomSpeed = 1.0;
    // Set to false to disable rotating
    this.enableRotate = true;
    this.rotateSpeed = 1.0;
    // Set to false to disable panning
    this.enablePan = true;
    this.panSpeed = 1.0;
    this.screenSpacePanning = true; // if false, pan orthogonal to world-space direction camera.up
    this.keyPanSpeed = 7.0; // pixels moved per arrow key push
    // Set to true to automatically rotate around the target
    // If auto-rotate is enabled, you must call controls.update() in your animation loop
    this.autoRotate = false;
    this.autoRotateSpeed = 2.0; // 30 seconds per orbit when fps is 60
    // The four arrow keys
    this.keys = {
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        BOTTOM: 40
    };
    // Mouse buttons
    this.mouseButtons = {
        LEFT: _three.MOUSE.ROTATE,
        MIDDLE: _three.MOUSE.DOLLY,
        RIGHT: _three.MOUSE.PAN
    };
    // Touch fingers
    this.touches = {
        ONE: _three.TOUCH.ROTATE,
        TWO: _three.TOUCH.DOLLY_PAN
    };
    // for reset
    this.target0 = this.target.clone();
    this.position0 = this.object.position.clone();
    this.zoom0 = this.object.zoom;
    // the target DOM element for key events
    this._domElementKeyEvents = null;
    //
    // public methods
    //
    this.getPolarAngle = function() {
        return spherical.phi;
    };
    this.getAzimuthalAngle = function() {
        return spherical.theta;
    };
    this.listenToKeyEvents = function(domElement) {
        domElement.addEventListener("keydown", onKeyDown);
        this._domElementKeyEvents = domElement;
    };
    this.saveState = function() {
        scope.target0.copy(scope.target);
        scope.position0.copy(scope.object.position);
        scope.zoom0 = scope.object.zoom;
    };
    this.reset = function() {
        scope.target.copy(scope.target0);
        scope.object.position.copy(scope.position0);
        scope.object.zoom = scope.zoom0;
        scope.object.updateProjectionMatrix();
        scope.dispatchEvent(changeEvent);
        scope.update();
        state = STATE.NONE;
    };
    // this method is exposed, but perhaps it would be better if we can make it private...
    this.update = function() {
        var offset = new _three.Vector3();
        // so camera.up is the orbit axis
        var quat = new _three.Quaternion().setFromUnitVectors(object.up, new _three.Vector3(0, 1, 0));
        var quatInverse = quat.clone().invert();
        var lastPosition = new _three.Vector3();
        var lastQuaternion = new _three.Quaternion();
        var twoPI = 2 * Math.PI;
        return function update() {
            var position = scope.object.position;
            offset.copy(position).sub(scope.target);
            // rotate offset to "y-axis-is-up" space
            offset.applyQuaternion(quat);
            // angle from z-axis around y-axis
            spherical.setFromVector3(offset);
            if (scope.autoRotate && state === STATE.NONE) {
                rotateLeft(getAutoRotationAngle());
            }
            if (scope.enableDamping) {
                spherical.theta += sphericalDelta.theta * scope.dampingFactor;
                spherical.phi += sphericalDelta.phi * scope.dampingFactor;
            } else {
                spherical.theta += sphericalDelta.theta;
                spherical.phi += sphericalDelta.phi;
            }
            // restrict theta to be between desired limits
            var min = scope.minAzimuthAngle;
            var max = scope.maxAzimuthAngle;
            if (isFinite(min) && isFinite(max)) {
                if (min < -Math.PI) min += twoPI;
                else if (min > Math.PI) min -= twoPI;
                if (max < -Math.PI) max += twoPI;
                else if (max > Math.PI) max -= twoPI;
                if (min <= max) {
                    spherical.theta = Math.max(min, Math.min(max, spherical.theta));
                } else {
                    spherical.theta = spherical.theta > (min + max) / 2 ? Math.max(min, spherical.theta) : Math.min(max, spherical.theta);
                }
            }
            // restrict phi to be between desired limits
            spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, spherical.phi));
            spherical.makeSafe();
            spherical.radius *= scale;
            // restrict radius to be between desired limits
            spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, spherical.radius));
            // move target to panned location
            if (scope.enableDamping === true) {
                scope.target.addScaledVector(panOffset, scope.dampingFactor);
            } else {
                scope.target.add(panOffset);
            }
            offset.setFromSpherical(spherical);
            // rotate offset back to "camera-up-vector-is-up" space
            offset.applyQuaternion(quatInverse);
            position.copy(scope.target).add(offset);
            scope.object.lookAt(scope.target);
            if (scope.enableDamping === true) {
                sphericalDelta.theta *= 1 - scope.dampingFactor;
                sphericalDelta.phi *= 1 - scope.dampingFactor;
                panOffset.multiplyScalar(1 - scope.dampingFactor);
            } else {
                sphericalDelta.set(0, 0, 0);
                panOffset.set(0, 0, 0);
            }
            scale = 1;
            // update condition is:
            // min(camera displacement, camera rotation in radians)^2 > EPS
            // using small-angle approximation cos(x/2) = 1 - x^2 / 8
            if (zoomChanged || lastPosition.distanceToSquared(scope.object.position) > EPS || 8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS) {
                scope.dispatchEvent(changeEvent);
                lastPosition.copy(scope.object.position);
                lastQuaternion.copy(scope.object.quaternion);
                zoomChanged = false;
                return true;
            }
            return false;
        };
    }();
    this.dispose = function() {
    // scope.domElement.removeEventListener( 'contextmenu', onContextMenu );
    // scope.domElement.removeEventListener( 'pointerdown', onPointerDown );
    // scope.domElement.removeEventListener( 'wheel', onMouseWheel );
    // scope.domElement.removeEventListener( 'touchstart', onTouchStart );
    // scope.domElement.removeEventListener( 'touchend', onTouchEnd );
    // scope.domElement.removeEventListener( 'touchmove', onTouchMove );
    // scope.domElement.ownerDocument.removeEventListener( 'pointermove', onPointerMove );
    // scope.domElement.ownerDocument.removeEventListener( 'pointerup', onPointerUp );
    // if ( scope._domElementKeyEvents !== null ) {
    // 	scope._domElementKeyEvents.removeEventListener( 'keydown', onKeyDown );
    // }
    //scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?
    };
    //
    // internals
    //
    var scope = this;
    var changeEvent = {
        type: "change"
    };
    var startEvent = {
        type: "start"
    };
    var endEvent = {
        type: "end"
    };
    var STATE = {
        NONE: -1,
        ROTATE: 0,
        DOLLY: 1,
        PAN: 2,
        TOUCH_ROTATE: 3,
        TOUCH_PAN: 4,
        TOUCH_DOLLY_PAN: 5,
        TOUCH_DOLLY_ROTATE: 6
    };
    var state = STATE.NONE;
    var EPS = 0.000001;
    // current position in spherical coordinates
    var spherical = new _three.Spherical();
    var sphericalDelta = new _three.Spherical();
    var scale = 1;
    var panOffset = new _three.Vector3();
    var zoomChanged = false;
    var rotateStart = new _three.Vector2();
    var rotateEnd = new _three.Vector2();
    var rotateDelta = new _three.Vector2();
    var panStart = new _three.Vector2();
    var panEnd = new _three.Vector2();
    var panDelta = new _three.Vector2();
    var dollyStart = new _three.Vector2();
    var dollyEnd = new _three.Vector2();
    var dollyDelta = new _three.Vector2();
    var panLeft = function() {
        var v = new _three.Vector3();
        return function panLeft(distance, objectMatrix) {
            v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
            v.multiplyScalar(-distance);
            panOffset.add(v);
        };
    }();
    var panUp = function() {
        var v = new _three.Vector3();
        return function panUp(distance, objectMatrix) {
            if (scope.screenSpacePanning === true) {
                v.setFromMatrixColumn(objectMatrix, 1);
            } else {
                v.setFromMatrixColumn(objectMatrix, 0);
                v.crossVectors(scope.object.up, v);
            }
            v.multiplyScalar(distance);
            panOffset.add(v);
        };
    }();
    // deltaX and deltaY are in pixels; right and down are positive
    var pan = function() {
        var offset = new _three.Vector3();
        return function pan(deltaX, deltaY) {
            var element = scope.domElement;
            if (scope.object.isPerspectiveCamera) {
                // perspective
                var position = scope.object.position;
                offset.copy(position).sub(scope.target);
                var targetDistance = offset.length();
                // half of the fov is center to top of screen
                targetDistance *= Math.tan(scope.object.fov / 2 * Math.PI / 180.0);
                // we use only clientHeight here so aspect ratio does not distort speed
                panLeft(2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix);
                panUp(2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix);
            } else if (scope.object.isOrthographicCamera) {
                // orthographic
                panLeft(deltaX * (scope.object.right - scope.object.left) / scope.object.zoom / element.clientWidth, scope.object.matrix);
                panUp(deltaY * (scope.object.top - scope.object.bottom) / scope.object.zoom / element.clientHeight, scope.object.matrix);
            } else {
                // camera neither orthographic nor perspective
                console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.");
                scope.enablePan = false;
            }
        };
    }();
    //
    scope.domElement.addEventListener("contextmenu", onContextMenu);
    scope.domElement.addEventListener("pointerdown", onPointerDown);
    scope.domElement.addEventListener("wheel", onMouseWheel);
    scope.domElement.addEventListener("touchstart", onTouchStart);
    scope.domElement.addEventListener("touchend", onTouchEnd);
    scope.domElement.addEventListener("touchmove", onTouchMove);
    // force an update at start
    this.update();
};
OrbitControls.prototype = Object.create(_three.EventDispatcher.prototype);
OrbitControls.prototype.constructor = OrbitControls;
var MapControls = function MapControls(object, domElement) {
    OrbitControls.call(this, object, domElement);
    this.screenSpacePanning = false; // pan orthogonal to world-space direction camera.up
    this.mouseButtons.LEFT = _three.MOUSE.PAN;
    this.mouseButtons.RIGHT = _three.MOUSE.ROTATE;
    this.touches.ONE = _three.TOUCH.PAN;
    this.touches.TWO = _three.TOUCH.DOLLY_ROTATE;
};
MapControls.prototype = Object.create(_three.EventDispatcher.prototype);
MapControls.prototype.constructor = MapControls;
