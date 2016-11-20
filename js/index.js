$(document).ready(function() {
    $('input[type=text]').bind('change paste keyup', function() {

        var query = $('input[name=searchQuery]').val();
        if (query.length >= 3) search(query);
        else if (query.length === 0) resetDisplay();
    });
});

var search = function(query) {
    $.ajax({
        url: 'http://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srsearch=' + query,
        type: 'GET',
        dataType: 'jsonp',
        headers: {
            'Api-User-Agent': 'WikiReader/0.1.0'
        }
    }).success(function(data, status) {
        updateNumResults(data.query);
        requestArticleExtracts(data.query);
    }).error(function(data, status) {
        console.log("ERROR! " + status);
    });
};

var requestArticleExtracts = function(queryResult) {
    // Request articles found in the search
    var extractQuery = 'http://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exsentences=2&exlimit=max&exintro=&explaintext=&titles=';

    // Add each page title to the search
    var searchResults = queryResult.search;
    for (var i = 0; i < searchResults.length - 1; i++) {
        extractQuery += searchResults[i].title + '|';
    }
    extractQuery += searchResults[searchResults.length - 1].title;
    extractQuery = encodeURI(extractQuery);

    $.ajax({
        url: extractQuery,
        type: 'GET',
        dataType: 'jsonp',
        headers: {
            'Api-User-Agent': 'WikiReader/0.1.0'
        }
    }).success(function(data, status) {
        updateDisplay(data);
    });
};

var updateNumResults = function(queryResult) {
    $('.num_results').html("<p class='num_results'>Showing results 1 to 10 of " + queryResult.searchinfo.totalhits + "</p>");
};

var resetDisplay = function() {
    $('#results_pane').html('');
    $('.num_results').html('');
};

var updateDisplay = function(queryResult) {
    //(search result);
    var pages = queryResult.query.pages;

    // Find the results pane and reset it
    $('#results_pane').html('');

    for (var pId in pages) {
        var htmlToAdd = "<div class='result_card'>";
        htmlToAdd += "<a target='_' href='http://en.wikipedia.org/?curid=" + pages[pId].pageid + "'>";
        htmlToAdd += "<h1>" + pages[pId].title + "</h1>";
        htmlToAdd += "<p>" + pages[pId].extract + "</p></a></div>";
        $('#results_pane').append(htmlToAdd);
    }
};
