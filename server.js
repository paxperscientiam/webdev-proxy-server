/* jshint node:true,esversion:6 */
"use strict";
//
// builtin
const path = require('path');
const fs = require('fs');

//configuration file
const config = req("../server-config.js");


req('es6-promise').polyfill();

const extend = req('extend');
const bs = req("browser-sync").create();


const postcss = req('postcss'),
      prefixer = req('autoprefixer'),
      cssnano = req('cssnano'),
      unprefixer = req('postcss-unprefix'),
      sass = req("node-sass"),
      term = req( 'terminal-kit' ).terminal
;
// in:main.scss => out:main.css
const style = config.style;

const sassIncludes = config.sassIncludes;


const bsConfig = extend(true,{
    //chokidar options
    watchOptions: {
	awaitWriteFinish: {
	    stabilityThreshold: 700,
	    pollInterval: 100
	}
    },
    injectChanges: true,
    online:true,
    ui:false,
    open: "local",
    external: "true",
    logLevel: "debug",
    reloadOnRestart: false,
    ghostMode: false
},config.BS);
//
const sassConfig = {
    file: style.in,
    includePaths: sassIncludes
};
//
const post = {
    "autoprefixer": {
	"browsers": ">5%"
    },
    "cssnano": {
	"calc":true,
	"colormin":true,
	"discardComments": {
	    "removeAll": true
	},
	"discardEmpty": true,
	"discardDuplicates":true,
	"discardOverridden":true,
	"normalizeCharset": true,
	"mergeLonghand": true,
	"mergeRules":true,
	"minifyFontValues":true,
	"minifyParams":true,
	"orderedValues":true,
	"uniqueSelectors":true,
	"safe":true
    }
};

//
// //
// Listen for the `init` event
bs.emitter
    .on("init", function () {
	term.red("Server initiated.\n");
	//buildCSS();
    });


bs.watch("./scss/*.scss", function (event, file) {
    term("[").blue("BS")("] ")(file + " changed.\n");
})
    .on("change", function () {
	buildCSS();
    });

// let's do this
bs.init(bsConfig);
//
//
//
function buildCSS() {
    sass.render(sassConfig, function(err,result) {
	//
	if(!err){
	    postcss([
		unprefixer,
		prefixer(post.autoprefixer),
		cssnano(post.cssnano)
	    ])
		.process(result.css.toString())
		.then(function (result) {

		    fs.writeFileSync(style.out,result.css);
		});
	} else {
	    term.red.error(err.message+'\n');
	}
    });
}

function req(module) {
    return require(path.join(process.cwd(),"/node_modules/",module));
}
