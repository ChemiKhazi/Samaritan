$State = {
    isText: false,
    wordTime: 750, // Time to display a word
    wordAnim: 150 // Time to animate a word
};

// From Stack Overflow
// http://stackoverflow.com/questions/1582534/calculating-text-width-with-jquery
$.fn.textWidth = function(){
  var html_org = $(this).html();
  var html_calc = '<span>' + html_org + '</span>';
  $(this).html(html_calc);
  var width = $(this).find('span:first').width();
  $(this).html(html_org);
  return width;
};

// http://stackoverflow.com/questions/19491336/get-url-parameter-jquery
function getUrlParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) 
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) 
        {
            return sParameterName[1];
        }
    }
}     

$(document).ready(function(){
    // Cache the jquery things
    $State.triangle = $('#triangle');
    $State.text  = $('#main p');
    $State.line = $('#main hr');
    
    // Start the triangle blinking
    blinkTriangle();

    // URL parameter message
    var urlMsg = getUrlParameter('msg');
    if (urlMsg !== undefined)
    {
        urlMsg = urlMsg.split('%20').join(' ').split('%22').join('');
        setTimeout(function(){executeSamaritan(urlMsg);}, $State.wordTime);
    }
    
    // URL Fullscreen
    if (getUrlParameter('fullscreen') !== undefined)
    {
        setTimeout(function(){
            if (screenfull.enabled && !screenfull.isFullscreen) {
            screenfull.request();
            }
        }, $State.wordTime);
    }

    // Pull up the phrase list file
    $.ajax({
      dataType: "json",
      url: "phraselist.json"
    }).done(function(phraselist){
        // Store the phrase list in the state
        $State.phraselist = phraselist;
        // And then listen for a click on the document
        $(document).bind('click', function(){
            // Go fullscreen if not yet
            if (screenfull.enabled && !screenfull.isFullscreen) {
                screenfull.request();
            }
            // Get a random phrase and execute samaritan
            var randomIndex = Math.floor(Math.random() * ($State.phraselist.length - 0));
            executeSamaritan($State.phraselist[randomIndex]);
        });
    });
})

var blinkTriangle = function()
{
    // Stop blinking if samaritan is in action
    if ($State.isText)
        return;
    $State.triangle.fadeTo(500, 0).fadeTo(500, 1, blinkTriangle);
}

var executeSamaritan = function(phrase)
{
    if ($State.isText)
        return;

    $State.isText = true
    var phraseArray = phrase.split(" ");
    // First, finish() the blink animation and
    // scale down the marker triangle
    $State.triangle.finish().animate({
        'font-size': '0em',
        'opacity': '1'
    }, {
        'duration': $State.wordAnim,
        // Once animation triangle scale down is complete...
        'done': function() {
            // Create timers for each word
            phraseArray.forEach(function (word, i) {
                setTimeout(function(){
                    // Set the text to black, and put in the word
                    // so that the length can be measured
                    $State.text.addClass('hidden').html(word);
                    // Then animate the line with extra padding
                    $State.line.animate({
                        'width' : ($State.text.textWidth() + 18) + "px"
                    }, {
                        'duration': $State.wordAnim,
                        // When line starts anmating, set text to white again
                        'start': $State.text.removeClass('hidden')
                    })
                }, (i * $State.wordTime) - $State.wordAnim)
            });

            // Set a final timer to hide text and show triangle
            setTimeout(function(){
                // Clear the text
                $State.text.html("");
                // Animate trinagle back in
                $State.triangle.finish().animate({
                    'font-size': '2em',
                    'opacity': '1'
                }, {
                    'duration': $State.wordAnim,
                    // Once complete, blink the triangle again and animate the line to original size
                    'done': function(){
                        $State.isText = false;
                        blinkTriangle();
                        $State.line.animate({
                            'width' : "30px"
                        }, {
                            'duration': $State.wordAnim,
                            'start': $State.text.removeClass('hidden')
                        })
                    }
                });
            },
            phraseArray.length * $State.wordTime);
        }
    });
}
