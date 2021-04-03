Module.register("MMM-YouTubeChannelStats", {
	// Default module config.
	defaults: {
		channelIds: "",
		apiKey: "",
		stats: ["views", "subscribers", "videos"], // possible values "views", "comments", "subscribers", "videos"
		showLabels: true,
		fetchInterval: 3600 * 1000, // 1 hour
		animationSpeed: 2.5 * 1000 // 2.5 seconds
	},
	start: function () {
		Log.info("Starting module: " + this.name);
		// Validate config
		this.config.channelIds = this.getOrMakeArray(this.config.channelIds || this.config.channelId);
		this.config.stats = this.config.stats.map((stat) => stat.toLowerCase());
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
		return {
			channelsList: this.channelsList,
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
	getChannelsList: function () {
		var self = this;
		this.getYouTubeChannels();
		setInterval(function () {
			self.getYouTubeChannels();
		}, this.config.fetchInterval);
	},
	getYouTubeChannels: async function () {
		const channelIds = this.config.channelIds.join(",");
		const channelsEndpoint = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&fields=items/statistics,items/snippet&id=${channelIds}&key=${this.config.apiKey}`;
		const response = await fetch(channelsEndpoint);
		const responseJson = await response.json();
		if (responseJson && responseJson.items && responseJson.items.length >= 1) {
			this.channelsList = responseJson.items;
			this.updateDom(self.config.animationSpeed);
		}
	},
	getOrMakeArray: function (arrayOrString) {
		return Array.isArray(arrayOrString) ? arrayOrString : [arrayOrString];
	}
});
