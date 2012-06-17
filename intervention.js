//
//= require_self
//


function logIt() {
    console.log('ok');

}

(function ($) {
    var plugin_name = "intervention";
    var version = "0.0.1.alpha.1";

    var private_methods = {

        init:function (options) {


            var opts = options;

            $.getJSON("http://query.yahooapis.com/v1/public/yql",
                    {
                        q:"select * from json where url=" +
                            "\"http://truenorth.github.com/intervention/javascripts/browser_data.json\"",
                        format:"json"
                    },
                    function (data, request_status, xhr) {
                        if (data.query.results) {
                            setData('browserdata',data.query.results.browsers);
                            private_methods.run_tests(opts);
                        } else {
                            console.error('Problem accessing heroku status information');
                        }
                    }
                );
        },

        run_tests: function(options) {
            for(var i in options.requirements) {
                var requirement = options.requirements[i];
                if(!private_methods.run_test(requirement)) {
                    console.log("failed test - "+requirement);
                    public_methods.show();
                }
            }
        },
        run_test: function(test) {
            switch(test) {
                case "fontface":
                    return Modernizr.fontface;
                    break;
                case "canvas":
                    return Modernizr.canvas;
                    break;
                case "cssgradients":
                    return Modernizr.cssgradients;
                    break;
                case "opacity":
                    return Modernizr.opacity;
                    break;
                default: throw "no test for \""+test+"\"";
            }
        },

        is_modernizr_ok:function (options) {
            if (typeof Modernizr == "undefined") {
                console.warn("You should include your own custom build of Modernizr. The development-only version from the Microsoft CDN will be used automatically for now");
                return false;
            }
            return true;
        },
        check_modernizr_and_init:function (options) {
            //Check for presence of Modernizr
            if (!private_methods.is_modernizr_ok(options)) {
                var script_tag = document.createElement('script');
                script_tag.setAttribute("type", "text/javascript");
                script_tag.setAttribute("src", "http://ajax.aspnetcdn.com/ajax/modernizr/modernizr-2.0.6-development-only.js");
                script_tag.onload = private_methods.init(options); // Run ka.init() once jQuery has loaded
                script_tag.onreadystatechange = function () { // Same thing but for IE
                    if (this.readyState == 'complete' || this.readyState == 'loaded') private_methods.init(options);
                }
                document.getElementsByTagName("head")[0].appendChild(script_tag);
            } else {
                private_methods.init(options);
            }
        }
    };

    var getData = function (key, default_value) {
        var dat = $(window).data(plugin_name);
        if (dat == undefined) {
            dat = {};
            dat[key] = default_value;
            $(window).data(plugin_name, dat);
            return default_value;
        } else {
            var val = dat[key];
            if (val == undefined) {
                dat[key] = default_value;
                $(window).data(plugin_name, dat);
                return default_value;
            } else {
                return val;
            }
        }
    }
    var setData = function (key, value) {
        var dat = $(window).data(plugin_name);
        if (dat == undefined) {
            dat = {};
            dat[key] = value;
            $(window).data(plugin_name, dat);
            return true;
        } else {
            var old = dat[key];
            if (old == value) {
                return false;
            } else {
                dat[key] = value;
                $(window).data(plugin_name, dat);
                return true;
            }
        }
    }

    var public_methods = {
        version:function () {
            return version;
        },
        getEnv:function () {
            return getData('env', "development");
        },
        setEnv:function (env) {
            if (typeof env == "string") {
                if (env != "production" && env != "development") {
                    throw 'Environment can only have values of \"development\" or \"production\"';
                } else {
                    return setData('env', env);
                }
            }
        },

        show: function() {

            var chrome_logo = "http://truenorth.github.com/intervention/images/chrome-logo.png";
            var safari_logo = "http://truenorth.github.com/intervention/images/safari-logo.png"

            $('body').prepend("<div id=\"intervention-browser-upgrade-prompt\" style='display:none'><!-- Intervention --></div>");

            $("#intervention-browser-upgrade-prompt").append("<div class='intervention-message'>Your browser is out of date. Please upgrade it</div>");

            var chrome_section = document.createElement('div');
            $(chrome_section).addClass('intervention-section');
            $(chrome_section).addClass('chrome');
            $(chrome_section).append("<img class='browser-logo' src='"+chrome_logo+"'></img>");
            $(chrome_section).append("<div class='title'>Get Chrome</div>");


            var safari_section = document.createElement('div');
            $(safari_section).addClass('intervention-section');
            $(safari_section).addClass('safari');
            $(safari_section).append("<img class='browser-logo' src='"+safari_logo+"'></img>");
            $(safari_section).append("<div class='title'>Get Safari</div>");

            $("#intervention-browser-upgrade-prompt").append("<a class=\"intervention-chrome-link\" href='https://www.google.com/chrome/eula.html'></a>");
            $("#intervention-browser-upgrade-prompt").find('.intervention-chrome-link').append(chrome_section);

            $("#intervention-browser-upgrade-prompt").append("<a class=\"intervention-safari-link\" href='http://www.apple.com/safari/download/'></a>");
            $("#intervention-browser-upgrade-prompt").find('.intervention-safari-link').append(safari_section);

            $("#intervention-browser-upgrade-prompt").append("<a class=\"intervention-close-link\" href='#'>&times;</a>");
            $("#intervention-browser-upgrade-prompt").find('.intervention-close-link').bind('click',function(){
                $("#intervention-browser-upgrade-prompt").slideUp('fast',function(){
                    $("body").removeClass('intervention-active');
                });
            });

            $("body").addClass('intervention-active');
            $("#intervention-browser-upgrade-prompt").slideDown('slow');
        }

    };

    $.fn.intervention = function (method) {

        if (public_methods[method]) {
            return public_methods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if ((typeof method === 'object' || !method) && this.selector == "") {
            var args = Array.prototype.slice.call(arguments, 0);
            var settings = $.extend($.fn.intervention.default_options, args[0]);
            return private_methods.check_modernizr_and_init.apply(this, [settings]);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.intervention');
        }
    };

    $.fn.intervention.default_options = {
        requirements: ['fontface','canvas','cssgradients']
    }
})(jQuery);
