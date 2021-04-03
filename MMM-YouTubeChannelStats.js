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
		// Schedule api calls
		this.getChannelInfo();
	},
	getStyles: function () {
		return ["font-awesome.css", "MMM-YouTubeChannelStats.css"];
	},
	getTemplate: function () {
		return "templates\\statistics.njk";
	},
	getTemplateData: function () {
		console.log(this.data.position.includes("_right") ? "right" : "left");
		return {
			channelData: this.channelData,
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
	getChannelInfo: function () {
		var self = this;
		const channelIds = this.config.channelIds.join(",");
		const channelsEndpoint = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&fields=items/statistics,items/snippet&id=${channelIds}&key=${this.config.apiKey}`;
		console.log(channelsEndpoint);
		const callYouTubeApi = async () => {
			const response = await fetch(channelsEndpoint);
			const responseJson = await response.json();
			if (responseJson && responseJson.items && responseJson.items.length >= 1) {
				self.channelData = responseJson.items;
				self.updateDom(self.config.animationSpeed);
			}
		};
		callYouTubeApi();
		setInterval(function () {
			callYouTubeApi();
		}, this.config.fetchInterval);
	},
	getOrMakeArray: function (arrayOrString) {
		return Array.isArray(arrayOrString) ? arrayOrString : [arrayOrString];
	}
});
