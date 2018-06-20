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
				var index = me.resolver.getSeriesId('absolute', key);
				if (index >= 0) {
					me.chartAbsolute.series[index].setData(data, true);
				}
			});
		});
		$.getJSON(this.resolver.getUrl(this.id, 'relative', data), function(chartData) {
			$.each(chartData, function(key, data) {
				var index = me.resolver.getSeriesId('relative', key);
				if (index >= 0) {
					me.chartRelative.series[index].setData(data, true);
				}
			});
		});
	}
}

class DataResolver {
	constructor(hasScope, hasData, dataMap, dataMapRelative) {
		this.hasScope = hasScope;
		this.hasData = hasData;
		dataMap = dataMap || [];
		this.dataMap = {
			'absolute': dataMap,
			'relative': dataMapRelative || dataMap
		};
	}

	/**
	 * Builds the data url for the given information.
	 * @param id string The id of the chart to get the data for.
	 * @param scope string The scope of the data to get (absolute / relative).
	 * @param data string The data to get (ipv4 / ipv6 / merged)
	 */
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
	 * Gets the index of the series with the given name and for the given scope.
	 * @param scope string The scope of the series (absolute / relative)
	 * @param name string The name of the series to get the index for.
	 * @return The index of the series.
	 */
	getSeriesId(scope, name) {
		return this.dataMap[scope].indexOf(name);
	}
}

class Table {
	constructor(id, cols, url, rowFormatter) {
		this.table = $('table#' + id);
		this.cols = cols;
		this.formatter = rowFormatter;
		this.data = {};
		this.currentData = "ipv4";

		var me = this;
		$.getJSON(url, function(tableData) {
			me.data = tableData;
			me.show(me.currentData);
		});
	}

	show(data, name) {
		this.currentData = data;
		name = name || data;

		var body = this.table.children('tbody');
		// Remove old data
		body.empty();

		var tableData = this.data[this.currentData] || [];
		if (tableData.length > 0) {
			for (var i = 0; i < tableData.length; i++) {
				body.append(this.formatter(i, tableData[i]));
			}
		} else {
			body.append("<tr><td colspan=\"" + this.cols + "\"><center><span class=\"text-muted\">No data for " + name + "</span></center></td></tr>");
		}
	}
}
