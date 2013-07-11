(function(win, undefined) {
    var _doc = win.document;
    var Class = function() {
        if (this.init) {
            this.init.apply(this, arguments);
        }
    };
    var class2type = {};
    var nativDataType = "Boolean Number String Function Array Date RegExp Object".split(" ");
    for (var p in nativDataType) {
        class2type["[object " + nativDataType[p] + "]"] = nativDataType[p].toLowerCase();
    }
    var hasOwn = Object.prototype.hasOwnProperty;
    Class.extend = Class.prototype.extend = function() {
        var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = false;
        if (typeof target === "boolean") {
            deep = target;
            target = arguments[1] || {};
            i = 2;
        }
        if (typeof target !== "object" && !Class.isFunction(target)) {
            target = {};
        }
        if (length === i) {
            target = this; --i;
        }
        for (; i < length; i++) {
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    src = target[name];
                    copy = options[name];
                    if (target === copy) {
                        continue;
                    }
                    if (deep && copy && (Class.isPlainObject(copy) || (copyIsArray = Class.isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && Class.isArray(src) ? src: [];
                        }
                        else {
                            clone = src && Class.isPlainObject(src) ? src: {};
                        }
                        target[name] = Class.extend(deep, clone, copy);
                    }
                    else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }
        return target;
    };
    Class.extend({
        isFunction: (function(obj) {
            var _f;
            return "object" === typeof document.getElementById ? _f = function(fn) {
                try {
                    return /^\s*\bfunction\b/.test("" + fn);
                } catch(x) {
                    return false
                }
            }: _f = function(fn) {
                return "[object Function]" === Object.prototype.toString.call(fn);
            };
        })(),
        isArray: Array.isArray ||
        function(obj) {
            return Class.type(obj) === "array";
        },
        isPlainObject: function(obj) {
            if (!obj || Class.type(obj) !== "object" || obj.nodeType || Class.isWindow(obj)) {
                return false;
            }
            if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                return false;
            }
            var key;
            for (key in obj) {}
            return key === undefined || hasOwn.call(obj, key);
        },
        type: function(obj) {
            return obj == null ? String(obj) : class2type[toString.call(obj)] || "object";
        },
        isWindow: function(obj) {
            return obj && typeof obj === "object" && "setInterval" in obj;
        }
    });
    Class.extend({
        cssSupport: (function() {
            var _support = {};
            _support['transform3d'] = ('WebKitCSSMatrix' in win);
            return _support;
        })(),
        eventSupport: (function() {
            var _support = {};
            var _t = ('ontouchstart' in win);
            _support = {
                touch: !!_t,
                start: _t ? 'touchstart': 'mousedown',
                move: _t ? 'touchmove': 'mousemove',
                end: _t ? 'touchend': 'mouseup'
            };
            return _support;
        })(),
        storageSupport: (function() {
            var _support = {},
            _l, _s, _w;
            _t = !(typeof win.localStorage === 'undefined');
            _s = !(typeof win.sessionStorage === 'undefined');
            _w = !!win.openDatabase;
            _support = {
                localStorage: _t,
                sessionStorage: _s,
                webSql: _w
            }
            return _support;
        })(),
        audioSupport: (function() {
            var _support = {};
            var _audio = new Audio();
            _support.audio = !!(window['Audio'] && (new Audio()).canPlayType);
            if (true == _support.audio) {
                var audioTypes = ["audio/mpeg", "audio/ogg", "audio/mp4"];
                var i = 0;
                do {
                    var _t = audioTypes[i]
                    _support[_t.substr(6)] = !!_audio.canPlayType(_t);
                } while (++ i < audioTypes . length );
            }
            return _support;
        })()
    });
    Class.Storage = {};
    Class.extend(Class.Storage, {
        get: function(key) {
            try {
                if (Class.storageSupport.localStorage) {
                    return win.localStorage[key];
                }
                else {
                    throw 'Your Browser does not support localStorage';
                }
            } catch(e) {
                alert(e.message);
            }
        },
        set: function(key, value) {
            try {
                if (Class.storageSupport.localStorage) {
                    win.localStorage[key] = value;
                }
                else {
                    throw 'Your Browser does not support localStorage';
                }
            } catch(e) {
                alert(e.message);
            }
        }
    });
    Class.Tool = function() {};
    Class.extend(Class.Tool.prototype, {
        canvasToImg: function(canvas) {
            try {
                var img = new Image;
                var _src = canvas.toDataURL();
                img.src = _src;
                return img;
            }
            catch(e) {
                alert(e.message);
            }
        },
        mwiseCanvasToImage: function(canvas) {
            try {
                var img = new Image;
                canvas.toBlob(function(blob) {
                    var url = URL.createObjectURL(blob);
                    img.onload = function() {
                        this.onload = null;
                        URL.revokeObjectURL(url);
                    }
                    img.src = url;
                });
                return img;
            }
            catch(e) {
                alert(e.message);
            }
        },
        getDistance: function(pos_first, pos_second) {
            function to_radians(degree) {
                return degree * Math.PI / 180.0;
            }
            var lat1 = pos_first.lat;
            var lon1 = pos_first.lng;
            var lat2 = pos_second.lat;
            var lon2 = pos_second.lng;
            var earth_r = 6378137.0;
            var rad_lat1 = to_radians(lat1);
            var rad_lat2 = to_radians(lat2);
            var a = rad_lat1 - rad_lat2;
            var b = to_radians(lon1) - to_radians(lon2);
            var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(rad_lat1) * Math.cos(rad_lat2) * Math.pow(Math.sin(b / 2), 2)));
            s = s * earth_r;
            return s;
        },
        strToMap: function(str, spliter1, spliter2) {
            var type = str.split(spliter1);
            var typeMap = {};
            for (var p in type) {
                var _i = type[p].split(spliter2);
                if (2 == _i.length) {
                    typeMap[_i[0]] = _i[1];
                }
            }
            return typeMap;
        },
        getAlpha: function(posStart, posEnd) {
            var d = 0;
            var lat_a = posStart.lat * Math.PI / 180;
            var lng_a = posStart.lng * Math.PI / 180;
            var lat_b = posEnd.lat * Math.PI / 180;
            var lng_b = posEnd.lng * Math.PI / 180;
            d = Math.sin(lat_a) * Math.sin(lat_b) + Math.cos(lat_a) * Math.cos(lat_b) * Math.cos(lng_b - lng_a);
            d = Math.sqrt(1 - d * d);
            d = Math.cos(lat_b) * Math.sin(lng_b - lng_a) / d;
            d = Math.asin(d) * 180 / Math.PI;
            return d;
        }
    });
    Class.extend({
        QueueMap: function() {
            var length = 0;
            var _queueMap = [];
            var _keyIndexMap = {};
            var _shiftTimes = 0;
            var _lastKey = null;
            this.push = function(key, value) {
                if (key in _keyIndexMap) {
                    return false;
                }
                var tmp = {
                    'key': key,
                    'value': value
                };
                _lastKey = length == 0 ? key: _lastKey;
                _keyIndexMap[key] = length == 0 ? 0 : _keyIndexMap[key];
                _queueMap.push(tmp);
                length++;
                _keyIndexMap[key] = _keyIndexMap[_lastKey] + 1;
                _lastKey = key;
                return true;
            };
            this.shift = function() {
                if (_queueMap.length <= 0) {
                    return null;
                }
                var first = _queueMap.shift();
                length--;
                _shiftTimes++;
                delete _keyIndexMap[first.key];
                return first;
            };
            this.get = function(indexOrKey) {
                if (!isNaN(Number(indexOrKey)) && _queueMap[indexOrKey] != undefined) {
                    return _queueMap[indexOrKey];
                }
                else {
                    var index = _keyIndexMap[indexOrKey] - 1;
                    return _queueMap[index - _shiftTimes];
                }
            };
            this.resolve = function(context, args, keep) {
                context = context || win;
                args = args || null;
                keep = keep || false;
                try {
                    if (true === keep && _queueMap.length > 0) {
                        _queueMap[0].value.apply(context, args);
                    }
                    else {
                        while (_queueMap[0]) {
                            var _item = _queueMap.shift();
                            if (Class.isFunction(_item.value)) {
                                _item.value.apply(context, args);
                            }
                        }
                    }
                } finally {
                    return this;
                }
            };
            this.length = function() {
                return length;
            };
        }
    });
    Class.extend({
        MapContext: new Class.QueueMap(),
        OpenContext: new Class.QueueMap(),
        HereContext: new Class.QueueMap()
    });
    function createStandardXHR() {
        try {
            return new window.XMLHttpRequest();
        }
        catch(e) {}
    }
    function createActiveXHR() {
        try {
            return new window.ActiveXObject("Microsoft.XMLHTTP");
        }
        catch(e) {}
    }
    Class.extend({
        loadJs: function(url, callback) {
            var node = document.createElement('script'),
            script = document.getElementsByTagName('script')[0];
            node.src = url;
            node.type = 'text/javascript';
            node.onload = node.onerror = node.onreadystatechange = function() {
                if (/loaded|complete|undefined/.test(node.readyState)) {
                    node.onload = node.onerror = node.onreadystatechange = null;
                    node.parentNode.removeChild(node);
                    node = undefined;
                    if (Class.isFunction(callback)) {
                        callback();
                    }
                };
            };
            script.parentNode.insertBefore(node, script);
        },
        getJSON: function(url, callback) {
            var jsre = /(\=)\?(&|$)|\?\?/i;
            var jsonpCallback = 'ClassCallback' + (new Date()).getTime();
            var replacement = "$1" + jsonpCallback + "$2";;
            var _url = url.replace(jsre, replacement);
            if (_url === url) {
                _url += (/\?/.test(url) ? "&": "?") + "callback=" + jsonpCallback;
            }
            url = _url;
            window[jsonpCallback] = function(response) {
                callback(response);
            }
            Class.loadJs(url);
        },
        xhrRequest: function(url, callback, o) {
            Class.xhr = win.ActiveXObject ? createActiveXHR: createStandardXHR;
            var _xhr = Class.xhr();
            var o = o || {
                method: 'POST',
                sync: true,
                data: {}
            };
            _xhr.open(o.method, url, o.sync);
            var _callback = function(resText) {
                if (4 == _xhr.readyState) {
                    if (200 == _xhr.status) {
                        callback(_xhr.responseText);
                    }
                }
            }
            _xhr.onreadystatechange = _callback;
            _xhr.send(o.data || null);
        }
    });
    Class.extend({
        Statistics: function() {
            var self = this;
            var statisticsUrl = "http://pingjs.qq.com/tcss.ping.js";
            this.tcssLoaded = false;
            this.loadTCSS = Class.loadJs;
            this.pvReport = function() {
                var self = this;
                (function() {
                    self.tcssLoaded === true ? pgvMain("", {
                        "virtualRefDomain": "WEIXIN.H5.OCT",
                        "virtualRefURL": "/j/oct/fliplib.html",
                        "useCookie": "false"
                    }) : setTimeout(arguments.callee, 2);
                })();
            }
            self.loadTCSS(statisticsUrl,
            function() {
                self.tcssLoaded = true;
            });
        }
    });
    Class.extend({
        TouchSlide: function(selector, conf, callback) {
            callback = callback || null;
            var that = this;
            this.init = function(startPos) {
                var that = this;
                startPos = startPos || 0;
                this.currentPos = 0;
                that.element = null;
                if (selector.nodeType && selector.nodeType == 1) {
                    that.element = selector;
                } else if (typeof selector == 'string') {
                    that.element = document.getElementById(selector) || document.querySelector(selector);
                }
                that.element.style.display = '-webkit-box';
                that.element.style.webkitTransitionProperty = '-webkit-transform';
                that.element.style.webkitTransitionTimingFunction = 'cubic-bezier(0,0,0.25,1)';
                that.element.style.webkitTransitionDuration = '0';
                that.element.style.webkitTransform = Class.getTranslate(0);
                that.conf = conf || {};
                that.touchEnabled = true;
                that.currentPoint = startPos;
                that.currentX = 0;
                that.startPageX = 0;
                that.element.addEventListener(Class.eventSupport.start, that, false);
                that.element.addEventListener(Class.eventSupport.move, that, false);
                that.element.addEventListener(Class.eventSupport.end, that, false);
                refresh();
            };
            that.handleEvent = function(event) {
                switch (event.type) {
                case Class.eventSupport.start:
                    _touchStart(event);
                    break;
                case Class.eventSupport.move:
                    _touchMove(event);
                    break;
                case Class.eventSupport.end:
                    _touchEnd(event);
                    break;
                case 'click':
                    _click(event);
                    break;
                }
            };
            var _click = function(event) {
                event.stopPropagation();
                event.preventDefault();
            };
            var refresh = function() {
                var conf = that.conf;
                that.maxPoint = conf.point || (function() {
                    var childNodes = that.element.childNodes,
                    itemLength = 0,
                    i = 0,
                    len = childNodes.length,
                    node;
                    for (; i < len; i++) {
                        node = childNodes[i];
                        if (node.nodeType === 1) {
                            itemLength++;
                        }
                    }
                    if (itemLength > 0) {
                        itemLength--;
                    }
                    return itemLength;
                })();
                that.distance = conf.distance || that.element.scrollWidth / (that.maxPoint + 1);
                that.maxX = conf.maxX ? -conf.maxX: -that.distance * that.maxPoint;
                _moveToPoint(that.currentPoint);
            };
            var _touchStart = function(event) {
                if (!that.touchEnabled) {
                    return;
                }
                if (!Class.eventSupport.touch) {
                    event.preventDefault();
                }
                that.element.style.webkitTransitionDuration = '0';
                that.scrolling = true;
                that.moveReady = false;
                that.startPageX = Class.getPage(event, 'pageX');
                that.startPageY = Class.getPage(event, 'pageY');
                that.basePageX = that.startPageX;
                that.directionX = 0;
                that.startTime = event.timeStamp;
            };
            var _touchMove = function(event) {
                if (!that.scrolling) {
                    return;
                }
                var pageX = Class.getPage(event, 'pageX'),
                pageY = Class.getPage(event, 'pageY'),
                distX,
                newX,
                deltaX,
                deltaY;
                deltaX = Math.abs(pageX - that.startPageX);
                deltaY = Math.abs(pageY - that.startPageY);
                if (that.moveReady) {
                    event.preventDefault();
                    event.stopPropagation();
                    distX = pageX - that.basePageX;
                    newX = that.currentX + distX;
                    if (newX >= 0 && newX < that.maxX) {
                        newX = Math.round(that.currentX + distX / 3);
                    }
                    _setX(newX);
                    that.directionX = distX > 0 ? -1 : 1;
                }
                else {
                    if (deltaX > 5) {
                        event.preventDefault();
                        event.stopPropagation();
                        that.moveReady = true;
                        that.element.addEventListener('click', that, true);
                    }
                    else if (deltaY > 5) {
                        that.scrolling = false;
                    }
                }
                that.basePageX = pageX;
            };
            var _touchEnd = function(event) {
                if (!that.scrolling) {
                    return;
                }
                that.scrolling = false;
                var newPoint = -that.currentX / that.distance;
                newPoint = (that.directionX > 0) ? Math.ceil(newPoint) : (that.directionX < 0) ? Math.floor(newPoint) : Math.round(newPoint);
                _moveToPoint(newPoint);
                if (Class.isFunction(callback)) {
                    callback(newPoint);
                }
                setTimeout(function() {
                    that.element.removeEventListener('click', that, true);
                },
                200);
            };
            var _setX = function(x) {
                that.currentX = x;
                that.element.style.webkitTransform = Class.getTranslate(x);
            };
            var _moveToPoint = function(point) {
                that.currentPoint = (point < 0) ? 0 : (point > that.maxPoint) ? that.maxPoint: parseInt(point);
                that.element.style.webkitTransitionDuration = '500ms';
                _setX( - that.currentPoint * that.distance)
            };
        },
        getTranslate: function(x, y) {
            y = y || 0;
            return Class.cssSupport.transform3d ? 'translate3d(' + x + 'px,' + y + 'px, 0)': 'translate(' + x + 'px,' + y + 'px)';
        },
        getPage: function(event, page) {
            return Class.eventSupport.touch ? event.changedTouches[0][page] : event[page];
        },
        ClickSpliter: function(topel) {
            var that = this;
            var position = 0;
            this.topelel = document.getElementById(topel);
            this.topelel_map = document.getElementById('map');
            this.jd_nav = $('#jd_nav');
            this.toMiddle = function() {
                var height = 0.65 * win.innerHeight;
                this.toPosition(height);
            };
            this.toTop = function() {
                this.toPosition(25);
                position = 1;
            };
            this.toBottom = function() {
                var height = win.innerHeight - this.jd_nav.height();
                this.toPosition(height);
                position = -1;
            };
            this.toPosition = function(height) {
                that.topelel.style.webkitTransitionDuration = '0s';
                that.topelel.style.webkitTransitionProperty = 'height';
                that.topelel_map.style.webkitTransitionDuration = '0s';
                that.topelel_map.style.webkitTransitionProperty = 'height';
                that.topelel.style.webkitTransitionTimingFunction = 'linear';
                that.topelel_map.style.webkitTransitionTimingFunction = 'linear';
                this.topelel.style.height = height + 'px';
                this.topelel_map.style.height = height + 'px';
                position = 0;
                map.rerender('map');
            };
            this.getPos = function() {
                return position;
            };
            this.setPos = function(pos) {
                position = pos;
            };
            this.run = function() {
                var currpos = this.getPos();
                if (1 == currpos || 0 == currpos) {
                    this.toBottom();
                }
                if ( - 1 == currpos) {
                    this.toTop();
                }
            };
        },
        Spliter: function(topel, spliter, bottomel) {
            var that = this;
            that.currentY = 0;
            that.scrolling = false;
            that.directionY = 0;
            that.touchMoved = false;
            that.topelement = document.getElementById(topel);
            that.element = document.getElementById(spliter);
            that.bottomelement = document.getElementById(bottomel);
            that.element.addEventListener(Class.eventSupport.start, that, false);
            that.element.addEventListener(Class.eventSupport.move, that, false);
            that.element.addEventListener(Class.eventSupport.end, that, false);
            that.handleEvent = function(event) {
                switch (event.type) {
                case Class.eventSupport.start:
                    _touchStart(event);
                    break;
                case Class.eventSupport.move:
                    _touchMove(event);
                    break;
                case Class.eventSupport.end:
                    _touchEnd(event);
                    break;
                case 'click':
                    _click(event);
                    break;
                }
            };
            var _setSpliterHeight = function(deltaY) {
                var lastHeight = that.topelHeight + deltaY;
                $('#' + topel).height(lastHeight);
                $('#' + topel + ' .scenic_map').height(lastHeight);
                return lastHeight;
            };
            var _touchStart = function(event) {
                event.preventDefault();
                event.stopPropagation();
                that.touchMoved = false;
                that.scrolling = true;
                that.directionY = 0;
                that.startPageY = Class.getPage(event, 'pageY');
                that.basePageY = that.startPageY;
                that.topelHeight = $('#' + topel).height();
                that.bottomelHeight = $('#' + bottomel).height();
                that.element.style.height = 3 * 47;
                var topelel = document.getElementById(topel);
                var topelel_map = document.getElementById('map');
                topelel.style.webkitTransitionDuration = '0s';
                topelel.style.webkitTransitionProperty = 'height';
                topelel_map.style.webkitTransitionDuration = '0s';
                topelel_map.style.webkitTransitionProperty = 'height';
                topelel.style.webkitTransitionTimingFunction = 'linear';
                topelel_map.style.webkitTransitionTimingFunction = 'linear';
                that.clickedElement = event.target || document.elementFromPoint(event.targetTouches[0].clientX, event.targetTouches[0].clientY);
            };
            var _touchMove = function(event) {
                event.preventDefault();
                event.stopPropagation();
                if (!that.scrolling) {
                    return;
                }
                var pageY = Class.getPage(event, 'pageY');
                var deltaY = pageY - that.startPageY;
                that.deltaY = deltaY;
                var mapHeight = that.topelHeight + deltaY;
                that.directionY = deltaY > 0 ? 1 : -1;
                if (mapHeight > win.innerHeight - $('.jd_nav').height() || mapHeight < 14) {
                    return;
                }
                var lastHeight = _setSpliterHeight(deltaY);
                that.touchMoved = true;
            };
            var _touchEnd = function(event) {
                event.preventDefault();
                event.stopPropagation();
                that.scrolling = false;
                if (that.touchMoved == false) {
                    Class.Event.navBarClick(that.clickedElement);
                    return;
                }
                that.touchMoved = false;
                if (that.directionY > 0) {
                    Class.ClickSpliterObj.toBottom();
                }
                else if (that.directionY < 0) {
                    Class.ClickSpliterObj.toTop();
                }
                $('.nav_line').hide();
                $('.nav_menu').hide();
            };
        },
        ListSlide: function(selector) {
            var that = this;
            that.element = document.getElementById(selector);
            that.element.addEventListener(Class.eventSupport.start, that, false);
            that.element.addEventListener(Class.eventSupport.move, that, false);
            that.element.addEventListener(Class.eventSupport.end, that, false);
            that.handleEvent = function(event) {
                switch (event.type) {
                case Class.eventSupport.start:
                    _touchStart(event);
                    break;
                case Class.eventSupport.move:
                    _touchMove(event);
                    break;
                case Class.eventSupport.end:
                    _touchEnd(event);
                    break;
                }
            };
            var _touchStart = function(event) {
                event.preventDefault();
                event.stopPropagation();
                that.scrolling = true;
                that.moved = false;
                that.element.style.webkitTransitionDuration = '0';
                that.startPageY = Class.getPage(event, 'pageY');
                that.basePageY = that.startPageY;
                that.maxY = that.element.scrollHeight;
                that.clickedElement = event.target || document.elementFromPoint(event.targetTouches[0].clientX, event.targetTouches[0].clientY);
            };
            var _touchMove = function(event) {
                event.preventDefault();
                event.stopPropagation();
                if (!that.scrolling) {
                    return;
                }
                var pageY = Class.getPage(event, 'pageY');
                var distY = pageY - that.basePageY;
                var newY = that.currentY + distY;
                if (newY >= 0 && newY < that.maxY) {
                    newY = Math.round(that.currentY + distY / 2);
                }
                if (false == that.moved && Math.abs(distY) > 0) {
                    that.moved = true;
                }
                that.directionY = pageY - that.startPageY > 0 ? 1 : -1;
                that.element.style.webkitTransform = Class.getTranslate(0, newY);
                that.currentY = newY;
                that.basePageY = pageY;
            };
            var _touchEnd = function(event) {
                event.preventDefault();
                event.stopPropagation();
                if (!that.scrolling) {
                    return;
                }
                if (false === that.moved) {
                    var ccname = that.clickedElement.className;
                    var pdiv = $(that.clickedElement).parents('div[imglist]');
                    if (pdiv.length > 0 && !pdiv.hasClass('disabled')) {
                        Class.Event.initGalary(pdiv.attr('imglist'));
                        return;
                    }
                    pdiv = $(that.clickedElement).parents('div[audiourl]');
                    if (pdiv.length > 0 && !pdiv.hasClass('disabled')) {
                        if (! (pdiv.hasClass('disabled'))) {
                            win.player = win.player ? win.player: new Class.AudioPlayer();
                            var tar = pdiv.children('a');
                            if (typeof win.player.preAudioUrl != 'undefined' && win.player.preAudioUrl != pdiv.attr('audiourl')) {
                                win.player.reset();
                            }
                            if (typeof win.player.playing != 'undefined' && true == win.player.playing) {
                                player.pause();
                                win.player.playing = false;
                            } else {
                                if (win.player.loaded === true) {
                                    win.player.play();
                                } else {
                                    win.player.load(tar);
                                }
                                win.player.preAudioUrl = pdiv.attr('audiourl');
                                win.player.playing = true;
                            }
                        }
                        return;
                    }
                    pdiv = $(that.clickedElement).parents('div[spotindex]');
                    if (pdiv.length > 0 && !pdiv.hasClass('disabled')) {
                        $('.nav_pic').hide();
                        $('.nav_list').show();
                        $('#jd_map').show();
                        $('#jd_con').hide();
                        $('#jd_nav').css('bottom', '0px');
                        var dataPrefix = pdiv.attr('spotindex').split('_');
                        var spot = win[dataPrefix[0]][dataPrefix[1]];
                        map.selectSpot(spot.id);
                        map.goHere(spot);
                        return;
                    }
                    var pa = $(that.clickedElement);
                    if (pa.length > 0 && pa.hasClass('ico_show')) {
                        pa.removeClass('ico_show').addClass('ico_hide');
                        pa.parent().siblings('.detail_nav').toggle();
                    }
                    else if (pa.length > 0 && pa.hasClass('ico_hide')) {
                        pa.removeClass('ico_hide').addClass('ico_show');
                        pa.parent().siblings('.detail_nav').toggle();
                    }
                    return;
                }
                that.scrolling = false;
                var disY = that.directionY * 10;
                var newY = that.currentY;
                var targetY = that.maxY - (win.innerHeight - $('#jd_map').height() - $('#jd_nav').height()) + 60;
                if (that.directionY < 0) {
                    targetY = targetY < 0 ? 0 : -targetY;
                    newY = Math.max(newY, targetY);
                } else {
                    newY = Math.min(newY, 0);
                }
                that.element.style.webkitTransitionDuration = '200ms';
                that.element.style.webkitTransitionTimingFunction = 'linear';
                that.element.style.webkitTransform = Class.getTranslate(0, newY);
                that.currentY = newY;
            };
            that.goToListItem = function(listId) {
                var height = 0.65 * win.innerHeight;
                $('.jd_map').css('height', height);
                $('.jd_map .scenic_map').css('height', height);
                var str = 'li_' + listId;
                var li = document.getElementById(str);
                if (null == li) {
                    return;
                }
                var last = parseInt(li.offsetTop + 1);
                that.currentY = -last;
                that.element.style.webkitTransitionDuration = '0ms';
                that.element.style.webkitTransform = Class.getTranslate(0, -last);
                Class.ClickSpliterObj.setPos(0);
            };
            that.reset = function() {
                that.currentY = 0;
                that.directionY = 0;
                that.maxY = that.element.scrollHeight;
                that.bottom = false;
                that.moved = false;
                that.clickedElement = null;
                that.element.style.webkitTransitionProperty = '-webkit-transform';
                that.element.style.webkitTransitionTimingFunction = 'cubic-bezier(0,0,0.25,1)';
                that.element.style.webkitTransitionDuration = '0';
                that.element.style.webkitTransform = Class.getTranslate(0);
                that.element.style.height = win.innerHeight + 'px';
            };
            that.reset();
        },
        MutiTouchSlide: function(selector, conf) {
            var that = this;
            this.init = function() {
                var that = this;
                that.element = null;
                if (selector.nodeType && selector.nodeType == 1) {
                    that.element = selector;
                } else if (typeof selector == 'string') {
                    that.element = document.getElementById(selector) || document.querySelector(selector);
                }
                that.element.style.display = '-webkit-box';
                that.element.style.webkitTransitionProperty = '-webkit-transform';
                that.element.style.webkitTransitionTimingFunction = 'cubic-bezier(0,0,0.25,1)';
                that.element.style.webkitTransitionDuration = '0';
                that.element.style.webkitTransform = Class.getTranslate(0);
                that.conf = conf || {};
                that.touchEnabled = false;
                that.startDistance = 0;
                that.currentDistance = 0;
                that.deltaDistance = 0;
                that.startMulti = true;
                that.isMulti = false;
                that.element.removeEventListener(Class.eventSupport.start, that, false);
                that.element.removeEventListener(Class.eventSupport.move, that, false);
                that.element.removeEventListener(Class.eventSupport.end, that, false);
                that.element.addEventListener(Class.eventSupport.start, that, false);
                that.element.addEventListener(Class.eventSupport.move, that, false);
                that.element.addEventListener(Class.eventSupport.end, that, false);
            };
            that.init();
            that.handleEvent = function(event) {
                switch (event.type) {
                case Class.eventSupport.start:
                    _touchStart(event);
                    break;
                case Class.eventSupport.move:
                    _touchMove(event);
                    break;
                case Class.eventSupport.end:
                    _touchEnd(event);
                    break;
                }
            };
            var _getTwoPointsDistance = function(point0, point1) {
                return Math.sqrt(Math.pow(point0.x - point1.x, 2) + Math.pow(point0.y - point1.y, 2));
            };
            var _touchStart = function(event) {
                that.touchEnabled = true;
                that.scrolling = true;
                if (!Class.eventSupport.touch) {
                    event.preventDefault();
                }
                if (event.touches && 1 == event.touches.length) {
                    var tar = document.elementFromPoint(event.targetTouches[0].clientX, event.targetTouches[0].clientY);
                    if ('svg' == tar.nodeName.toLowerCase()) {
                        mapFilter.hide();
                        map.clearPopUp();
                        if (win.player) {
                            win.player.reset();
                        }
                    }
                    event.preventDefault();
                    event.stopPropagation();
                }
                if (event.touches == undefined || event.touches.length != 2) {
                    that.touchEnabled = false;
                    return;
                }
            };
            var _touchMove = function(event) {
                if (!that.scrolling || event.changedTouches == undefined || event.changedTouches.length < 2) {
                    return;
                }
                that.isMulti = true;
                var touch0 = event.changedTouches[0];
                var touch1 = event.changedTouches[1];
                var point0 = {
                    x: touch0['pageX'],
                    y: touch0['pageY']
                };
                var point1 = {
                    x: touch1['pageX'],
                    y: touch1['pageY']
                };
                that.currentDistance = _getTwoPointsDistance(point0, point1);
                if (true == that.startMulti) {
                    that.startDistance = that.currentDistance;
                    that.startMulti = false;
                }
                that.deltaDistance = that.currentDistance - that.startDistance;
            };
            var _touchEnd = function(event) {
                if (!that.scrolling || that.isMulti == false) {
                    return;
                }
                if (that.deltaDistance > 5 && false == that.startMulti) {
                    map.zoomIn();
                }
                if (that.deltaDistance < -5 && false == that.startMulti) {
                    map.zoomOut();
                }
                that.deltaDistance = 0;
                that.scrolling = false;
                that.startMulti = true;
            };
        },
        MapFilter: function(selector, conf) {
            var that = this;
            this.element = $(selector);
            var _pos = 0;
            var jd_nav = $('#jd_nav');
            var nav_up = $('.nav_up');
            var nav_down = $('.nav_down');
            var all_map = $('.all_map');
            this.mode = 'map';
            var _setBarBackground = function() {
                switch (that.mode) {
                case 'map':
                    jd_nav.css('background', 'none');
                    break;
                case 'list':
                    jd_nav.css('background', 'rgba(76,64,55,.4)');
                    break;
                }
            };
            this.hide = function() {;
                jd_nav.css('bottom', '0px');
                this.element.hide();
                nav_up.show();
                nav_down.hide();
                all_map.height(win.innerHeight);
                _pos = 0;
                _setBarBackground();
            };
            this.show = function() {
                that.element.show();
                that.element.css('bottom', '0px');
                jd_nav.css('bottom', that.element.height() + 'px');
                all_map.height(win.innerHeight);
                nav_down.show();
                nav_up.hide();
                _pos = 1;
                _setBarBackground();
            };
            this.isShow = function() {
                return _pos == 1 ? true: false;
            };
            this.hideAll = function() {
                jd_nav.hide();
                $('.map_menu_con').hide();
            };
            this.showAll = function() {
                jd_nav.show();
                $('.map_menu_con').show();
            };
        }
    });
    win.listSlider = null;
    win.mapFilter = new Class.MapFilter('.map_menu_con');
    Class.View = {};
    Class.extend(Class.View, {
        adaptDelegate: function(orientation, pdelegate) {
            var that = this;
            var width = win.innerWidth;
            var height = win.innerHeight;
            orientation = orientation || '';
            pdelegate = pdelegate || null;
            if (orientation && $.os.android) { (function() {
                    if (width != win.innerWidth) {
                        width = win.innerWidth;
                        height = win.innerHeight;
                        if (Class.isFunction(pdelegate)) {
                            pdelegate.call(that, width, height);
                        }
                    }
                    else {
                        setTimeout(arguments.callee, 20);
                    }
                })();
            }
            else {
                pdelegate.call(that, width, height);
            }
        },
        adaptDevSet: function(width, height) {
            $('.wrapper').width(width);
            $('.all_map').width(width);
            $('.jd_map').width(width);
            $('#map').width(width);
            $('.jd_map').height(height);
            $('#map').height(height);
        },
        getDistance: function(lng, lat) {
            if ('0' == lng || '0' == lat) {
                return - 1;
            }
            if (Class.Geo.pos) {
                var tool = new Class.Tool();
                var target = {
                    lat: lat,
                    lng: lng
                }
                return tool.getDistance(Class.Geo.pos, target);
            } else {
                return null;
            }
        },
        showTypeList: function(typeid) {
            map.clearLine();
            var typeClassMap = {
                '4': 'icon_list_jd',
                '5': 'icon_list_cy',
                '6': 'icon_list_wc',
                '7': 'icon_list_by',
                '8': 'icon_list_jiudian',
                '9': 'icon_list_gw',
                '10': 'icon_list_net',
                '11': 'icon_list_jt',
                '12': 'icon_list_sp'
            };
            var typedSpots = map.sceneCurrSpots;
            _typedSpots = [];
            var s = null
            for (var i = 0, len = typedSpots.length; i < len; i++) {
                s = typedSpots[i];
                if (typeof s.index !== 'undefined' && s.index == 'here') {
                    continue;
                }
                var d = this.getDistance(s.locationData.lng, s.locationData.lat);
                d = Math.round(d);
                s.recClass = s.recommend == '1' ? 'ico_rec': '';
                s.recShow = s.recommend == '1' ? '': 'none';
                s.iconType = typeClassMap[typeid];
                s.picClass = s.imglist && s.imglist.length > 10 ? 'icon_pic': '';
                s.show = s.imglist && s.imglist.length > 10 ? '': 'none';
                s.distancenum = d <= 0 ? 0 : d;
                s.distance = d <= 0 ? '距离未知': '距离' + d + '米';
                s.ddisplay = d > 0 ? '': 'none';
                s.ico_voice_disabled = s.audiourl && s.audiourl.length > 5 ? '': 'disabled';
                s.ico_photo_disabled = s.imglist && s.imglist.length > 5 ? '': 'disabled';
                s.ico_here_disabled = '';
                _typedSpots.push(s);
            }
            _typedSpots.sort(function(spot1, spot2) {
                var d1 = parseInt(spot1.distance);
                var d2 = parseInt(spot2.distance);
                if (isNaN(d1) || isNaN(d2)) {
                    return 0;
                }
                if (d1 < d2) {
                    return - 1;
                } else if (d1 == d2) {
                    return 0;
                } else {
                    return 1;
                }
            });
            win.typedSpots = _typedSpots;
            var res = Class.template('typedSpotsTpl', win.typedSpots);
            $('#jd_list_ul').addClass('jq_list');
            $('#jd_list_ul ul').html(res);
            Class.OpenContext.shift();
            Class.OpenContext.push('typespots', typeid);
        },
        showOneLineList: function(oneLineJson) {
            var spots_in_line = [];
            var spots_id_in_line = oneLineJson.spots || '';
            spots_id_in_line = spots_id_in_line.split(',');
            for (var i = 0, ilen = spots_id_in_line.length; i < ilen; i++) {
                for (var j = 0, jlen = map.scenicJSON.spots.length; j < jlen; j++) {
                    var spot_json = map.scenicJSON.spots[j];
                    if (spot_json.id == spots_id_in_line[i]) {
                        var d = this.getDistance(spot_json.locationData.lng, spot_json.locationData.lat);
                        d = Math.round(d);
                        spot_json.distancenum = d <= 0 ? 0 : d;
                        spot_json.distance = d <= 0 ? '距离未知': '距离' + d + '米';
                        spot_json.ddisplay = d > 0 ? '': 'none';
                        spot_json.recClass = spot_json.recommend == '1' ? 'ico_rec': '';
                        spot_json.recShow = spot_json.recommend == '1' ? '': 'none';
                        spot_json.picClass = spot_json.imglist && spot_json.imglist.length > 10 ? 'icon_pic': '';
                        spot_json.show = spot_json.imglist && spot_json.imglist.length > 10 ? '': 'none';
                        spot_json.ico_voice_disabled = spot_json.audiourl && spot_json.audiourl.length > 5 ? '': 'disabled';
                        spot_json.ico_photo_disabled = spot_json.imglist && spot_json.imglist.length > 5 ? '': 'disabled';
                        spot_json.ico_here_disabled = '';
                        spots_in_line.push(spot_json);
                        break;
                    }
                }
            }
            win.spotsList = spots_in_line;
            var ul = $('#jd_list_ul ul');
            $('#jd_list_ul').removeClass('jq_list');
            var _first = '<li><span class="setp setp_0">0</span><div class="none_jd"><strong>热门景点线路</strong>  <span class="text">（预计游玩时间5小时） </span></div></li>';
            ul.html(_first + Class.template('spotsListTpl', win.spotsList));
            Class.OpenContext.shift();
            Class.OpenContext.push('line', oneLineJson);
            if (!win.listSlider) {
                win.listSlider = new Class.ListSlide('jd_list_ul');
            }
            else {
                win.listSlider.reset();
            }
        },
        showTypeMapList: function(typeid) {
            Class.View.ClickedType = typeid;
            map.clearCurrentSpots();
            map.pushSpotsToCurrentByType(typeid);
            if (Class.Geo.pos && Class.Geo.xy && Class.Geo.posInContext == true) {
                var _d = Class.Geo.getMyPosJson();
                map.pushSpotsToCurrent(_d);
            }
            Class.View.showTypeList(typeid);
            map.showSpots();
            $('.map_menu_con a').each(function(i, li) {
                if (typeid == li.getAttribute('typeid')) {
                    li.className = 'current';
                }
                else {
                    li.className = '';
                }
            });
            if (!win.listSlider) {
                win.listSlider = new Class.ListSlide('jd_list_ul');
            }
            else {
                win.listSlider.reset();
            }
        },
        MsgPoper: function(bigMsg, smallMsg, o) {
            bigMsg = bigMsg || '';
            smallMsg = smallMsg || '';
            o = o || {};
            var popUp = $('.pop_net');
            this.show = function(pbigMsg, psmallMsg, po) {
                try {
                    pbigMsg = pbigMsg || bigMsg;
                    psmallMsg = psmallMsg || smallMsg;
                    po = po || o;
                    var smallLength = (new String(psmallMsg)).length;
                    var display = smallLength > 0 ? '': 'none';
                    var htag = smallLength > 0 ? 'h2': 'h3';
                    var html = '<' + htag + '>' + pbigMsg + '</' + htag + '><p style="display:' + display + ';">' + psmallMsg + '</p>';
                    popUp.html(html);
                    popUp.show();
                    var mapHeight = win.innerHeight - $('#jd_nav').height();
                    var mapWidth = win.innerWidth;
                    var myHeight = popUp.height();
                    var posLeft = mapWidth / 2;
                    var posTop = (mapHeight - myHeight) / 2;
                    popUp.css('left', posLeft).css('top', posTop);
                    for (var p in po) {
                        popUp.css(p, po[p]);
                    }
                    setTimeout(this.hide, po.closeTime || 2000);
                } catch(e) {
                    alert(e.message);
                }
            };
            this.hide = function() {
                popUp.hide();
            };
        },
        showMapNav: function(orientation) {},
        showMapNavSet: function(width, height) {
            var that = this;
            var map_nav = $('.map_nav');
            var all_map = $('.all_map');
            var jd_con = $('.jd_con');
            var jd_map = $('#jd_map');
            var nav_list = $('.nav_list');
            var nav_pic = $('.nav_pic');
            map_nav.show();
            all_map.hide();
            jd_con.hide();
            var pic_img = $('.map_nav .pic img');
            pic_img.css('width', width);
            pic_img.css('height', height + 100);
            var map_menu = $('.map_nav .map_menu');
            map_menu.css('left', (width - 291) / 2);
            map_menu.css('top', (height - 302) / 2);
            if (that.initEvent != true) {
                $('.map_nav area').on('click',
                function(evt) {
                    var p = evt.target;
                    var mapid = evt.target.getAttribute('mapid');
                    map_nav.hide();
                    jd_con.hide();
                    jd_map.show();
                    all_map.show();
                    nav_list.show();
                    nav_pic.hide();
                    mapFilter.mode = 'map';
                    mapFilter.hide();
                    Class.View.adaptDelegate('',
                    function(width, height) {
                        this.adaptDevSet(width, height);
                    });
                    map.destroy();
                    map.config.scenicID = mapid;
                    Class.Storage.set('mapid', mapid);
                    map.load3DYouMap(map.config.scenicID,
                    function(obj) {
                        var typeid = map.stype || '4';
                        Class.View.showTypeMapList(typeid);
                        Class.Data.loadData(mapid,
                        function() {
                            var initDistanceObj = Class.OpenContext.length() > 0 ? Class.OpenContext.get(0) : null;
                            switch (initDistanceObj.key) {
                            case 'line':
                                map.showOneLine(initDistanceObj.value);
                                Class.View.showOneLineList(initDistanceObj.value);
                                break;
                            case 'typespots':
                                Class.View.showTypeMapList(initDistanceObj.value);
                                break;
                            default:
                                break;
                            }
                        });
                        $('#loading_map').hide();
                        all_map.show();
                        $('#map').show();
                        _doc.title = map.config.scenicIDName[mapid];
                    });
                    evt.stopPropagation();
                    evt.preventDefault();
                });
            }
            that.initEvent = true;
        },
        showInitedSpot: function() {
            var that = this;
            var tool = new Class.Tool();
            var args = tool.strToMap(win.location.search.replace('?', ''), '&', '=');
            try {
                if (args && args.mid && args.spot) {
                    that.showInitedLocation(args);
                    return;
                }
                if (args && args.stype) {
                    that.showInitedType(args.stype);
                    return;
                }
                that.showInitedDefault('4');
            }
            catch(e) {
                alert(e.message);
            }
        },
        showInitedType: function(ptype) {
            var that = this;
            var mapid = Class.Storage.get('mapid');
            map.stype = ptype;
            if (!mapid) {
                var msgPoper = new that.MsgPoper('请选择您所在的地图', '', null);
                msgPoper.show();
                return;
            }
            that.showInitedDefault(ptype);
        },
        showInitedDefault: function(type) {
            var mapid = Class.Storage.get('mapid');
            if (!mapid) {
                return;
            }
            map.config.scenicID = mapid;
            $('.map_nav').hide();
            $('.all_map').show();
            Class.View.adaptDelegate('',
            function(width, height) {
                this.adaptDevSet(width, height);
            });
            map.load3DYouMap(map.config.scenicID,
            function(obj) {
                if (obj) {
                    $('.map_nav').hide();
                    $('.all_map').show();
                    Class.View.adaptDelegate('',
                    function(width, height) {
                        this.adaptDevSet(width, height);
                    });
                    Class.View.showTypeMapList(type);
                    Class.Data.loadData(mapid,
                    function() {
                        var initDistanceObj = Class.OpenContext.length() > 0 ? Class.OpenContext.get(0) : null;
                        switch (initDistanceObj.key) {
                        case 'line':
                            map.showOneLine(initDistanceObj.value);
                            Class.View.showOneLineList(initDistanceObj.value);
                            break;
                        case 'typespots':
                            Class.View.showTypeMapList(initDistanceObj.value);
                            break;
                        default:
                            break;
                        }
                    });
                }
                _doc.title = map.config.scenicIDName[mapid];
            });
        },
        showInitedLocation: function(args) {
            map.config.scenicID = args.mid;
            $('.map_nav').hide();
            $('.all_map').show();
            Class.View.adaptDelegate('',
            function(width, height) {
                this.adaptDevSet(width, height);
            });
            map.load3DYouMap(map.config.scenicID,
            function(obj) {
                $('.map_nav').hide();
                $('.all_map').show();
                $('#currentLine').html('线路推荐');
                Class.View.adaptDelegate('',
                function(width, height) {
                    this.adaptDevSet(width, height);
                });
                var currSpot = map.getSpotJsonById(args.spot);
                if ('undefined' == typeof currSpot) {
                    alert('SceneId Invalid!');
                    return;
                }
                var tagid = currSpot.tags.length > 0 ? currSpot.tags[0].tag_id: '4';
                Class.View.showTypeMapList(tagid);
                Class.Data.loadData(args.mid,
                function() {
                    var initDistanceObj = Class.OpenContext.length() > 0 ? Class.OpenContext.get(0) : null;
                    switch (initDistanceObj.key) {
                    case 'line':
                        map.showOneLine(initDistanceObj.value);
                        Class.View.showOneLineList(initDistanceObj.value);
                        map.selectSpot(args.spot);
                        break;
                    case 'typespots':
                        Class.View.showTypeMapList(initDistanceObj.value);
                        map.selectSpot(args.spot);
                        break;
                    default:
                        break;
                    }
                });
                _doc.title = map.config.scenicIDName[map.config.scenicID];
            });
        },
        adaptGalarySet: function(width, height) {
            var show_photo = $('.show_photo');
            show_photo.show();
            show_photo.css('height', height).css('z-index', 5).css('position', 'absolute').css('top', '0px').css('width', '100%');
            $('.show_photo section').css('width', width);
            Class.Event.tslid.init(Class.Event.tslidIndex);
            var imgs = $('.show_photo section img');
            imgs.each(function(i, _img) {
                var _img = $(_img);
                var margin = height - _img.height();
                _img.css('margin-top', margin / 2 + 'px').css('margin-bottom', margin / 2 + 'px');
            });
        },
        fitPopUp: function() {
            var that = this;
            var popup = $('.point_current').children('div');
            var relaveIcon = map.popupDiv;
            if ('none' == popup.css('display')) {
                return;
            }
            var top = (relaveIcon.offset()).top;
            var height = parseInt(popup.css('height'));
            if (top - height < 0) {
                popup.removeClass('point_detail_b').addClass('point_detail_t');
            }
            else {
                popup.removeClass('point_detail_t').addClass('point_detail_b');
            }
        }
    });
    Class.View.adaptDelegate('',
    function(width, height) {
        this.showMapNavSet(width, height);
    });
    Class.Data = {};
    Class.extend(Class.Data, {
        referDataLoaded: {},
        set: function(mid, dataArr) {
            map.referData[mid] = dataArr;
            map.referDataIndex[mid] = {};
            for (var i = 0, len = dataArr.length; i < len; i++) {
                map.referDataIndex[mid][dataArr[i].id] = i;
            }
            Class.Storage.set(mid + '.json', win.JSON.stringify(dataArr));
            Class.Storage.set(mid + '.time', (new Date()).getTime());
        },
        loadData: function(sceneId, callback) {
            var that = this;
            callback = callback || null;
            var localStoredJson = Class.Storage.get(sceneId + '.json');
            var cacheTime = Class.Storage.get(sceneId + '.time');
            cacheTime = cacheTime && parseInt(cacheTime, 10) > 0 ? cacheTime: 0;
            var cacheLifeTime = 24 * 60 * 60 * 1000;
            var nowTime = (new Date()).getTime();
            if (localStoredJson && nowTime - cacheTime < cacheLifeTime) {
                var _dataArr = win.JSON.parse(localStoredJson);
                that.referDataLoaded = true;
                that.set(sceneId, _dataArr);
                if (Class.isFunction(callback)) {
                    callback();
                }
                return;
            }
            else {
                that.referDataLoaded = false;
            }
            if (typeof that.referDataLoaded[sceneId] == 'undefined') {
                var url = 'http://%test%imgcache.qq.com/piao/js/html5/j/weichat/data/' + sceneId + '.json';
                url = url.replace('%test%', map.config.testDomain);
                url += '?' + (new Date()).getTime();
                Class.loadJs(url,
                function() {
                    that.referDataLoaded = true;
                    if (Class.isFunction(callback)) {
                        callback();
                    }
                });
            }
        }
    });
    Class.extend({
        Audio: function() {
            var that = this;
            this.progressInfo = {};
            this.player = null;
            var _getAudio = function() {
                try {
                    var _s = Class.audioSupport.audio;
                    if (!_s) {
                        throw 'your browser dose not support audio';
                    }
                    var video = new Audio();
                    return video;
                } catch(e) {
                    alert(e);
                }
            };
            this.load = function(url) {
                var that = this;
                this.player = _getAudio();
                this.progressInfo = {};
                var prefix = url.substr(url.lastIndexOf('.') + 1);
                var typemap = {
                    'mp3': 'mpeg',
                    'ogg': 'ogg'
                };
                if (Class.audioSupport.audio && Class.audioSupport[typemap[prefix]]) {
                    this.player.innerHTML = '<source src="' + url + '" type="audio/' + typemap[prefix] + '"></source>';
                    this.player.load();
                    _initEvents();
                }
            };
            this.Callbacks = {};
            this.play = function() {
                var that = this;
                if (that.player.seekable.length == 0) {
                    that.player.play();
                    var testTimes = 0;
                    var getSeekable = setInterval(function() {
                        testTimes++;
                        if (that.player.seekable.length > 0 && that.player.seekable.end(0) > 0 && testTimes < 10) {
                            clearInterval(getSeekable);
                            that.player.play();
                        }
                    },
                    400);
                } else {
                    this.player.play();
                }
            };
            this.pause = function() {
                if (this.player) {
                    this.player.pause();
                }
            };
            var _eventer = {
                handleEvent: function(evt) {
                    switch (evt.type) {
                    case 'canplaythrough':
                        that.progressInfo['allLoaded'] = true;
                        if (Class.isFunction(that.Callbacks.load)) {
                            that.Callbacks.load(that.progressInfo);
                        }
                        break;
                    case 'error':
                        that.progressInfo['error'] = that.player.error;
                        if (Class.isFunction(that.Callbacks.error)) {
                            that.Callbacks.error(that.progressInfo);
                        }
                        break;
                    case 'canplay':
                    case 'play':
                    case 'pause':
                    case 'ended':
                        that.progressInfo[evt.type] = true;
                        if (Class.isFunction(that.Callbacks.control)) {
                            that.Callbacks.control(that.progressInfo);
                        }
                        break;
                    case 'progress':
                        var len = that.player.buffered.length - 1;
                        if (len > -1) {
                            that.progressInfo['loaded'] = that.player.buffered.end(len);
                            that.progressInfo['total'] = that.player.duration;
                        }
                        if (Class.isFunction(that.Callbacks.progress)) {
                            that.Callbacks.progress(that.progressInfo);
                        }
                    case 'timeupdate':
                        var len = that.player.buffered.length - 1;
                        if (len > -1) {
                            that.progressInfo['loaded'] = that.player.buffered.end(len);
                            that.progressInfo['total'] = that.player.duration;
                        }
                        if (Class.isFunction(that.Callbacks.timeupdate)) {
                            that.Callbacks.timeupdate(that.progressInfo);
                        }
                        break;
                    }
                }
            };
            var _initEvents = function() {
                var eventList = ['canplay', 'play', 'pause', 'ended', 'error', 'canplaythrough', 'progress', 'timeupdate'];
                for (var p in eventList) {
                    that.player.addEventListener(eventList[p], _eventer, false);
                }
            };
        }
    });
    Class.extend({
        AudioPlayer: function() {
            var playBtn = null;
            var playTxt = null;
            win.audioPlayer = new Class.Audio();
            this.played = {};
            this.loaded = false;
            this.playing = false;
            this.load = function(tar) {
                var that = this;
                tar = $(tar);
                playBtn = tar.children('span').first();
                playTxt = tar.children('span').last();
                var audiourl = tar.attr('audiourl') || $(tar).parents('div').attr('audiourl');
                that.played[audiourl] = true;
                audioPlayer.Callbacks['load'] = function() {
                    audioPlayer.play();
                    that.playing = true;
                    that.loaded = true;
                    playTxt.html(Math.round(audioPlayer.player.duration));
                };
                audioPlayer.Callbacks['error'] = function(obj) {
                    var errorMap = {
                        '1': '用户中止播放',
                        '2': '网络出现错误',
                        '3': '语音解码错误',
                        '4': '语音的地址可能有错误'
                    };
                    var msgPoper = new Class.View.MsgPoper(errorMap[obj.error.code], '', null);
                    msgPoper.show();
                    that.reset();
                };
                audioPlayer.Callbacks['timeupdate'] = function() {
                    var progress = Math.round(audioPlayer.player.duration) - Math.round(audioPlayer.player.currentTime);
                    if (isNaN(progress)) {
                        return;
                    }
                    playTxt.html(progress + '"');
                };
                audioPlayer.Callbacks['control'] = function() {
                    if (true === win.audioPlayer.progressInfo['ended']) {
                        that.reset();
                    }
                };
                audioPlayer.load(audiourl);
                playBtn.get(0).className = 'ico_voice_pause';
                playTxt.html('加载中');
            };
            this.pause = function() {
                audioPlayer.pause();
                win.player.playing = false;
                playBtn.removeClass('ico_voice_pause').addClass('ico_voice');
            };
            this.play = function() {
                audioPlayer.play();
                this.playing = true;
                playBtn.removeClass('ico_voice').addClass('ico_voice_pause');
            };
            this.reset = function() {
                var that = this;
                win.audioPlayer.progressInfo = {};
                win.audioPlayer.pause();
                that.played = {};
                that.playing = false;
                that.loaded = false;
                if (null != playBtn) {
                    playBtn.attr('class', 'ico_voice');
                }
                if (null != playTxt) {
                    playTxt.html('语音');
                }
            };
        }
    });
    Class.Map = function() {};
    Class.extend(Class.Map.prototype, {
        sceneId: 0,
        referData: {},
        referDataIndex: {},
        scenicJSON: {},
        mapInitJSON: {},
        sceneCurrSpots: [],
        classedSceneJson: {},
        mapApiLoaded: false,
        referDataLoaded: false,
        centerSpot: {},
        selectSpotJson: null,
        selectSpotFlag: false,
        config: {
            scenicID: 1345,
            apiKey: '7A6A6F716F6C77796679777D7B676A616D686669796A6E696C6E777F786A',
            url: "http://www.3dyou.cn/scenic/%scenicID%?apikey=%apikey%&output=json&callback=?",
            testDomain: '',
            iconPath: "http://%test%imgcache.qq.com/lifestyle/app/wx_jingdian/img/",
            centerSpot: {
                '1345': '21906',
                '1344': '21575',
                '1341': '21668'
            },
            scenicIDName: {
                '1345': '大侠谷',
                '1344': '大华兴寺',
                '1341': '茶溪谷'
            }
        },
        load3DYouMap: function(sceneId, callback) {
            var that = this;
            callback = callback || null;
            that.mapApiLoadTimes = 0;
            if (false == that.mapApiLoaded) {
                Class.loadJs('http://api.3dyou.cn/lib/3dyou.scenicmap.min.js',
                function() {
                    that.mapApiLoaded = true;
                });
            } (function() {
                if (false === that.mapApiLoaded && that.mapApiLoadTimes < 10) {
                    that.mapApiLoadTimes++;
                    setTimeout(arguments.callee, 500);
                }
                else {
                    if (that.mapApiLoadTimes >= 10) {
                        Class.Geo.msgPoper.show('加载地图失败！', '可能是您的网速不给力<br/>请重试！', null);
                        return;
                    }
                    if (typeof that.mapInitJSON[sceneId] != 'undefined') {
                        that.scenicJSON = that.mapInitJSON[sceneId].scenicJSON;
                        that.cacheClassScene(sceneId);
                        that.showMap(sceneId);
                        if (Class.isFunction(callback)) {
                            callback(that);
                        }
                        return;
                    }
                    var apiKey = that.config.apiKey;
                    var g = that.config.url.replace('%scenicID%', sceneId).replace('%apikey%', apiKey);
                    $.getJSON(g,
                    function(scenicJSON) {
                        for (var j = 0; j < scenicJSON.spots.length; j++) {
                            var spotJSON = scenicJSON.spots[j];
                            var typestr = 'point';
                            var tags = spotJSON.tags;
                            var tagImgMap = {
                                '4': 'jingdian',
                                '5': 'dining',
                                '6': 'wc',
                                '7': 'cinema',
                                '8': 'hotel',
                                '9': 'shopping',
                                '10': 'wifi',
                                '11': 'bus',
                                '12': 'bank'
                            };
                            if (tags.length > 0) {
                                typestr = tagImgMap[tags[0].tag_id];
                                typestr = typestr == undefined ? 'point': typestr;
                            }
                            if ('here' != spotJSON.index) {
                                spotJSON.index = typestr + '_m';
                                spotJSON.spotStyle = {
                                    graphicOpacity: 1.0,
                                    graphicWidth: 23,
                                    graphicHeight: 33
                                };
                            }
                            if (that.config.centerSpot[sceneId] == spotJSON.id) {
                                that.centerSpot[sceneId] = spotJSON;
                            }
                        };
                        that.scenicJSON = scenicJSON;
                        that.config.iconPath = that.config.iconPath.replace('%test%', that.config.testDomain);
                        that.mapInitJSON[sceneId] = {
                            mapDiv: 'map',
                            scenicJSON: that.scenicJSON,
                            IconPath: that.config.iconPath + '/icon_[index].png',
                            buildPopupInfo: function(feature) {
                                var fspot = feature.attributes;
                                if ('here' == feature.attributes.index) {
                                    return;
                                }
                                var tags = feature.attributes.tags;
                                var typestr = 'point';
                                if (tags.length > 0) {
                                    typestr = tagImgMap[tags[0].tag_id];
                                    typestr = typestr == undefined ? 'point': typestr + '_m';
                                }
                                var src = that.config.iconPath + 'icon_jingdian_hover.png';
                                that.selectSpotJson = feature.attributes;
                                var result = {};
                                result.x = feature.geometry.x;
                                result.y = feature.geometry.y;
                                fspot.ico_rec = fspot.recShow == 'none' ? '': 'ico_rec';
                                fspot.ico_voice_disabled = fspot.audiourl && fspot.audiourl.length > 5 ? '': 'disabled';
                                fspot.ico_photo_disabled = fspot.imglist && fspot.imglist.length > 5 ? '': 'disabled';
                                fspot.ico_here_disabled = '';
                                fspot.distance = (!isNaN(parseInt(fspot.distancenum)) && parseInt(fspot.distancenum) > 0) ? '距离' + fspot.distancenum + '米': '距离未知';
                                win.onespot = fspot;
                                if (Class.HereContext.activated && Class.HereContext.length() == 1) {
                                    that.backHere(win.onespot);
                                }
                                result.html = Class.template('onespotTpl', win.onespot);
                                that.setCenterSpot(feature.attributes);
                                that.selectSpotFlag = false;
                                return result;
                            },
                            setPopupStyle: function(divs) {
                                var popupDiv = divs.popupDiv;
                                var groupDiv = divs.groupDiv;
                                var contentDiv = divs.contentDiv;
                                var closeDiv = divs.closeDiv;
                                popupDiv.css('background-color', 'transparent');
                                popupDiv.css('overflow', 'visible');
                                groupDiv.css('position', '');
                                contentDiv.css('position', '');
                                var cssleft = parseInt(popupDiv.css('left').replace('px', ''));
                                var csstop = parseInt(popupDiv.css('top').replace('px', ''));
                                popupDiv.css('left', (cssleft - 21) + 'px');
                                popupDiv.css('top', (csstop - 42) + 'px');
                                that.popupDiv = popupDiv;
                                Class.View.fitPopUp();
                                popupDiv.on('click',
                                function(evt) {
                                    Class.Event.initClickPopup(evt);
                                });
                            }
                        };
                        that.cacheClassScene(sceneId);
                        that.showMap(sceneId);
                        if (Class.isFunction(callback)) {
                            callback(that);
                        }
                    });
                }
            })();
        },
        showMap: function(sceneId) {
            var that = this;
            that.sceneId = sceneId;
            _doc.title = that.config.scenicIDName[sceneId];
            OEngine.scenicmap.init(that.mapInitJSON[sceneId]);
            switch (sceneId) {
            case '1344':
                OEngine.scenicmap.setZoom(0);
                break;
            default:
                break;
            }
            if (that.config.centerSpot[sceneId]) {
                that.setCenterSpot(that.centerSpot[sceneId]);
            }
            var mutiTouch = new Class.MutiTouchSlide('#map > div');
            Class.Geo.posInContext = false;
            Class.HereContext.resolve(that, null, false);
        },
        cacheClassScene: function(sceneId) {
            var that = this;
            that.moreTags = {};
            that.classedSceneJson[sceneId] = {};
            var _all_spots = that.scenicJSON.spots;
            for (var i in _all_spots) {
                var tags = _all_spots[i].tags;
                if (tags.length != undefined) {
                    for (var j = 0, len = tags.length; j < len; j++) {
                        var tag_id = tags[j].tag_id;
                        var tag_name = tags[j].tag_name;
                        that.moreTags[tag_id] = tag_name;
                        if (! (tag_id in that.classedSceneJson[sceneId])) {
                            that.classedSceneJson[sceneId][tag_id] = {};
                        }
                        that.classedSceneJson[sceneId][tag_id][_all_spots[i].id] = _all_spots[i];
                    }
                }
            }
        },
        pushSpotsToCurrent: function(spotsJson) {
            var that = this;
            that.sceneCurrSpots.push(spotsJson);
        },
        getSpotJsonById: function(spotId) {
            var that = this;
            var spots = that.scenicJSON.spots;
            for (var p in spots) {
                if (spotId == spots[p].id) {
                    return spots[p];
                }
            }
        },
        showOneLine: function(lineJson) {
            var that = this;
            var spots_id_in_line = lineJson.spots || '';
            spots_id_in_line = spots_id_in_line.split(',');
            var spots_in_line = [];
            var scene_json = that.scenicJSON;
            var lastIndex = 0;
            for (var i = 0, ilen = spots_id_in_line.length; i < ilen; i++) {
                for (var j = 0, jlen = scene_json.spots.length; j < jlen; j++) {
                    var spot_json = scene_json.spots[j];
                    var sid = spot_json.id;
                    if (sid == spots_id_in_line[i]) {
                        if (typeof map.referDataIndex[that.sceneId] != 'undefined') {
                            if (sid in map.referDataIndex[that.sceneId]) {
                                var referIndex = map.referDataIndex[that.sceneId][sid];
                                var referOneData = map.referData[that.sceneId][referIndex];
                                Class.extend(spot_json, referOneData);
                            }
                        }
                        lastIndex++;
                        spot_json.index = 'point_' + lastIndex;
                        spots_in_line.push(spot_json);
                        break;
                    }
                }
            }
            var contextRun = function() {
                if (Class.Geo.pos && Class.Geo.xy && Class.Geo.posInContext == true) {
                    var _d = Class.Geo.getMyPosJson();
                    _d.spotStyle = {
                        graphicOpacity: 1.0,
                        graphicWidth: 61,
                        graphicHeight: 61
                    };
                    if ('undefined' == typeof Class.Geo.posInLine || false == Class.Geo.posInLine) {
                        spots_in_line.push(_d);
                        Class.Geo.posInLine = true;
                    }
                    else {
                        for (var p in spots_in_line) {
                            if (_d.id == spots_in_line[p].id) {
                                spots_in_line[p].locationData = _d.locationData;
                                break;
                            }
                        }
                    }
                }
                that.sceneCurrSpots = spots_in_line;
                OEngine.scenicmap.showSpots(that.sceneCurrSpots);
                OEngine.scenicmap.render('map');
                OEngine.scenicmap.showLine();
                var lineStyle = {
                    strokeColor: "#FF0000",
                    strokeOpacity: 0.5,
                    strokeWidth: 6
                };
                OEngine.scenicmap.hidePopup();
                OEngine.scenicmap.showLine(lineJson.locationData, lineStyle);
                OEngine.scenicmap.setZoom(0);
                if (true == Class.Geo.posInContext) {
                    OEngine.scenicmap.setCenterSpot(Class.Geo.getMyPosJson());
                }
                OEngine.scenicmap.selectSpot(that.selectSpotJson);
            };
            Class.MapContext.shift();
            Class.MapContext.push('showOneLine', contextRun);
            Class.MapContext.resolve(that, null, true);
        },
        showSpots: function() {
            var that = this;
            var contextRun = function() {
                if (Class.Geo.pos && Class.Geo.xy && Class.Geo.posInContext == true) {
                    var _d = Class.Geo.getMyPosJson();
                    _d.spotStyle = {
                        graphicOpacity: 1.0,
                        graphicWidth: 61,
                        graphicHeight: 61
                    }
                    if ('undefined' == typeof Class.Geo.posInTypeSpots || false == Class.Geo.posInTypeSpots) {
                        that.sceneCurrSpots.push(_d);
                        Class.Geo.posInTypeSpots = true;
                    }
                    else {
                        for (var p in that.sceneCurrSpots) {
                            if (_d.id == that.sceneCurrSpots[p].id) {
                                that.sceneCurrSpots[p].locationData = _d.locationData;
                                break;
                            }
                        }
                    }
                }
                var openContextLen = Class.OpenContext.length();
                var obj = openContextLen > 0 ? Class.OpenContext.get(0) : null;
                if (obj != null && typeof obj.key != 'undefined' && 'line' != obj.key) {
                    for (var j = 0; j < that.sceneCurrSpots.length; j++) {
                        var spotJSON = that.sceneCurrSpots[j];
                        var typestr = 'point';
                        var tags = spotJSON.tags;
                        var tagImgMap = {
                            '4': 'jingdian',
                            '5': 'dining',
                            '6': 'wc',
                            '7': 'cinema',
                            '8': 'hotel',
                            '9': 'shopping',
                            '10': 'wifi',
                            '11': 'bus',
                            '12': 'bank'
                        };
                        if (tags.length > 0) {
                            typestr = tagImgMap[tags[0].tag_id];
                            typestr = typestr == undefined ? 'point': typestr;
                        }
                        if ('here' != spotJSON.index) {
                            spotJSON.index = typestr + '_m';
                        }
                        else {
                            spotJSON.spotStyle = {
                                graphicOpacity: 1.0,
                                graphicWidth: 61,
                                graphicHeight: 61
                            };
                        }
                    }
                }
                OEngine.scenicmap.hidePopup();
                OEngine.scenicmap.showSpots(that.sceneCurrSpots);
                if (true == Class.Geo.posInContext) {
                    OEngine.scenicmap.setCenterSpot(Class.Geo.getMyPosJson());
                }
            }
            Class.MapContext.shift();
            Class.MapContext.push('showSpots', contextRun);
            Class.MapContext.resolve(that, null, true);
        },
        pushSpotsToCurrentByType: function(typeid) {
            var that = this;
            var sceneId = that.sceneId;
            var typedJson = that.classedSceneJson[sceneId];
            for (var p in typedJson) {
                if (typeid === p) {
                    for (var j in typedJson[p]) {
                        var item = typedJson[p][j];
                        var sid = item.id;
                        if (typeof map.referDataIndex[that.sceneId] != 'undefined') {
                            if (sid in map.referDataIndex[that.sceneId]) {
                                var referIndex = map.referDataIndex[that.sceneId][sid];
                                var referOneData = map.referData[that.sceneId][referIndex];
                                Class.extend(item, referOneData);
                            }
                        }
                        that.sceneCurrSpots.push(item);
                    }
                }
            }
        },
        clearCurrentSpots: function() {
            var that = this;
            that.sceneCurrSpots.splice(0, that.sceneCurrSpots.length);
        },
        clearLine: function() {
            OEngine.scenicmap.clearLine();
        },
        clearPopUp: function() {
            OEngine.scenicmap.hidePopup();
        },
        zoomIn: function() {
            OEngine.scenicmap.zoomIn();
        },
        zoomOut: function(level) {
            OEngine.scenicmap.zoomOut();
        },
        rerender: function() {
            OEngine.scenicmap.render('map');
        },
        setCenterSpot: function(spot) {
            OEngine.scenicmap.setCenterSpot(spot);
        },
        selectSpot: function(spotid) {
            var that = this;
            var currentSpots = that.sceneCurrSpots;
            for (var p in currentSpots) {
                that.selectSpotJson = null;
                if (spotid == currentSpots[p].id) {
                    that.showSpots();
                    that.selectSpotJson = currentSpots[p];
                    OEngine.scenicmap.setCenterSpot(currentSpots[p]);
                    OEngine.scenicmap.selectSpot(currentSpots[p]);
                    break;
                }
            }
        },
        destroy: function(divid) {
            var that = this;
            var divid = divid || '';
            if (true == that.mapApiLoaded) {
                OEngine.scenicmap.destroy(divid);
            }
        },
        goHere: function(targetSpot) {
            var that = this;
            that.showHere = true;
            function locationSuccess() {
                OEngine.scenicmap.hidePopup();
                Class.HereContext.shift();
                Class.HereContext.activated = true;
                var currSpots = [];
                Class.extend(true, currSpots, that.sceneCurrSpots);
                Class.HereContext.push('goHere', currSpots);
                that.clearCurrentSpots();
                var newContext = [targetSpot];
                var myposJson = Class.Geo.getMyPosJson();
                false != myposJson ? newContext.push(myposJson) : '';
                var sx = 0,
                sy = 0;
                for (var p in newContext) {
                    sx += newContext[p].locationData.x;
                    sy += newContext[p].locationData.y;
                    that.pushSpotsToCurrent(newContext[p]);
                }
                var tmpsot = {};
                that.showSpots();
                if (newContext.length > 1) {
                    Class.extend(true, tmpsot, targetSpot);
                    tmpsot.locationData.x = sx > sx / 2;
                    tmpsot.locationData.y = sy / 2;
                    that.setCenterSpot(tmpsot);
                }
            }
            var position_option = {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 20000
            };
            Class.Geo.pos = undefined;
            navigator.geolocation.getCurrentPosition(function(position) {
                var lat = position.coords.latitude;
                var lng = position.coords.longitude;
                Class.Geo.pos = {
                    "lat": lat,
                    "lng": lng
                };
                Class.Geo.showPosContext(lat, lng, locationSuccess);
            },
            Class.Geo.getPositionError, position_option);
        },
        backHere: function(targetSpot) {
            var that = this;
            var oldSpots = Class.HereContext.shift();
            if (oldSpots) {
                that.sceneCurrSpots = oldSpots.value;
                that.showSpots();
            }
        }
    });
    Class.Event = {};
    Class.extend(Class.Event, {
        navBarClick: function(target) {
            var nav_line = $('.nav_line');
            var nav_menu = $('.nav_menu');
            var nodeName = target.nodeName.toLowerCase();
            if ('span' === nodeName) {
                target = target.parentNode;
            } else if ('div' === nodeName || 'li' === nodeName) {
                return;
            }
            $('.jd_nav a').each(function(i, li) {
                li.className = '';
            });
            target.className = 'current';
            var typeid = target.getAttribute('typeid');
            if (typeid) {
                Class.View.ClickedType = typeid;
                Class.View.showTypeMapList(typeid);
                nav_line.hide();
                nav_menu.hide();
                return;
            }
            var line = target.getAttribute('linetype');
            if (line) {
                if (1 != Class.ClickSpliterObj.getPos()) {
                    Class.ClickSpliterObj.toBottom();
                }
                win.lines = map.scenicJSON.lines;
                $('.nav_line ul').html(Class.template('lines', win.lines));
                var index = map.scenicJSON.lines.length > 0 ? 0 : null;
                if (null === index) {
                    return;
                }
                Class.View.ClickedLineIndex = index;
                var oneLine = map.scenicJSON.lines[index];
                Class.Geo.posInLine = false;
                map.showOneLine(oneLine);
                Class.View.showOneLineList(oneLine);
                return;
                nav_menu.hide();
                if ('none' == nav_line.css('display')) {
                    nav_line.show();
                    $('.nav_line ul a').each(function(i, a) {
                        var linindex = a.getAttribute('index');
                        if (Class.View.ClickedLineIndex != undefined && Class.View.ClickedLineIndex == linindex) {
                            a.className = 'current';
                            return;
                        }
                    });
                } else {
                    nav_line.hide();
                }
                nav_line.css('z-index', 3).css('top', (win.innerHeight - nav_line.height()) / 2);
                nav_line.css('left', ($('.scenic_map').width() - nav_line.width()) / 2);
                return;
            }
            var more = target.getAttribute('more');
            if (more) {
                if (1 != Class.ClickSpliterObj.getPos()) {
                    Class.ClickSpliterObj.toBottom();
                }
                var tagClassMap = {
                    '4': '景点|menu_1',
                    '7': '表演|menu_5',
                    '8': '酒店|menu_2',
                    '5': '餐饮|menu_3',
                    '9': '购物|menu_6',
                    '6': '洗手间|menu_4',
                    '11': '园区交通|menu_7',
                    '12': '售票点|menu_8',
                    '10': 'Wifi|menu_9'
                };
                if (typeof Class.moreTagsArr == 'undefined' || Class.moreTagsArr.length <= 0) {
                    var moreTagsArr = [];
                    var moreTagsObj = map.moreTags;
                    for (var p in tagClassMap) {
                        var tmpObj = {};
                        var tagname = tagClassMap[p].split('|');
                        tagname = tagname[0];
                        var tagclass = tagClassMap[p].split('|');
                        tagclass = tagclass[1];
                        if (p in moreTagsObj) {
                            tmpObj.class_name = tagclass;
                            tmpObj.tagid = p;
                            tmpObj.tname = tagname;
                            tmpObj.tindex = (tagclass.substr(tmpObj.class_name.indexOf('_')));
                            moreTagsArr.push(tmpObj);
                        } else {
                            tmpObj.class_name = tagclass + ' menu_dis';
                            tmpObj.tagid = p;
                            tmpObj.tname = tagname;
                            tmpObj.tindex = (tagclass.substr(tmpObj.class_name.indexOf('_')));
                            moreTagsArr.push(tmpObj);
                        }
                    }
                    moreTagsArr.sort(function(tmpObj1, tmpObj2) {
                        if (tmpObj1.tindex < tmpObj2.tindex) {
                            return - 1;
                        } else if (tmpObj1.tindex == tmpObj2.tindex) {
                            return 0;
                        } else {
                            return 1;
                        }
                    });
                }
                win.moreTags = moreTagsArr;
                $('.nav_menu ul').html(Class.template('moreTags', win.moreTags));
                nav_line.hide();
                if ('none' == nav_menu.css('display')) {
                    nav_menu.show();
                } else {
                    nav_menu.hide();
                    $('.jd_nav a').each(function(i, a) {
                        var tagid = a.getAttribute('typeid');
                        if (Class.View.ClickedType != undefined && Class.View.ClickedType == tagid) {
                            a.className = 'current';
                        } else {
                            a.className = '';
                        }
                    });
                }
                $('.nav_menu a').each(function(i, a) {
                    var tagid = a.getAttribute('tagid');
                    if (Class.View.ClickedType != undefined && Class.View.ClickedType == tagid) {
                        a.className = 'current';
                    } else {
                        a.className = '';
                    }
                });
                nav_menu.css('z-index', 3).css('top', (win.innerHeight - nav_menu.height()) / 2);
                nav_menu.css('left', ($('.scenic_map').width() - nav_menu.width()) / 2);
                return;
            }
        },
        initMapFilter: function() {
            var nav_line = $('.nav_line');
            var nav_menu = $('.nav_menu');
            var jd_list_ulist = $('#jd_list_ulist');
            nav_line.on('click',
            function(evt) {
                var clicked = evt.target;
                if (clicked.nodeName.toLowerCase() == 'a') {
                    var index = clicked.getAttribute('index');
                    var lineName = clicked.getAttribute('linename');
                    $('#currentLine').html(lineName.substring(0, 4));
                    $('#currentLine').get(0).parentNode.className = 'current';
                    Class.View.ClickedLineIndex = index;
                    var oneLine = map.scenicJSON.lines[index];
                    map.showOneLine(oneLine);
                    Class.View.showOneLineList(oneLine);
                }
                $('.nav_line').hide();
                evt.preventDefault();
                evt.stopPropagation();
            });
            nav_menu.on('click',
            function(evt) {
                var clicked = evt.target;
                var typeid = 0;
                if (clicked.nodeName.toLowerCase() == 'span') {
                    clicked = clicked.parentNode;
                }
                if (clicked.nodeName.toLowerCase() == 'a' && clicked.parentNode.className.indexOf('menu_dis') == -1) {
                    typeid = clicked.getAttribute('tagid');
                    Class.View.ClickedType = typeid;
                    Class.View.showTypeMapList(typeid);
                    $('.nav_menu').hide();
                }
                var isset = false;
                $('.jd_nav ul li a').each(function(i, a) {
                    var _typeid = a.getAttribute('typeid');
                    if (typeid && _typeid == typeid) {
                        isset = true;
                        a.className = 'current';
                    } else {
                        var _more = a.getAttribute('more');
                        a.className = (_more && false == isset) ? 'current': '';
                    }
                });
                evt.preventDefault();
                evt.stopPropagation();
            });
            jd_list_ulist.on('click',
            function(evt) {
                var p = evt.target;
                var layer = 5;
                while ('li' != p.nodeName.toLowerCase() && layer > 0) {
                    p = p.parentNode;
                    layer--;
                }
                var spotid = p.id;
                var sid = spotid.substr(3);
                if (Number(sid)) {
                    map.selectSpot(sid);
                    map.rerender('map');
                }
                evt.preventDefault();
                evt.stopPropagation();;
                return;
            });
        },
        initMapListDrager: function() {
            Class.ClickSpliterObj = new Class.ClickSpliter('jd_map');
            $('.nav_drag').on('click',
            function(evt) {
                Class.ClickSpliterObj.run();
                evt.preventDefault();
                evt.stopPropagation();
            });
        },
        initLocationClick: function() {
            $('#geoLocation').on('click',
            function(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                if ($.os.android) {
                    var msgPoper = new Class.View.MsgPoper();
                    var o = {
                        'backgroundImage': '',
                        'closeTime': 5000
                    };
                    msgPoper.show("您手机无法定位景点", '建议换一种方式查看周边信息：向聊天窗口发送地理位置。', o);
                    return;
                }
                Class.Geo.getMyPostion();
            });
        },
        clearPopUp: function() {
            var jd_nav = document.getElementById('jd_nav');
            var map = document.getElementById('map');
            function _move(evt) {
                evt.preventDefault();
            }
            function bodyClick(evt) {
                var tar = document.elementFromPoint(event.targetTouches[0].clientX, event.targetTouches[0].clientY);
                if ('image' == tar.nodeName.toLowerCase()) {
                    return;
                }
                $('.nav_line').hide();
                $('.nav_menu').hide();
                Class.ClickSpliterObj.toBottom();
                evt.preventDefault();
                evt.stopPropagation();
            }
            jd_nav.addEventListener(Class.eventSupport.move, _move, false);
            document.body.addEventListener(Class.eventSupport.move, _move, false);
        },
        initBackToNav: function() {
            $('.nav_guide').on('click',
            function(evt) {
                Class.View.adaptDelegate('',
                function(width, height) {
                    this.showMapNavSet(width, height);
                });
            });
        },
        initGalaryBak: function(imgList) {
            var img = imgList.split(',');
            var html = [];
            for (var p in img) {
                html.push('<section style="width:' + win.innerWidth + 'px;overflow:hidden"><img src="' + img[p] + '" width="100%" alt="" /></section>');
            }
            var show_photo = $('.show_photo');
            $('.show_photo .show_page').html('1/' + html.length);
            $('.show_photo #wrap').html(html.join(''));
            show_photo.show();
            show_photo.css('height', win.innerHeight).css('z-index', 5).css('position', 'absolute').css('top', '0px').css('width', '100%');
            var imgs = $('.show_photo section img');
            imgs.on('load',
            function(evt) {
                var _img = $(evt.target);
                var margin = win.innerHeight - _img.height();
                _img.css('margin-top', margin / 2 + 'px');
                _img.css('margin-bottom', margin / 2 + 'px');
            });
            var tin = new Class.TouchSlide('wrap', null,
            function(index) {
                var i = (index + 1);
                i = i > html.length ? html.length: i;
                i = i < 1 ? 1 : i;
                $('.show_photo .show_page').html(i + '/' + html.length);
            });
            tin.init();
            $('.show_close').one('click',
            function(evt) {
                $('.show_photo').hide();
            });
        },
        initGalary: function(imgList) {
            var img = imgList.split(',');
            var html = [];
            var _targetUrl = 'http://%testDomain%imgcache.qq.com/lifestyle/app/wx_jingdian/img/loading_1.gif';
            _targetUrl = _targetUrl.replace('%testDomain%', map.config.testDomain);
            for (var p in img) {
                var _section = '<section style="width:' + win.innerWidth + 'px;overflow:hidden;"><img src="%url%" width="100%" alt="" /></section>';
                var section = _section.replace('%url%', _targetUrl);
                html.push(section);
            }
            var show_photo = $('.show_photo');
            $('.show_photo .show_page').html('1/' + html.length);
            $('.show_photo #wrap').html(html.join(''));
            show_photo.show();
            show_photo.css('height', win.innerHeight).css('z-index', 5).css('position', 'absolute').css('top', '0px').css('width', '100%');
            var imgs = $('.show_photo section img');
            imgs.on('load',
            function(evt) {
                var _img = $(evt.target);
                var margin = win.innerHeight - _img.height();
                _img.css('margin-top', margin / 2 + 'px').css('margin-bottom', margin / 2 + 'px');
            });
            if (imgs.get(0).src.indexOf('loading') != -1) {
                imgs.get(0).src = img[0];
            }
            var tin = new Class.TouchSlide('wrap', null,
            function(index) {
                var i = (index + 1);
                i = i > html.length ? html.length: i;
                i = i < 1 ? 1 : i;
                $('.show_photo .show_page').html(i + '/' + html.length);
                if (imgs.get(i - 1).src.indexOf('loading') != -1) {
                    imgs.get(i - 1).src = img[i - 1];
                }
                Class.Event.tslidIndex = index;
            });
            Class.Event.tslid = tin;
            tin.init();
            mapFilter.hide();
            mapFilter.hideAll();
            $('.show_close').one('click',
            function(evt) {
                $('.show_photo').hide();
                mapFilter.showAll();
                mapFilter.hide();
            });
        },
        initOrientation: function() {
            var supportsOrientationChange = "onorientationchange" in win,
            orientationEvent = supportsOrientationChange ? "orientationchange": "resize";
            win.addEventListener(orientationEvent,
            function() {
                if ('none' !== $('.map_nav').css('display')) {
                    Class.View.adaptDelegate('orientation',
                    function(width, height) {
                        this.showMapNavSet(width, height);
                    });
                }
                if ('none' !== $('.all_map').css('display')) {
                    Class.View.adaptDelegate('orientation',
                    function(width, height) {
                        this.adaptDevSet(width, height);
                        map.rerender('map');
                    });
                }
                if ('none' !== $('.show_photo').css('display')) {
                    Class.View.adaptDelegate('orientation',
                    function(width, height) {
                        this.adaptGalarySet(width, height);
                    });
                }
            },
            false);
        },
        initMapListChange: function() {
            $('.nav_pic').on('click',
            function(evt) {
                mapFilter.mode = 'map';
                mapFilter.hide();
                $('.nav_pic').hide();
                $('.nav_list').show();
                $('#jd_map').show();
                $('#jd_con').hide();
                $('#jd_nav').css({
                    'bottom': '0px',
                    'background': 'none'
                });
            });
            $('.nav_list').on('click',
            function(evt) {
                mapFilter.mode = 'list';
                mapFilter.hide();
                $('.nav_list').hide();
                $('.nav_pic').show();
                $('#jd_map').hide();
                $('#jd_con').show();
                $('#jd_nav').css({
                    'bottom': '0px',
                    'background': 'rgba(76,64,55,.4)'
                });
                if (!win.listSlider) {
                    win.listSlider = new Class.ListSlide('jd_list_ul');
                } else {
                    win.listSlider.reset();
                }
            });
        },
        initMapFilterClick: function() {
            var nav_up = $('.nav_up');
            var nav_down = $('.nav_down');
            var map_menu_con = $('.map_menu_con');
            var jd_nav = $('#jd_nav');
            nav_up.on('click',
            function(evt) {
                mapFilter.show();
                var moreTagsObj = map.moreTags;
                $('.map_menu_con a').each(function(i, a) {
                    $(a).parent('li').removeClass('menu_dis');
                    if (a.getAttribute('typeid') && !(a.getAttribute('typeid') in moreTagsObj)) {
                        $(a).parent('li').addClass('menu_dis');
                    }
                });
            });
            nav_down.on('click',
            function(evt) {
                mapFilter.hide();
            });
            map_menu_con.on('click',
            function(evt) {
                var target = evt.target;
                var nodeName = target.nodeName.toLowerCase();
                if ('span' === nodeName) {
                    target = target.parentNode;
                } else if ('div' === nodeName || 'li' === nodeName) {
                    return;
                }
                if ( - 1 != target.parentNode.className.indexOf('menu_dis')) {
                    return;
                }
                var child = $('.map_menu_con a');
                child.each(function(i, a) {
                    a.className = '';
                });
                target.className = 'current';
                mapFilter.hide();
                var typeid = target.getAttribute('typeid');
                if (typeid) {
                    Class.View.ClickedType = typeid;
                    Class.View.showTypeMapList(typeid);
                    return;
                }
                var line = target.getAttribute('linetype');
                if (line) {
                    var index = map.scenicJSON.lines.length > 0 ? 0 : null;
                    if (null === index) {
                        return;
                    }
                    Class.View.ClickedLineIndex = index;
                    var oneLine = map.scenicJSON.lines[index];
                    Class.Geo.posInLine = false;
                    map.showOneLine(oneLine);
                    Class.View.showOneLineList(oneLine);
                    return;
                }
            });
        },
        initClickPopup: function(evt) {
            var tar = evt.target;
            switch (tar.className) {
            case 'ico_show':
                $('.ico_show').hide();
                $('.ico_hide').show();
                $(tar).parents('.point_detail').children('.bd').show();
                Class.View.fitPopUp();
                break;
            case 'ico_hide':
                $('.ico_show').show();
                $('.ico_hide').hide();
                $(tar).parents('.point_detail').children('.bd').hide();
                Class.View.fitPopUp();
                break;
            case 'ico_photo':
            case 'ico_photo_a':
                if (! ($(tar).parents('div').hasClass('disabled'))) {
                    Class.Event.initGalary(win.onespot['imglist']);
                }
                break;
            case 'ico_here':
            case 'ico_here_a':
                map.goHere(win.onespot);
                break;
            case 'ico_voice_a':
            case 'ico_voice':
            case 'ico_voice_pause':
            case 'ico_voice_txt':
                var pdiv = $(tar).parents('div[audiourl]');
                if (! (pdiv.hasClass('disabled'))) {
                    win.player = win.player ? win.player: new Class.AudioPlayer();
                    var tar = pdiv.children('a');
                    if (typeof win.player.preAudioUrl != 'undefined' && win.player.preAudioUrl != pdiv.attr('audiourl')) {
                        win.player.reset();
                    }
                    if (typeof win.player.playing != 'undefined' && true == win.player.playing) {
                        player.pause();
                        win.player.playing = false;
                    } else {
                        if (win.player.loaded === true) {
                            win.player.play();
                        }
                        else {
                            win.player.load(tar);
                        }
                        win.player.preAudioUrl = pdiv.attr('audiourl');
                        win.player.playing = true;
                    }
                }
                break;
            }
            evt.stopPropagation();
        }
    });
    Class.Event.initBackToNav();
    Class.Event.initLocationClick();
    Class.Event.initMapListChange();
    Class.Event.initMapFilterClick();
    Class.Event.clearPopUp();
    Class.Event.initOrientation();
    Class.Geo = {};
    Class.extend(Class.Geo, {
        pos: null,
        locationTimes: 0,
        posInContext: false,
        geoUrl: "http://openapi.3dyou.cn/scenic/%sceneId%/gis2scenic/%lng%,%lat%?callback=?",
        msgPoper: new Class.View.MsgPoper(),
        doorLatLngRang: {
            'lng': [114.300857, 114.3015914],
            'lat': [22.607880, 22.607163]
        },
        getPositionError: function(error) {
            var o = {
                'backgroundImage': ''
            };
            Class.Geo.pos = null;
            if (true == map.showHere) {
                Class.Geo.msgPoper.show('无法指引线路', '获取不到您的位置', null);
                map.showHere = false;
                return;
            }
            switch (error.code) {
            case error.TIMEOUT:
                Class.Geo.msgPoper.show("定位失败", '获取位置超时，请重试', o);
                break;
            case error.PERMISSION_DENIED:
                Class.Geo.msgPoper.show("定位失败", '您拒绝了定位授权', o);
                break;
            case error.POSITION_UNAVAILABLE:
                Class.Geo.msgPoper.show("定位失败", '', o);
                break;
            case error.UNKNOW_ERROR:
                Class.Geo.msgPoper.show("定位失败", '', o);
                break;
            }
        },
        getPositionSuccess: function(position) {
            var that = this;
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            if (Class.Geo.doorLatLngRang.lng[0] > lng && Class.Geo.doorLatLngRang.lng[1] < lng && Class.Geo.doorLatLngRang.lat[0] > lat && Class.Geo.doorLatLngRang.lat[1] < lat) {
                var ret = win.confirm('是否使用门口定位？');
                if (true == ret) {
                    lat = 22.605121;
                    lng = 114.305671;
                }
            }
            Class.Geo.pos = {
                "lat": lat,
                "lng": lng
            };
            Class.Geo.msgPoper.hide();
            Class.Geo.showPosContext(lat, lng);
        },
        getMyPostion: function() {
            var that = this;
            var position_option = {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 40000
            };
            Class.Geo.pos = undefined;
            var o = {
                'closeTime': position_option.timeout
            };
            Class.Geo.msgPoper.show('正在获取您的位置......', '', o);
            navigator.geolocation.getCurrentPosition(Class.Geo.getPositionSuccess, Class.Geo.getPositionError, position_option);
        },
        getMyPosJson: function() {
            if (Class.Geo.xy == undefined) {
                return false;
            }
            var _d = Class.Geo.xy;
            var pos = {
                "id": "20405000",
                "scenicId": "",
                "uid": "211",
                "name": "我的位置",
                "wanted": "0",
                "visited": "0",
                "star": "4",
                "img": "",
                "status": "1",
                "cTime": "1362379410",
                "uTime": "0",
                "body": "我的位置",
                "sortid": "0",
                "locationType": "navigation",
                "locationData": {
                    "x": _d.x,
                    "y": _d.y,
                    "lat": 0,
                    "lng": 0
                },
                "modelData": {
                    "url": "",
                    "tags": ""
                },
                "pid": "0",
                "imgurl": "",
                "tags": [{
                    "tag_id": "mypos",
                    "tag_name": ""
                }],
                "index": 'here'
            };
            return pos;
        },
        watchMyPosition: function() {
            var that = this;
            Class.Geo.watchid = navigator.geolocation.watchPosition(function(pos) {
                that.locationTimes = 1;
                that.showPosContext(pos.coords.latitude, pos.coords.longitude);
            },
            Class.Geo.getPositionError, {
                maximumAge: 20000
            });
        },
        showPosContext: function(lat, lng, callback) {
            callback = callback || null;
            var that = this;
            if (!Class.Geo.pos) {
                return;
            }
            var lng = Class.Geo.pos.lng;
            var lat = Class.Geo.pos.lat;
            var geo_url = Class.Geo.geoUrl.replace('%sceneId%', map.sceneId).replace('%lng%', lng).replace('%lat%', lat);
            geo_url += "&_t=" + (new Date().getTime());
            $.getJSON(geo_url,
            function(data) {
                var _d = data;
                Class.Geo.xy = _d;
                if (0 == _d.x && 0 == _d.y) {
                    if (typeof Class.Geo.locationTimes != 'undefined' && Class.Geo.locationTimes <= 1) {
                        Class.Geo.locationTimes++;
                    }
                    Class.Geo.pos = null;
                    that.posInContext = false;
                    if (true == map.showHere) {
                        Class.Geo.msgPoper.show('无法指引线路', '您不在景区范围内', null);
                        map.showHere = false;
                    }
                    else {
                        Class.Geo.msgPoper.show('定位失败', '您的位置不在景区内', null);
                    }
                    return;
                }
                var _mypos = that.getMyPosJson(_d);
                that.posInContext = true;
                map.selectSpotFlag = true;
                map.setCenterSpot(_mypos);
                Class.MapContext.resolve(map, null, true);
                var initDistanceObj = Class.OpenContext.length() > 0 ? Class.OpenContext.get(0) : null;
                switch (initDistanceObj.key) {
                case 'line':
                    Class.View.showOneLineList(initDistanceObj.value);
                    break;
                case 'typespots':
                    Class.View.showTypeList(initDistanceObj.value);
                    break;
                default:
                    break;
                }
                if (Class.isFunction(callback)) {
                    callback();
                }
            });
        }
    });
    Class.extend({
        cache:
        {},
        template: function(str, data) {
            var fn = null;
            if (!/\W/.test(str)) {
                Class.cache[str] = Class.cache[str] || Class.template(document.getElementById(str).innerHTML);
                fn = Class.cache[str];
            } else {
                var fun_str = "var p=[],print=function(){p.push.apply(p,arguments);};" + "with(obj){p.push('" + str.replace(/[\r\t\n]/g, " ").split("<%").join("\t").replace(/((^|%>)[^\t]*)'/g, "$1\r").replace(/\t=(.*?)%>/g, "',$1,'").split("\t").join("');").split("%>").join("p.push('").split("\r").join("\\'") + "');}return p.join('');";
                fn = new Function("obj", fun_str);
            }
            return data ? fn(data) : fn;
        }
    });
    var map = new Class.Map();
    Class.View.showInitedSpot();
    if (win.$ == undefined) {
        win.$ = win.Flip = Class;
    }
    else {
        Class.$ = win.$;
        win.Flip = Class;
    }
})(window);