/* jshint node:true */
/* this goes in your project directory */
var config = {};

config.style = {
    "in": "scss/main.scss",
    "out": "../wwwroot/app/css/main.css"
};

config.sassIncludes = ["vendor/foundation-sites/scss",
		       "vendor/ballon-css/src"

		      ];

// use the same keys used by BrowserSync!!!1
config.BS = {};

config.BS.proxy = "http://eliotsela.eliotsela.com.dev";
config.BS.tunnel = "eliotsela";



config.BS.files = ["../wwwroot/app/css/*.css",
		   "../elisel3/views/**/*.php",
		   "../elisel3/includes/**/*.php"
		  ];


module.exports = config;
