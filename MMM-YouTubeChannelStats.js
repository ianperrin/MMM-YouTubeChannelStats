Module.register("MMM-YouTubeChannelStats", {
	// Default module config.
	defaults: {
		channelId: "",
		apiKey: "",
		stats: ["views", "comments", "subscribers", "videos"],
		setHeader: true,
		showLabels: true,
		fetchInterval: 3600 * 1000, // 1 hour
		animationSpeed: 2.5 * 1000 // 2.5 seconds
	},

	start: function () {
		Log.info("Starting module: " + this.name);
		// Validate config
		//todo
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
		return {
			channelInfo: this.channelInfo,
			stats: this.config.stats,
			showLabels: this.config.showLabels
		};
	},
	getChannelInfo: function () {
		var self = this;

		const channelsEndpoint = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&fields=items/statistics,items/snippet&id=${this.config.channelId}&key=${this.config.apiKey}`;
		const callYouTubeApi = async () => {
			const response = await fetch(channelsEndpoint);
			const responseJson = await response.json();
			if (responseJson && responseJson.items && responseJson.items.length >= 1) {
				self.channelInfo = responseJson.items[0];
				if (self.config.setHeader) {
					self.data.header = self.channelInfo.snippet.title;
				}
				self.updateDom(self.config.animationSpeed);
			}
		};
		callYouTubeApi();
		setInterval(function () {
			callYouTubeApi();
		}, this.config.fetchInterval);
	}
});
