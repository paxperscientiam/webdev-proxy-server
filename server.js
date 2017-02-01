/* jshint node:true,esversion:6 */
"use strict";
//
// builtin
const path = require('path');
const fs = require('fs');

//configuration file
const config = req("../server-config.js");


require('es6-promise').polyfill();

const extend = require('extend');
const bs = require("browser-sync").create();

const program = require('commander');

// process command line arguments
program
    .version('0.6')
    .option('-t, --tunnel', 'Make America Online Again!')
    .option('-o, --online', 'Make available over network.')
    .option('-l, --local', "Run only on this machine.",{isDefault:true,noHelp:true})
    .parse(process.argv);


var network = {};
network.online = false;
network.tunnel = false;
network.open = "local";


if (program.tunnel) {
    network.tunnel = true;
    network.online = true;
    network.open = "tunnel";
} else if (program.online) {
    network.online = true;
    network.open = "external";
} else {
    network.open = "local";
}


program.on('--help', function(){
    console.log('Example help dialog.');
});


if (network.tunnel) console.log("User wants some internet!");


const postcss = require('postcss'),
      prefixer = require('autoprefixer'),
      // rewrite code with existing vendor prefixes for flexbox
      flexboxfixer = require('postcss-flexboxfixer'),
      cssnano = require('cssnano'),
      unprefixer = require('postcss-unprefix'),
      sass = require("node-sass"),
      term = require( 'terminal-kit' ).terminal
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
    tunnel: network.tunnel,
    online: network.online,
    ui:false,
    open: network.open,
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
	"browsers": [
	    // Major including ios
	    "> 1%",
	    "last 3 versions",
	    'Android >= 2.3',
	    'ie >= 9',
	    'ios >= 7'
	]
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
	"mergeRules": true,
	"minifyFontValues":true,
	"minifyParams": true,
	"orderedValues": true,
	"uniqueSelectors": true,
	"safe": true
    }
};

//
// //
// Listen for the `init` event
bs.emitter
    .on("init", function () {
	term.green("Server initiated.\n\n");
	term.green(sass.info + "\n\n");
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
		flexboxfixer,
		prefixer(post.autoprefixer),
		cssnano(post.cssnano)
	    ])
		.process(result.css.toString())
		.then(function (result) {

		    fs.writeFileSync(style.out,result.css);
		});
	} else {
	    term.red.error(err.message+ 'on line '+ err.line+ '\n');
	}
    });
}


setInterval(function () {

    term.blue("[")
	.red(process.pid)
	.blue("]")
	.green(" Process has been running for ")
	.red(process.uptime() + " seconds.\n\n");
//
},10000);



function req(module) {
    return require(path.join(process.cwd(),"/node_modules/",module));
}
