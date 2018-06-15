class Chart {
	constructor(id, optAbsolute, optRelative, resolver) {
		this.id = id;
		this.resolver = resolver;
		this.chartAbsolute = Highcharts.chart(id + '-absolute', optAbsolute);
		this.chartRelative = Highcharts.chart(id + '-relative', optRelative);
	}

	load(data) {
		var me = this;
		$.getJSON(this.resolver.getUrl(this.id, 'absolute', data), function(chartData) {
			$.each(chartData, function(key, data) {
				var index = me.resolver.getSeriesId(key);
				if (index >= 0) {
					me.chartAbsolute.series[index].setData(data, true);
				}
			});
		});
		$.getJSON(this.resolver.getUrl(this.id, 'relative', data), function(chartData) {
			$.each(chartData, function(key, data) {
				var index = me.resolver.getSeriesId(key);
				if (index >= 0) {
					me.chartRelative.series[index].setData(data, true);
				}
			});
		});
	}
}

class DataResolver {
	constructor(hasScope, hasData, dataMap) {
		this.hasScope = hasScope;
		this.hasData = hasData;
		this.dataMap = dataMap;
	}

	getUrl(id, scope, data) {
		var url = 'data/' + id + '/';
		if (this.hasScope) {
			url += scope;
		}
		if (this.hasScope && this.hasData) {
			url += '/';
		}
		if (this.hasData) {
			url += data;
		}
		url += '.json';
		return url;
	}

	/**
	 * Gets the index of the series with the given name.
	 * @param name string The name of the series to get the index for.
	 * @return The index of the series.
	 */
	getSeriesId(name) {
		return this.dataMap.indexOf(name);
	}
}
