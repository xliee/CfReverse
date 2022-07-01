"use strict";
exports.__esModule = true;
var deobfuscator_1 = require("./deobfuscator");
var fs_1 = require("fs");
var src = fs_1["default"].readFileSync('input/main_challenge.js').toString();
var session = new deobfuscator_1.Deobfusactor(src);
fs_1["default"].writeFileSync("output.js", session.deobfuscateMainChallenge());
