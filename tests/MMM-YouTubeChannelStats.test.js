const chai = require("chai");
const expect = require("chai").expect;
const chaiAsPromised = require("chai-as-promised");
const sinon = require("sinon");
const moduleAlias = require("module-alias");
moduleAlias.addAliases({ logger: "../../../js/logger.js" });
global.Log = require("logger");
global.fetch = require("node-fetch");
const moduleName = "MMM-YouTubeChannelStats";

describe(`Functions in ${moduleName}.js`, function () {
	Module = {};
	const channelIds = {
		channelid1: { return: ["channelid1"] },
		"channelid1,channelid2": { return: ["channelid1", "channelid2"] },
		"channelid1, channelid2": { return: ["channelid1", "channelid2"] }
	};
	before(function () {
		Module.definitions = {};
		Module.register = function (name, moduleDefinition) {
			Module.definitions[name] = moduleDefinition;
		};
		require(`../${moduleName}.js`);
		Module.definitions[moduleName].name = moduleName;
		Module.definitions[moduleName].identifier = "module_1_" + moduleName;
		Module.definitions[moduleName].nunjucksEnvironment = function () {
			return { addFilter: function () {} };
		};
		Module.definitions[moduleName].updateDom = function () {};
		Module.clock = sinon.useFakeTimers(Date.now());
		chai.use(chaiAsPromised);
	});
	after(function () {
		Module.clock = sinon.restore();
	});
	describe("start", function () {
		let moduleConfig = {};
		before(function () {
			Module.definitions[moduleName].config = Module.definitions[moduleName].defaults;
		});
		describe("for default config", function () {
			before(function () {
				Module.definitions[moduleName].start();
				moduleConfig = Module.definitions[moduleName].config;
				Module.clock.tick(moduleConfig.fetchInterval + 1);
			});
			it("channelIds should be an array with a length of 0", function () {
				expect(moduleConfig.channelIds).to.be.an("array").with.a.lengthOf(0);
			});
			it("stats should be an array with a length of 2", function () {
				expect(moduleConfig.stats).to.be.an("array").with.a.lengthOf(3);
			});
			it("enableRotate should be false", function () {
				expect(moduleConfig.enableRotate).to.be.false;
			});
		});
		describe("for custom config", function () {
			before(function () {
				Module.definitions[moduleName].config.channelIds = Object.keys(channelIds)[1];
				Module.definitions[moduleName].config.maximumChannels = 1;
				Module.definitions[moduleName].start();
				moduleConfig = Module.definitions[moduleName].config;
				Module.clock.tick(moduleConfig.fetchInterval);
			});
			it("channelIds should be an array with a length of 2", function () {
				expect(moduleConfig.channelIds).to.be.an("array").that.has.a.lengthOf(2);
			});
			it("stats should be an array with a length of 2", function () {
				expect(Module.definitions[moduleName].config.stats).to.be.an("array").that.has.a.lengthOf(3);
			});
			it("enableRotate should be true", function () {
				expect(moduleConfig.enableRotate).to.be.true;
			});
		});
	});
	describe("getStyles", function () {
		it("to register font-awesome and custom css", function () {
			expect(Module.definitions[moduleName].getStyles()).to.eql(["font-awesome.css", "MMM-YouTubeChannelStats.css"]);
		});
	});
	describe("getTemplate", function () {
		it("to return custom njk template", function () {
			expect(Module.definitions[moduleName].getTemplate()).to.equal("templates\\statistics.njk");
		});
	});
	describe("getTemplateData", function () {
		let templateData = {};
		before(function () {
			Module.definitions[moduleName].data = { position: "top_right" };
			templateData = Module.definitions[moduleName].getTemplateData();
		});
		it("for object to have expected keys", function () {
			expect(templateData).to.have.keys(["channelsList", "config", "position"]);
		});
		it("for 'position' to equal 'right'", function () {
			expect(templateData.position).to.equal("right");
		});
		it("for 'config' to equal module config", function () {
			expect(templateData.config).to.eql(Module.definitions[moduleName].config);
		});
	});
	describe("getTranslations", function () {
		let translations = {};
		let translationFiles = [];
		before(function () {
			const { readdirSync } = require("fs");
			const { join } = require("path");
			translationFiles = readdirSync(join(__dirname, "..", "translations"));
			translations = Module.definitions[moduleName].getTranslations();
		});

		it(`to have translation keys with matching translation file`, function () {
			const expectedKeysForTranslationFiles = translationFiles.map((translationFile) => translationFile.split(".")[0]);
			expect(translations).to.have.keys(expectedKeysForTranslationFiles);
		});
		it(`to have translation files for each translation key`, async function () {
			const expectedFilesForTranslationKeys = Object.keys(translations).map((translationKey) => translations[translationKey].split("/")[1]);
			expect(translationFiles).to.have.members(expectedFilesForTranslationKeys);
		});
	});
	describe("fetchData", function () {
		it(`for missing 'apiKey' to be undefined`, function () {
			Module.definitions[moduleName].config.apiKey = "";
			expect(Module.definitions[moduleName].fetchData()).to.be.undefined;
		});
		it(`for invalid 'apiKey' to be undefined`, function () {
			Module.definitions[moduleName].config.apiKey = "blah";
			//			expect(Module.definitions[moduleName].fetchData()).to.eventually.be.undefined;
		});
	});
	describe("getParams", function () {
		Object.keys(channelIds).forEach((channelId) => {
			it(`for '${channelId}' params contains '${channelId.replace(" ", "")}'`, function () {
				Module.definitions[moduleName].config.channelIds = channelIds[channelId].return;
				expect(Module.definitions[moduleName].getParams()).contains("?id=" + channelId.replace(" ", ""));
			});
		});
	});
	describe("processData", function () {
		it(`for 'valid responses' should set 'channelsList'`, function () {
			const validResponse = {
				status: 200,
				json: function () {
					return { items: ["channel1", "channel2"] };
				}
			};
			Module.definitions[moduleName].config.enableRotate = false;
			Module.definitions[moduleName].processData(validResponse.json());
			expect(Module.definitions[moduleName].channelsList).to.eql(validResponse.json().items);
		});
		it(`for 'valid responses' with rotation should set 'channelsList' and 'currentChannelList'`, function () {
			const validResponse = {
				status: 200,
				json: function () {
					return { items: ["channel1", "channel2"] };
				}
			};
			Module.definitions[moduleName].config.enableRotate = true;
			Module.definitions[moduleName].config.maximumChannels = 1;
			Module.definitions[moduleName].processData(validResponse.json());
			Module.clock.tick(Module.definitions[moduleName].config.rotateInterval);
			expect(Module.definitions[moduleName].channelsList).to.eql(validResponse.json().items);
			expect(Module.definitions[moduleName].currentChannelList.items).to.eql(validResponse.json().items.slice(1));
		});
		it(`for 'badRequest' should throw error`, function () {
			const badRequest = {
				status: 403,
				json: function () {
					return { error: { message: "badRequest" } };
				}
			};
			expect(() => Module.definitions[moduleName].processData(badRequest.json())).to.throw("Unable to process data: badRequest");
		});
	});
	describe("paginateData", function () {
		const arrays = [["ch1"], ["ch1", "ch2"], ["ch1", "ch2", "ch3"], ["ch1", "ch2", "ch3", "ch4"], ["ch1", "ch2", "ch3", "ch4", "ch5"], ["ch1", "ch2", "ch3", "ch4", "ch5", "ch6"], ["ch1", "ch2", "ch3", "ch4", "ch5", "ch6", "ch7"]];
		arrays.forEach((array) => {
			describe(`for [${array}]`, function () {
				[1, 2, 3, 4, 5, 6].forEach((perPage) => {
					it(`using ${perPage} per page, page 1 should return [${array.slice(0, perPage)}]`, function () {
						expect(Module.definitions[moduleName].paginateData(array, 1, perPage).items).to.eql(array.slice(0, perPage));
					});
				});
			});
		});
	});
	describe("getOrMakeArray", function () {
		describe("when the input is a string", function () {
			it(`for '' should return an array with a length of 0`, function () {
				expect(Module.definitions[moduleName].getOrMakeArray("")).to.be.an("array").with.a.lengthOf(0);
			});
			Object.keys(channelIds).forEach((channelId) => {
				it(`for '${channelId}' should return [${channelIds[channelId].return}]`, function () {
					expect(Module.definitions[moduleName].getOrMakeArray(channelId)).to.eql(channelIds[channelId].return);
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
