"use strict";
exports.__esModule = true;
exports.Deobfusactor = void 0;
var shift_ast_1 = require("shift-ast");
var shift_refactor_1 = require("shift-refactor");
var commonMethods = require('refactor-plugin-common').commonMethods;
var vm_1 = require("vm");
var Deobfusactor = /** @class */ (function () {
    function Deobfusactor(src) {
        this.$script = (0, shift_refactor_1.refactor)(src, commonMethods);
        this.vm = vm_1["default"].createContext({
            window: {}
        });
        this.concealFn = this.$script;
    }
    Deobfusactor.prototype.deobfuscateMainChallenge = function () {
        this.loadMainChallengeContext();
        this.unconcealStringsMainChallenge();
        this.unconcealStringsMainChallenge();
        this.unflattenControlFlow();
        this.unconcealChStrings();
        this.simplifyProxyFunctions();
        return this.$script.codegen()[0];
    };
    Deobfusactor.prototype.traverseCases = function (state, stateVariableProperty, caseMap, defaultCases) {
        var isStateChangeAssignment = function (n) {
            return (n.type == "ExpressionStatement" &&
                n.expression.type == "AssignmentExpression" &&
                n.expression.binding.type == "ComputedMemberAssignmentTarget" &&
                n.expression.binding.expression.type == "LiteralStringExpression" &&
                n.expression.binding.expression.value == stateVariableProperty);
        };
        var getStateChangeVal = function (n) {
            if (n.type == "ExpressionStatement" &&
                n.expression.type == "AssignmentExpression" &&
                n.expression.binding.type == "ComputedMemberAssignmentTarget" &&
                n.expression.binding.expression.type == "LiteralStringExpression" &&
                n.expression.expression.type == "LiteralStringExpression" &&
                n.expression.binding.expression.value == stateVariableProperty)
                return n.expression.expression.value;
        };
        var isChFunction = function (n) {
            return (n.type == "ExpressionStatement" &&
                n.expression.type == "CallExpression" &&
                n.expression.callee.type == "FunctionExpression" &&
                n.expression.callee.params.items[0].type == "BindingIdentifier" &&
                n.expression.callee.params.items[0].name == "chl_done");
        };
        var getChFunction = function (n) {
            if (n.type == "ExpressionStatement" &&
                n.expression.type == "CallExpression" &&
                n.expression.callee.type == "FunctionExpression" &&
                n.expression.callee.params.items[0].type == "BindingIdentifier" &&
                n.expression.callee.params.items[0].name == "chl_done") {
                return n;
            }
        };
        var getChStateChange = function (n) {
            if (n.type == "ExpressionStatement" &&
                n.expression.type == "CallExpression" &&
                n.expression.callee.type == "FunctionExpression" &&
                n.expression.callee.params.items[0].type == "BindingIdentifier" &&
                n.expression.callee.params.items[0].name == "chl_done" &&
                n.expression.arguments[0].type == "FunctionExpression") {
                for (var i = 0; i < n.expression.arguments[0].body.statements.length; i++) {
                    var statement = n.expression.arguments[0].body.statements[i];
                    if (isStateChangeAssignment(statement)) {
                        return getStateChangeVal(statement);
                    }
                }
                throw new Error("Failed to get ch state change");
            }
        };
        var statements = caseMap[state];
        if (statements == undefined) {
            return defaultCases;
        }
        var filteredStatements = [];
        for (var i = 0; i < statements.length; i++) {
            var n = statements[i];
            if (isChFunction(n)) {
                filteredStatements.push(getChFunction(n));
                var newState = getChStateChange(n);
                console.log("FOUND NEW CHL_DONE STATE CHANGE: ", newState);
                filteredStatements.push.apply(filteredStatements, this.traverseCases(newState, stateVariableProperty, caseMap, defaultCases));
                continue;
            }
            if (isStateChangeAssignment(n)) {
                state = getStateChangeVal(n);
                continue;
            }
            if (n.type != "BreakStatement" && n.type != "ReturnStatement") {
                filteredStatements.push(n);
            }
            if (n.type == "ReturnStatement") {
                return filteredStatements;
            }
            //Do something
        }
        console.log("NEW STATE VALUE: ", state);
        filteredStatements.push.apply(filteredStatements, this.traverseCases(state, stateVariableProperty, caseMap, defaultCases));
        return filteredStatements;
    };
    Deobfusactor.prototype.unconcealChStrings = function () {
        var possibleNodes = this.$script.query("CallExpression[callee.property=\"split\"]");
        var concealFns = possibleNodes.parents().parents().parents();
        for (var i = 0; i < concealFns.nodes.length; i++) {
            var stringManipulateFn = concealFns.nodes[i];
            if (stringManipulateFn.type == "BinaryExpression") {
                if (stringManipulateFn.right.type == "AssignmentExpression") {
                    var stringConcealFn = this.$script.$(stringManipulateFn);
                    vm_1["default"].runInContext(stringConcealFn.codegen()[0], this.vm);
                    var references = this.$script.$(stringManipulateFn.right).references();
                    this.replaceStringConceal(references);
                    // stringConcealFn.delete()
                }
                else if (stringManipulateFn.right.type == "FunctionExpression") {
                    var newConcealFn = this.$script.$(stringManipulateFn).parents();
                    vm_1["default"].runInContext(newConcealFn.codegen()[0], this.vm);
                    var references = newConcealFn.references();
                    this.replaceStringConceal(references);
                    // newConcealFn.delete()
                }
            }
            else {
                console.log(this.$script.$(stringManipulateFn).codegen());
            }
        }
    };
    Deobfusactor.prototype.unflattenControlFlow = function () {
        var forSwitch = this.$script.query("ForStatement[test.value=\"life goes on\"]").get(0);
        if (forSwitch.type == "ForStatement") {
            if (forSwitch.body.type == "SwitchStatementWithDefault" && forSwitch.body.discriminant.type == "ComputedMemberExpression" && forSwitch.body.discriminant.expression.type == "LiteralStringExpression") {
                var stateVariableProperty = forSwitch.body.discriminant.expression.value;
                var state = vm_1["default"].runInContext(this.$script.$(forSwitch.body.discriminant).codegen()[0], this.vm);
                var caseMap_1 = {};
                forSwitch.body.preDefaultCases.forEach(function (c) {
                    if (c.test.type == "LiteralStringExpression") {
                        caseMap_1[c.test.value] = c.consequent;
                    }
                    if (c.test.type == "IdentifierExpression") {
                        caseMap_1[c.test.name] = c.consequent;
                    }
                });
                var unflattenedFlow = this.traverseCases(state, stateVariableProperty, caseMap_1, forSwitch.body.defaultCase.consequent);
                var script = this.$script.get(0);
                if (script.type == "Script") {
                    script.statements = unflattenedFlow;
                }
            }
        }
    };
    Deobfusactor.prototype.replaceStringConceal = function (references) {
        for (var j = 0; j < references.length; j++) {
            var ref = references[j];
            if (ref.accessibility.isRead) {
                var callExpression = this.$script.$(ref.node).parents().get(0);
                var retVal = vm_1["default"].runInContext(this.$script.$(callExpression).codegen()[0], this.vm);
                this.$script.session.replace(callExpression, new shift_ast_1.LiteralStringExpression({
                    value: retVal
                }));
            }
        }
    };
    Deobfusactor.prototype.loadMainChallengeContext = function () {
        var concealFn = this.$script.$("StaticMemberAssignmentTarget[property=\"_\"]").parents().parents();
        vm_1["default"].runInContext(concealFn.codegen()[0], this.vm);
        vm_1["default"].runInContext("let _ = window._", this.vm);
    };
    Deobfusactor.prototype.unconcealStringsMainChallenge = function () {
        var $script = this.$script;
        var context = this.vm;
        this.$script.query("ComputedMemberExpression[object.name=\"_\"]").replace(function (node) {
            var retVal = vm_1["default"].runInContext($script.$(node).codegen()[0], context);
            if (retVal == undefined) {
                return node;
            }
            return new shift_ast_1.LiteralStringExpression({
                value: retVal
            });
        });
    };
    Deobfusactor.prototype.loadInitChallengeContext = function () {
        var concealFn = this.$script.$(this.$script.$("ReturnStatement[expression.right.type=\"IdentifierExpression\"][expression.left.type=\"BinaryExpression\"][expression.left.left.type=\"AssignmentExpression\"]").get(0)).parents().parents().parents();
        this.concealFn = concealFn;
        var wholeContext = concealFn.parents();
        // this.$script.session.delete(wholeContext.get(0))
        vm_1["default"].runInContext(wholeContext.codegen()[0], this.vm);
    };
    Deobfusactor.prototype.simplifyProxyFunctions = function () {
        // simplifies the following functiosn:
        // @ts-ignore
        this.$script.convertComputedToStatic();
        this.unconcealStringPropertyConceal();
        this.simplifyBinaryProxyFunctions();
        this.simplifyBinaryProxyFunctions();
    };
    Deobfusactor.prototype.simplifyBinaryProxyFunctions = function () {
        var proxyFns = this.$script.query("FunctionBody > ReturnStatement[expression.type=\"BinaryExpression\"][expression.left.type=\"IdentifierExpression\"][expression.right.type=\"IdentifierExpression\"]");
        var $script = this.$script;
        proxyFns.forEach(function (node) {
            // @ts-ignore
            var fnDefinition = $script.$(node).parents().parents().parents().get(0);
            if (node.expression && node.expression.type == "BinaryExpression" && fnDefinition.type == "AssignmentExpression" && fnDefinition.expression.type == "FunctionExpression" && fnDefinition.expression.params.items[0].type == "BindingIdentifier") {
                // if left side of binary expression is first paramater
                var binaryExpression_1 = node.expression;
                if (fnDefinition.binding.type == "StaticMemberAssignmentTarget") {
                    if (binaryExpression_1.left.type == "IdentifierExpression") {
                        if (binaryExpression_1.left.name == fnDefinition.expression.params.items[0].name && binaryExpression_1.left.name == fnDefinition.expression.params.items[0].name) {
                            $script.query("CallExpression[callee.property=\"".concat(fnDefinition.binding.property, "\"]")).forEach(function (node) {
                                if (node.arguments[0].type != "SpreadElement" && node.arguments[1].type != "SpreadElement") {
                                    // console.log($script.$(node).codegen())
                                    var arg1 = node.arguments[0];
                                    var arg2 = node.arguments[1];
                                    // @ts-ignore
                                    $script.session.replace(node, new shift_ast_1.BinaryExpression({
                                        left: arg1,
                                        right: arg2,
                                        operator: binaryExpression_1.operator
                                    }));
                                }
                            });
                        }
                    }
                }
            }
        });
    };
    Deobfusactor.prototype.unconcealStringPropertyConceal = function () {
        var propertyConceals = this.$script.query("AssignmentExpression[binding.type=\"StaticMemberAssignmentTarget\"][binding.object.type=\"IdentifierExpression\"][expression.type=\"LiteralStringExpression\"]");
        var $script = this.$script;
        propertyConceals.forEach(function (node) {
            if (node.binding.type == "StaticMemberAssignmentTarget") {
                $script.query("StaticMemberExpression[property=\"".concat(node.binding.property, "\"]")).replace(
                // @ts-ignore
                node.expression);
            }
            // $script.session.delete(node)
        });
    };
    return Deobfusactor;
}());
exports.Deobfusactor = Deobfusactor;
