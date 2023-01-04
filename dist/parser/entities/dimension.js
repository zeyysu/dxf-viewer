"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return EntityParser;
    }
});
var _parseHelpers = /*#__PURE__*/ _interopRequireWildcard(require("../ParseHelpers"));
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interopRequireWildcard(obj, nodeInterop) {
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
function EntityParser() {}
EntityParser.ForEntityName = "DIMENSION";
EntityParser.prototype.parseEntity = function(scanner, curr) {
    var entity;
    entity = {
        type: curr.value
    };
    curr = scanner.next();
    while(curr !== "EOF"){
        if (curr.code === 0) break;
        switch(curr.code){
            case 2:
                entity.block = curr.value;
                break;
            case 10:
                entity.anchorPoint = _parseHelpers.parsePoint(scanner);
                break;
            case 11:
                entity.middleOfText = _parseHelpers.parsePoint(scanner);
                break;
            case 12:
                entity.insertionPoint = _parseHelpers.parsePoint(scanner);
                break;
            case 13:
                entity.linearOrAngularPoint1 = _parseHelpers.parsePoint(scanner);
                break;
            case 14:
                entity.linearOrAngularPoint2 = _parseHelpers.parsePoint(scanner);
                break;
            case 15:
                entity.diameterOrRadiusPoint = _parseHelpers.parsePoint(scanner);
                break;
            case 16:
                entity.arcPoint = _parseHelpers.parsePoint(scanner);
                break;
            case 70:
                entity.dimensionType = curr.value;
                break;
            case 71:
                entity.attachmentPoint = curr.value;
                break;
            case 42:
                entity.actualMeasurement = curr.value;
                break;
            case 1:
                entity.text = curr.value;
                break;
            case 50:
                entity.angle = curr.value;
                break;
            default:
                _parseHelpers.checkCommonEntityProperties(entity, curr);
                break;
        }
        curr = scanner.next();
    }
    return entity;
};