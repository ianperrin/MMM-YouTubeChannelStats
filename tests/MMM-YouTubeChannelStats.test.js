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
	describe("getOrMakeArray", function () {
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
	describe("paginate", function () {
		const arrays = [["ch1"], ["ch1", "ch2"], ["ch1", "ch2", "ch3"], ["ch1", "ch2", "ch3", "ch4"], ["ch1", "ch2", "ch3", "ch4", "ch5"], ["ch1", "ch2", "ch3", "ch4", "ch5", "ch6"], ["ch1", "ch2", "ch3", "ch4", "ch5", "ch6", "ch7"]];
		arrays.forEach((array) => {
			describe(`for [${array}]`, function () {
				[1, 2, 3, 4, 5, 6].forEach((perPage) => {
					it(`using ${perPage} per page, page 1 should return [${array.slice(0, perPage)}]`, function () {
						expect(Module.definitions[moduleName].paginate(array, 1, perPage).items).to.eql(array.slice(0, perPage));
					});
				});
			});
		});
	});
	describe("toMetric", function () {
		const numbers = {
			"-12": { return: "-12" },
			0: { return: "0" },
			1: { return: "1" },
			12: { return: "12" },
			123: { return: "123" },
			1234: { return: "1.23K" },
			12345: { return: "12.3K" },
			123456: { return: "123K" },
			1234567: { return: "1.23M" },
			12345678: { return: "12.3M" },
			123456789: { return: "123M" },
			1230: { return: "1.23K" },
			12300: { return: "12.3K" },
			123000: { return: "123K" },
			1230000: { return: "1.23M" },
			12300000: { return: "12.3M" },
			123000000: { return: "123M" }
		};
		Object.keys(numbers).forEach((num) => {
			it(`for '${num}' should return [${numbers[num].return}]`, function () {
				expect(Module.definitions[moduleName].toMetric(num)).to.eql(numbers[num].return);
			});
		});
	});
});
