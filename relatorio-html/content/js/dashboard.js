/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 90.8, "KoPercent": 9.2};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.515, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.65, 500, 1500, "POST - Comprar Passagem"], "isController": false}, {"data": [0.38, 500, 1500, "HTTP Request"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 500, 46, 9.2, 1040.742, 402, 3740, 899.0, 1953.5000000000002, 2293.7999999999997, 2898.6900000000005, 42.647560559536, 279.66637613016036, 9.78728196434664], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["POST - Comprar Passagem", 250, 15, 6.0, 804.0360000000001, 402, 2868, 584.0, 1522.3000000000002, 2115.2999999999993, 2659.560000000003, 21.323780279768, 139.83318806508018, 4.89364098217332], "isController": false}, {"data": ["HTTP Request", 250, 31, 12.4, 1277.4480000000003, 428, 3740, 1119.5, 2129.3, 2552.2499999999995, 3381.270000000004, 58.08550185873606, 380.90248533341077, 13.330168883596654], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 2,326 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,337 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,147 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,489 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,252 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 3,042 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,541 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,198 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 3,174 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,029 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,736 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,446 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,161 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,295 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,098 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,237 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,240 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,438 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, 4.3478260869565215, 0.4], "isController": false}, {"data": ["The operation lasted too long: It took 2,184 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,899 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,219 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,164 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,082 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,008 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 3,597 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,454 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,116 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,491 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,123 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,156 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,570 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,849 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,053 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,068 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,271 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,656 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 3,740 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,820 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,331 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,130 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,835 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,566 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,067 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,864 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,868 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 2.1739130434782608, 0.2], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 500, 46, "The operation lasted too long: It took 2,438 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, "The operation lasted too long: It took 2,326 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,337 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,147 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,489 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["POST - Comprar Passagem", 250, 15, "The operation lasted too long: It took 2,326 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,337 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,082 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,491 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,156 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1], "isController": false}, {"data": ["HTTP Request", 250, 31, "The operation lasted too long: It took 2,147 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,489 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,252 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 3,042 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,541 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
