'use strict';

// serialize params object to ?a=1&b=2
var serialize = function serialize(params) {
    if (params && params.constructor === Object) {
        if (Object.getOwnPropertyNames(params).length === 0) {
            return '';
        }
        return Object.keys(params).reduce(function (prev, current, index) {
            if (index === 0) {
                return '' + prev + current + '=' + params[current];
            }
            return prev + '&' + current + '=' + params[current];
        }, '?');
    }
    return '';
};

var xhr = function xhr(options) {
    if (typeof XMLHttpRequest === 'undefined') {
        return;
    }

    options = options || {};
    if (!options.file) return;

    var headers = options.headers || {};
    if (!options.url || options.url.constructor !== String) {
        return;
    }

    var sendData = new FormData();

    if (options.data && options.data.constructor === Object) {
        (function () {
            var _data = options.data;
            Object.keys(_data).map(function (key) {
                if (_data.hasOwnProperty(key)) {
                    sendData.append(key, _data[key]);
                }
            });
        })();
    }

    sendData.append(options.file.name, options.file);

    var _xhr = new XMLHttpRequest();
    _xhr.open('POST', options.url, true);

    var _options = options;
    var onError = _options.onError;
    var onSuccess = _options.onSuccess;
    var onProgress = _options.onProgress;


    _xhr.onload = function (e) {
        if (_xhr.readyState === 4) {
            if (_xhr.status >= 200 && _xhr.status < 300) {
                if (onSuccess && onSuccess.constructor === Function) {
                    onSuccess(_xhr.responseText, _xhr.status);
                }
                return;
            }
            if (onError && onError.constructor === Function) {
                return onError(_xhr, _xhr.status);
            }
        }
    };

    _xhr.onerror = function () {
        if (onError && onError.constructor === Function) {
            return onError(_xhr, _xhr.status);
        }
    };

    if (_xhr.upload) {
        _xhr.upload.onprogress = function (e) {
            if (e.lengthComputable && onProgress && onProgress.constructor === Function) {
                return onProgress(e.loaded, e.total);
            }
        };
    }

    Object.keys(headers).map(function (key) {
        if (headers.hasOwnProperty(key)) {
            _xhr.setRequestHeader(key, headers[key]);
        }
    });

    if (!headers['Content-Type']) {
        _xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
    }
    if (!headers['X-Requested-With']) {
        _xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    }
    if (!options.credentials) {
        _xhr.withCredentials = true;
    }

    _xhr.send(sendData);
};

module.exports = xhr;