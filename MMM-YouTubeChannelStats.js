Module.register("MMM-YouTubeChannelStats", {
	// Default module config.
	defaults: {
		channelIds: "",
		apiKey: "",
		stats: ["views", "subscribers", "videos"], // possible values "views", "comments", "subscribers", "videos"
		showLabels: true,
		grayscale: true,
		maximumChannels: 0,
		fetchInterval: 3600 * 1000, // 1 hour
		rotateInterval: 10 * 1000, // 10 seconds
		animationSpeed: 2.5 * 1000 // 2.5 seconds
	},
	start: function () {
		Log.info("Starting module: " + this.name);
		// Validate config
		this.config.channelIds = this.getOrMakeArray(this.config.channelIds || this.config.channelId);
		this.config.stats = this.config.stats.map((stat) => stat.toLowerCase());
		// Enable rotation if maximumChannels is set and is greater than the number of channels
		this.config.enableRotation = this.config.maximumChannels > 0 && this.config.maximumChannels < this.config.channelIds.length;
		// Add custom nunjucks filters
		this.addFilters();
		// Schedule api calls
		this.getChannelsList();
	},
	getStyles: function () {
		return ["font-awesome.css", "MMM-YouTubeChannelStats.css"];
	},
	getTemplate: function () {
		return "templates\\statistics.njk";
	},
	getTemplateData: function () {
		if (this.config.enableRotation && this.channelsList) {
			this.currentPage = this.currentPagedChannels ? this.currentPagedChannels.nextPage : 1;
			this.currentPagedChannels = this.paginate(this.channelsList, this.currentPage, this.config.maximumChannels);
		}
		return {
			channelsList: this.currentPagedChannels ? this.currentPagedChannels.items : this.channelsList,
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
	getChannelsList: function () {
		var self = this;
		this.getYouTubeChannels();
		// Fetch Interval
		setInterval(function () {
			self.getYouTubeChannels();
		}, this.config.fetchInterval);
		// Rotate Interval
		if (this.config.enableRotation) {
			setInterval(function () {
				self.updateDom(self.config.animationSpeed);
			}, this.config.rotateInterval);
		}
	},
	getYouTubeChannels: async function () {
		const channelIds = this.config.channelIds.join(",");
		const channelsEndpoint = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&fields=items/statistics,items/snippet&id=${channelIds}&key=${this.config.apiKey}`;
		const response = await fetch(channelsEndpoint);
		const responseJson = await response.json();
		if (responseJson && responseJson.items && responseJson.items.length >= 1) {
			this.channelsList = responseJson.items;
			this.updateDom(this.config.animationSpeed);
		}
	},
	getOrMakeArray: function (values) {
		if (!Array.isArray(values)) {
			values = values.split(",").map((value) => value.trim());
		}
		return values;
	},
	paginate: function (items, page = 1, perPage = 10) {
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
