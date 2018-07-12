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


$(function(){
	var chartMap = {};
	var tableMap = {};

	chartMap['adoption'] = new Chart('adoption',
		{
			'chart': {
				'type': 'spline',
				'zoomType': 'xy'
			},
			'title': {
				'text': "HSTS Adoption"
			},
			'tooltip': {
				'headerFormat': "<b>{series.name}</b><br/>",
				'pointFormat': "<span>{point.x:%e. %b %Y}</span><br/><span>{point.y:,.0f} domains</span>"
			},
			'exporting': {
				'filename': "hsts-adoption-absolute",
				'fallbackToExportServer': true
			},
			'xAxis': {
				'title': {
					'text': "Date"
				},
				'type': 'datetime',
				'dateTimeLabelFormats': {
					'day': '%e. %b %Y',
					'month': '%b %Y',
					'year': '%Y'
				}
			},
			'yAxis': {
				'title': {
					'text': "# domains"
				},
				'min': 0
			},
			'plotOptions': {
				'spline': {
					'marker': {
						'enabled': true,
						'radius': 2 
					}
				}
			},
			'series': [
				{
					'name': "Domains with successful HTTPS connection",
					'visible': false,
					'data': []
				}, {
					'name': "Domains with HSTS",
					'data': []
				}, {
					'name': "HSTS domains that include subdomains",
					'data': []
				}, {
					'name': "HSTS domains with preloading",
					'data': []
				}
			]
		},
		{
			'chart': {
				'type': 'spline',
				'zoomType': 'xy'
			},
			'title': {
				'text': "HSTS Adoption"
			},
			'tooltip': {
				'headerFormat': "<b>{series.name}</b><br/>",
				'pointFormat': "<span>{point.x:%e. %b %Y}</span><br/><span>{point.y:.2f}% of scanned domains</span>"
			},
			'exporting': {
				'filename': "hsts-adoption-relative",
				'fallbackToExportServer': true
			},
			'xAxis': {
				'title': {
					'text': "Date"
				},
				'type': 'datetime',
				'dateTimeLabelFormats': {
					'day': '%e. %b %Y',
					'month': '%b %Y',
					'year': '%Y'
				}
			},
			'yAxis': {
				'title': {
					'text': "% of scanned domains"
				},
				'min': 0
			},
			'plotOptions': {
				'spline': {
					'marker': {
						'enabled': true,
						'radius': 2 
					}
				}
			},
			'series': [
				{
					'name': "Domains with HSTS",
					'data': []
				}, {
					'name': "HSTS domains that include subdomains",
					'data': []
				}, {
					'name': "HSTS domains with preloading",
					'data': []
				}
			]
		},
		new DataResolver(true, true, ['domains', 'hsts', 'includeSubDomains', 'preload'], ['hsts', 'includeSubDomains', 'preload'])
	);

	chartMap['max-age'] = new Chart('max-age',
		{
			'chart': {
				'type': 'area',
				'zoomType': 'xy'
			},
			'title': {
				'text': "max-age values"
			},
			'tooltip': {
				'headerFormat': "<b>{series.name}</b><br/>",
				'pointFormat': "<span>{point.x:%e. %b %Y}</span><br/><span>{point.y:,.0f} domains</span>"
			},
			'exporting': {
				'filename': "hsts-max-age-absolute",
				'fallbackToExportServer': true
			},
			'xAxis': {
				'title': {
					'text': "Date"
				},
				'type': 'datetime',
				'dateTimeLabelFormats': {
					'day': '%e. %b %Y',
					'month': '%b %Y',
					'year': '%Y'
				}
			},
			'yAxis': {
				'title': {
					'text': "# domains"
				},
				'min': 0
			},
			'plotOptions': {
				'area': {
					'stacking': 'normal',
					'marker': {
						'enabled': true,
						'radius': 2 
					}
				}
			},
			'series': [
				{
					'name': ">1 year",
					'data': []
				}, {
					'name': "1 year",
					'data': []
				}, {
					'name': "<1 year",
					'data': []
				}, {
					'name': "6 months",
					'data': []
				}, {
					'name': "<6 months",
					'data': []
				}, {
					'name': "≤1 week",
					'data': []
				}, {
					'name': "≤1 day",
					'data': []
				}, {
					'name': "test",
					'data': []
				}, {
					'name': "off",
					'data': []
				}
			]
		},
		{
			'chart': {
				'type': 'area',
				'zoomType': 'xy'
			},
			'title': {
				'text': "max-age values"
			},
			'tooltip': {
				'headerFormat': "<b>{series.name}</b><br/>",
				'pointFormat': "<span>{point.x:%e. %b %Y}</span><br/><span>{point.percentage:.2f}% of domains with sts</span>"
			},
			'exporting': {
				'filename': "hsts-max-age-relative",
				'fallbackToExportServer': true
			},
			'xAxis': {
				'title': {
					'text': "Date"
				},
				'type': 'datetime',
				'dateTimeLabelFormats': {
					'day': '%e. %b %Y',
					'month': '%b %Y',
					'year': '%Y'
				}
			},
			'yAxis': {
				'title': {
					'text': "% of domains with sts"
				},
				'min': 0,
				'max': 100
			},
			'plotOptions': {
				'area': {
					'stacking': 'percent',
					'marker': {
						'enabled': true,
						'radius': 2 
					}
				}
			},
			'series': [
				{
					'name': ">1 year",
					'data': []
				}, {
					'name': "1 year",
					'data': []
				}, {
					'name': "<1 year",
					'data': []
				}, {
					'name': "6 months",
					'data': []
				}, {
					'name': "<6 months",
					'data': []
				}, {
					'name': "≤1 week",
					'data': []
				}, {
					'name': "≤1 day",
					'data': []
				}, {
					'name': "test",
					'data': []
				}, {
					'name': "off",
					'data': []
				}
			]
		},
		new DataResolver(false, true, ['other', 'year', 'hy-y', 'half-year', 'w-hy', 'week', 'day', 'test', 'off'])
	);

	chartMap['configuration'] = new Chart('configuration',
		{
			'chart': {
				'type': 'spline',
				'zoomType': 'xy'
			},
			'title': {
				'text': "HSTS Configuration"
			},
			'tooltip': {
				'headerFormat': "<b>{series.name}</b><br/>",
				'pointFormat': "<span>{point.x:%e. %b %Y}</span><br/><span>{point.y:,.0f} domains</span>"
			},
			'exporting': {
				'filename': "hsts-configuration-absolute",
				'fallbackToExportServer': true
			},
			'xAxis': {
				'title': {
					'text': "Date"
				},
				'type': 'datetime',
				'dateTimeLabelFormats': {
					'day': '%e. %b %Y',
					'month': '%b %Y',
					'year': '%Y'
				}
			},
			'yAxis': {
				'title': {
					'text': "# domains"
				},
				'min': 0
			},
			'plotOptions': {
				'spline': {
					'marker': {
						'enabled': true,
						'radius': 2 
					}
				}
			},
			'series': [
				{
					'name': "includeSubDomains",
					'data': []
				}, {
					'name': "preload",
					'data': []
				}, {
					'name': "Chromium preload list",
					'visible': false,
					'data': []
				}
			]
		},
		{
			'chart': {
				'type': 'spline',
				'zoomType': 'xy'
			},
			'title': {
				'text': "HSTS Configuration"
			},
			'tooltip': {
				'headerFormat': "<b>{series.name}</b><br/>",
				'pointFormat': "<span>{point.x:%e. %b %Y}</span><br/><span>{point.y:.2f}% of domains with sts</span>"
			},
			'exporting': {
				'filename': "hsts-configuration-relative",
				'fallbackToExportServer': true
			},
			'xAxis': {
				'title': {
					'text': "Date"
				},
				'type': 'datetime',
				'dateTimeLabelFormats': {
					'day': '%e. %b %Y',
					'month': '%b %Y',
					'year': '%Y'
				}
			},
			'yAxis': {
				'title': {
					'text': "% of domains with sts"
				},
				'min': 0
			},
			'plotOptions': {
				'spline': {
					'marker': {
						'enabled': true,
						'radius': 2 
					}
				}
			},
			'series': [
				{
					'name': "includeSubDomains",
					'data': []
				}, {
					'name': "preload",
					'data': []
				}
			]
		},
		new DataResolver(true, true, ['includeSubDomains', 'preload', 'chromium'], ['includeSubDomains', 'preload'])
	);

	chartMap['inconsistencies'] = new Chart('inconsistencies',
		{
			'chart': {
				'type': 'spline',
				'zoomType': 'xy'
			},
			'title': {
				'text': "HSTS Inconsistencies"
			},
			'tooltip': {
				'headerFormat': "<b>{series.name}</b><br/>",
				'pointFormat': "<span>{point.x:%e. %b %Y}</span><br/><span>{point.y:,.0f} domains</span>"
			},
			'exporting': {
				'filename': "hsts-inconsistencies-absolute",
				'fallbackToExportServer': true
			},
			'xAxis': {
				'title': {
					'text': "Date"
				},
				'type': 'datetime',
				'dateTimeLabelFormats': {
					'day': '%e. %b %Y',
					'month': '%b %Y',
					'year': '%Y'
				}
			},
			'yAxis': {
				'title': {
					'text': "# domains"
				},
				'min': 0
			},
			'plotOptions': {
				'spline': {
					'marker': {
						'enabled': true,
						'radius': 2 
					}
				}
			},
			'series': [
				{
					'name': "total",
					'data': []
				}, {
					'name': "configuration",
					'data': []
				}, {
					'name': "existence",
					'data': []
				}
			]
		},
		{
			'chart': {
				'type': 'spline',
				'zoomType': 'xy'
			},
			'title': {
				'text': "HSTS Inconsistencies"
			},
			'tooltip': {
				'headerFormat': "<b>{series.name}</b><br/>",
				'pointFormat': "<span>{point.x:%e. %b %Y}</span><br/><span>{point.y:.3f}% of domains with sts</span>"
			},
			'exporting': {
				'filename': "hsts-inconsistencies-relative",
				'fallbackToExportServer': true
			},
			'xAxis': {
				'title': {
					'text': "Date"
				},
				'type': 'datetime',
				'dateTimeLabelFormats': {
					'day': '%e. %b %Y',
					'month': '%b %Y',
					'year': '%Y'
				}
			},
			'yAxis': {
				'title': {
					'text': "% of domains with sts"
				},
				'min': 0
			},
			'plotOptions': {
				'spline': {
					'marker': {
						'enabled': true,
						'radius': 2 
					}
				}
			},
			'series': [
				{
					'name': "total",
					'data': []
				}, {
					'name': "configuration",
					'data': []
				}, {
					'name': "existence",
					'data': []
				}
			]
		},
		new DataResolver(true, true, ['total', 'configuration', 'existence'])
	);

	chartMap['inconsistency-v4v6'] = new Chart('inconsistency-v4v6',
		{
			'chart': {
				'type': 'spline',
				'zoomType': 'xy'
			},
			'title': {
				'text': "HSTS Inconsistency IPv4 - IPv6"
			},
			'tooltip': {
				'headerFormat': "<b>{series.name}</b><br/>",
				'pointFormat': "<span>{point.x:%e. %b %Y}</span><br/><span>{point.y:,.0f} domains</span>"
			},
			'exporting': {
				'filename': "hsts-inconsistency-ipv4-ipv6-absolute",
				'fallbackToExportServer': true
			},
			'xAxis': {
				'title': {
					'text': "Date"
				},
				'type': 'datetime',
				'dateTimeLabelFormats': {
					'day': '%e. %b %Y',
					'month': '%b %Y',
					'year': '%Y'
				}
			},
			'yAxis': {
				'title': {
					'text': "# domains"
				},
				'min': 0
			},
			'plotOptions': {
				'spline': {
					'marker': {
						'enabled': true,
						'radius': 2 
					}
				}
			},
			'series': [
				{
					'name': "Inconsistent domains",
					'data': []
				}
			]
		},
		{
			'chart': {
				'type': 'spline',
				'zoomType': 'xy'
			},
			'title': {
				'text': "HSTS Inconsistency IPv4 - IPv6"
			},
			'tooltip': {
				'headerFormat': "<b>{series.name}</b><br/>",
				'pointFormat': "<span>{point.x:%e. %b %Y}</span><br/><span>{point.y:.3f}% of domains with sts</span>"
			},
			'exporting': {
				'filename': "hsts-inconsistency-ipv4-ipv6-relative",
				'fallbackToExportServer': true
			},
			'xAxis': {
				'title': {
					'text': "Date"
				},
				'type': 'datetime',
				'dateTimeLabelFormats': {
					'day': '%e. %b %Y',
					'month': '%b %Y',
					'year': '%Y'
				}
			},
			'yAxis': {
				'title': {
					'text': "% of domains with sts"
				},
				'min': 0
			},
			'plotOptions': {
				'spline': {
					'marker': {
						'enabled': true,
						'radius': 2 
					}
				}
			},
			'series': [
				{
					'name': "Inconsistent domains",
					'data': []
				}
			]
		},
		new DataResolver(true, false, ['inconsistent'])
	);

	chartMap['parse-errors'] = new Chart('parse-errors',
		{
			'chart': {
				'type': 'spline',
				'zoomType': 'xy'
			},
			'title': {
				'text': "Parse errors"
			},
			'tooltip': {
				'headerFormat': "<b>{series.name}</b><br/>",
				'pointFormat': "<span>{point.x:%e. %b %Y}</span><br/><span>{point.y:,.0f} domains</span>"
			},
			'exporting': {
				'filename': "hsts-parse-errors-absolute",
				'fallbackToExportServer': true
			},
			'xAxis': {
				'title': {
					'text': "Date"
				},
				'type': 'datetime',
				'dateTimeLabelFormats': {
					'day': '%e. %b %Y',
					'month': '%b %Y',
					'year': '%Y'
				}
			},
			'yAxis': {
				'title': {
					'text': "# domains"
				},
				'min': 0
			},
			'plotOptions': {
				'spline': {
					'marker': {
						'enabled': true,
						'radius': 2 
					}
				}
			},
			'series': [
				{
					'name': "Domains with parse errors",
					'data': []
				}
			]
		},
		{
			'chart': {
				'type': 'spline',
				'zoomType': 'xy'
			},
			'title': {
				'text': "Parse errors"
			},
			'tooltip': {
				'headerFormat': "<b>{series.name}</b><br/>",
				'pointFormat': "<span>{point.x:%e. %b %Y}</span><br/><span>{point.y:.3f}% of scanned domains</span>"
			},
			'exporting': {
				'filename': "hsts-parse-errors-relative",
				'fallbackToExportServer': true
			},
			'xAxis': {
				'title': {
					'text': "Date"
				},
				'type': 'datetime',
				'dateTimeLabelFormats': {
					'day': '%e. %b %Y',
					'month': '%b %Y',
					'year': '%Y'
				}
			},
			'yAxis': {
				'title': {
					'text': "% of scanned domains"
				},
				'min': 0
			},
			'plotOptions': {
				'spline': {
					'marker': {
						'enabled': true,
						'radius': 2 
					}
				}
			},
			'series': [
				{
					'name': "Domains with parse errors",
					'data': []
				}
			]
		},
		new DataResolver(true, true, ['parseError'])
	);

	tableMap['parse-errors-most-common'] = new Table('parse-errors-most-common', 3, 'data/parse-errors/most-common.json', function(index, data) {
		var row = "<tr>";
		row += "<th scope=\"row\">" + (index + 1) + "</th>";
		row += "<td>" + data['occurences'] + "</td>";
		row += "<td>" + data['error'] + "</td>";
		row += "</tr>\n";
		return row;
	});

	$('.data-set-toggle').delegate('input[type="radio"]', 'change', function(event) {
		var group = $(event.delegateTarget);
		var option = $(event.currentTarget);

		var set = option.data('set');
		var id = group.data('chart');

		var chart = chartMap[id];
		if (chart) {
			chart.load(set);
		}
	});
	$('.data-set-table-toggle').delegate('input[type="radio"]', 'change', function(event) {
		var group = $(event.delegateTarget);
		var option = $(event.currentTarget);

		var set = option.data('set');
		var id = group.data('table');

		var table = tableMap[id];
		if (table) {
			table.show(set);
		}
	});

	$.each(chartMap, function(id, chart) {
		if(id == 'inconsistencies') {
			chart.load('ipv4');
		} else {
			chart.load('merged');
		}
	});
	$.each(tableMap, function(id, table) {
		table.show('ipv4');
	});
});
