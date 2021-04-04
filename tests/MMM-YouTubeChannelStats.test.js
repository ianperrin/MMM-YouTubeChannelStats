const expect = require("chai").expect;
const moduleName = "MMM-YouTubeChannelStats";

describe(`Functions in ${moduleName}.js`, function () {
	Module = {};
	Module.definitions = {};
	Module.register = function (name, moduleDefinition) {
		Module.definitions[name] = moduleDefinition;
	};
	before(function () {
		require(`../${moduleName}.js`);
	});
	describe("when the input is a string", function () {
		const strings = {
			channelid1: { return: ["channelid1"] },
			"channelid1,channelid2": { return: ["channelid1", "channelid2"] },
			"channelid1, channelid2": { return: ["channelid1", "channelid2"] }
		};
		Object.keys(strings).forEach((string) => {
			it(`for '${string}' should return [${strings[string].return}]`, function () {
				expect(Module.definitions[moduleName].getOrMakeArray(string)).to.eql(strings[string].return);
			});
		});
	});
	describe("when the input is an array", function () {
		const arrays = [["channelid1"], ["channelid1", "channelid2"], [1, "channelid2"]];
		arrays.forEach((array) => {
			it(`for [${array}] should return itself`, function () {
				expect(Module.definitions[moduleName].getOrMakeArray(array)).to.eql(array);
			});
		});
	});
});
