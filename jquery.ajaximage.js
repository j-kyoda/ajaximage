/*
 * jQuery ajaximage v0.5
 * http://makealone.jp/products/jquery.ajaximage/
 *
 * Copyright 2014, makealone.jp
 * Free to use and abuse under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

(function($) {
    $.fn.ajaximage = function(options) {
        var undefined;

        // options

        // settings
        var defaults = {};

        // environment

        // define

        // functions
        function to_binary(bytes) {
            var binary = "";
            for (var i = 0; i < bytes.length; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return binary;
        }

        function get_tail(binary, len) {
            var tail = "";
            for (var i = 0; i < len; i++) {
                tail += binary[binary.length - len + i];
            }
            return tail;
        }

        function get_head(binary, len) {
            var head = "";
            for (var i = 0; i < len; i++) {
                head += binary[i];
            }
            return head;
        }

        function get_mime(binary) {
            if (get_head(binary, 4) === to_binary([0x89, 0x50, 0x4e, 0x47])) {
                return "image/png";
            }
            if (get_head(binary, 2) === to_binary([0xff, 0xd8]) &&
                get_tail(binary, 2) === to_binary([0xff, 0xd9])) {
                return "image/jpeg";
            }
            if (get_head(binary, 4) === to_binary([0x47, 0x49, 0x46, 0x38])) {
                return "image/gif";
            }
            if (get_head(binary, 2) === to_binary([0x42, 0x4d])) {
                return "image/bmp";
            }
            return "image/unknown";
        }

        function get_image(self, change_url) {
            var image_url = "";

            if (change_url === undefined) {
                var original_src = self.data("original_src");
                console.log("original_src: " + original_src);
                if (original_src === undefined) {
                    image_url = self.attr("src");
                    console.log("image_url: " + image_url);
                    self.data("original_src", image_url);
                    self.attr("src", "");
                } else {
                    image_url = original_src;
                }
            } else {
                console.log("change_url: " + change_url);
                image_url = change_url;
                self.data("original_src", change_url);
            }

            var now = new Date();
            var serial = now.getTime();
            console.log(serial);

            $.ajax({
                url: image_url,
                type: "POST",
                data: {"serial": serial},
                dataType: "binary",
                beforeSend: function (xhr) {
                    xhr.overrideMimeType("text/plain; charset=x-user-defined");
                },
                converters: {"* binary":
                             function(response) {
                                 var bytes = [];
                                 var adjustedResponse = "";
                                 for (var i = 0; i < response.length; i++) {
                                     bytes[i] = response.charCodeAt(i) & 0xff;
                                     adjustedResponse += String.fromCharCode(bytes[i]);
                                 }
                                 return adjustedResponse;
                             }
                            },
                success: function(response) {
                    var mime = get_mime(response);
                    var src = "data:" + mime + ";" + "base64," + btoa(response);
                    self.attr("src", src);
                },
                error: function (xhr, status, res) {
                    console.log('error: ' + status + ":" + res);
                }
            });
        }

        // containes all method
        var methods = {
            create: function() {
                return this.each(function(i) {
                    var self = $(this);
                    get_image(self);
                });
            },
            change: function(url) {
                return this.each(function(i) {
                    var self = $(this);
                    get_image(self, url);
                });
            }
        };

        // do
        if (methods[options]) {
            return methods[options].apply( this, Array.prototype.slice.call(arguments, 1));
        } else {
            return methods.create.apply(this);
        }
    };

})(jQuery);
