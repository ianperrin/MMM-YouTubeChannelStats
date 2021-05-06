Module.register("MMM-YouTubeChannelStats", {
	// Default module config.
	defaults: {
		channelIds: "",
		apiKey: "",
		stats: ["views", "subscribers", "videos"], // possible values "views", "comments", "subscribers", "videos"
		showLabels: true,
		showChannelThumbnail: true,
		grayscale: true,
		maximumChannels: 0,
		fetchInterval: 3600 * 1000, // 1 hour
		rotateInterval: 10 * 1000, // 10 seconds
		animationSpeed: 2.5 * 1000, // 2.5 seconds
		apiBase: "https://www.googleapis.com/youtube/",
		apiVersion: "v3",
		apiEndpoint: "channels"
	},
	start: function () {
		Log.info("Starting module: " + this.name);
		// Validate config
		this.config.channelIds = this.getOrMakeArray(this.config.channelIds || this.config.channelId);
		this.config.stats = this.config.stats.map((stat) => stat.toLowerCase());
		// Enable rotation if maximumChannels is set and is greater than the number of channels
		this.config.enableRotate = this.config.maximumChannels > 0 && this.config.maximumChannels < this.config.channelIds.length;
		// Add custom nunjucks filters
		this.addFilters();
		// Schedule the update.
		this.scheduleUpdate();
	},
	getStyles: function () {
		return ["font-awesome.css", "MMM-YouTubeChannelStats.css"];
	},
	getTemplate: function () {
		return "templates\\statistics.njk";
	},
	getTemplateData: function () {
		return {
			channelsList: this.currentChannelList ? this.currentChannelList.items : this.channelsList,
			config: this.config,
			position: this.data.position.includes("_right") ? "right" : "left"
		};
	},
	getTranslations: function () {
		return {
			en: "translations/en.json",
			de: "translations/de.json",
			es: "translations/es.json",
			fr: "translations/fr.json",
			it: "translations/it.json"
		};
	},
	addFilters() {
		var env = this.nunjucksEnvironment();
		env.addFilter("toMetric", this.toMetric.bind(this));
	},
	scheduleUpdate: function () {
		// fetch data from API
		this.fetchData();
		setInterval(() => {
			this.fetchData();
		}, this.config.fetchInterval);
	},
	scheduleRotate: function () {
		// rotate data in module
		if (this.config.enableRotate) {
			this.rotationInterval = setInterval(() => {
				this.rotateData();
			}, this.config.rotateInterval);
		}
	},
	fetchData: function () {
		if (this.config.apiKey === "") {
			Log.error(this.identifier, "apiKey not set.");
			return;
		}
		clearInterval(this.rotationInterval);
		const url = this.config.apiBase + this.config.apiVersion + "/" + this.config.apiEndpoint + this.getParams();
		fetch(url)
			.then((response) => response.json())
			.then((data) => this.processData(data))
			.catch((error) => Log.error(this.identifier, "Error:", error));
	},
	getParams: function () {
		let params = "?";
		if (this.config.channelIds) {
			params += "id=" + this.config.channelIds.join(",");
		}
		params += "&part=snippet,statistics";
		params += "&fields=items/statistics,items/snippet";
		params += "&key=" + this.config.apiKey;
		return params;
	},
	processData: function (data) {
		try {
			// Handle known errors
			// see https://developers.google.com/youtube/v3/docs/errors#channels_youtube.channels.list
			if (data.error) {
				throw data.error.message;
			}
			// Process data
			this.channelsList = data.items;
			if (this.config.enableRotate) {
				this.rotateData();
				this.scheduleRotate();
			} else {
				this.updateDom(this.config.animationSpeed);
			}
		} catch (error) {
			throw "Unable to process data: " + error;
		}
	},
	paginateData: function (items, page = 1, perPage = 10) {
		const offset = perPage * (page - 1);
		const totalPages = Math.ceil(items.length / perPage);
		const paginatedItems = items.slice(offset, perPage * page);
		return {
			previousPage: page - 1 ? page - 1 : totalPages,
			nextPage: totalPages > page ? page + 1 : 1,
			total: items.length,
			totalPages: totalPages,
			items: paginatedItems
		};
	},
	rotateData: function () {
		if (this.config.enableRotate && this.channelsList) {
			this.currentPage = this.currentChannelList ? this.currentChannelList.nextPage : 1;
			this.currentChannelList = this.paginateData(this.channelsList, this.currentPage, this.config.maximumChannels);
		}
		this.updateDom(this.config.animationSpeed);
	},
	getOrMakeArray: function (values) {
		if (!Array.isArray(values)) {
			values = !values ? [] : values.split(",").map((value) => value.trim());
		}
		return values;
	},
	toMetric: function (input) {
		// see humanizer.node MetricNumerals
		if (input <= 0) {
			return input.toString();
		}
		const symbol = ["", "K", "M", "G", "T", "P", "E", "Z", "Y"];
		const exponent = Math.floor(Math.log10(Math.abs(input)) / 3);
		if (exponent !== 0) {
			let number = input * Math.pow(1000, -exponent);
			let digits = 3 - Math.round(number).toString().length;
			return number.toFixed(digits) + symbol[exponent];
		}
		return Math.round(input).toString();
	}
});
