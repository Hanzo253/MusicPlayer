// card flips
var card = document.querySelector('.flipcard');
card.addEventListener('click', function() {
  card.classList.add('is-flipped');
});

var songName = document.getElementById('files').innerHTML;

var audio = document.getElementById("theAudio");
var context = new (window.AudioContext || window.webkitAudioContext)();
var src = context.createMediaElementSource(audio);
var analyser = context.createAnalyser();

var input = document.getElementById("thefile");

// var canvas = document.getElementById("canvas");
// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;

// var canvasCtx = canvas.getContext("2d");

src.connect(analyser);
analyser.connect(context.destination);

// analyser.fftSize = 512;

var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(100);

// var WIDTH = canvas.width;
// var HEIGHT = canvas.height;

var svgHeight = '300';
var svgWidth = '1920';
var barPadding = '3';

// var barWidth = (WIDTH / bufferLength) * 2.5;
// var barHeight;

// receives the selected file and plays it
function handleFileSelect(event) {
    // console.log('evt', evt.target.files);
    var files = event.target.files; // FileList object
    playFile(files[0]);
}

// reads the file in order to play it
function playFile(file) {
    // console.log('file', file);
    var freader = new FileReader();
    freader.onload = function(e) {
        audio.src = e.target.result;
    };

    freader.readAsDataURL(file);
}

// creates the frequency bars
function createSvg(parent, height, width) {
    return d3.select(parent).append('svg').attr('height', height).attr('width', width);
}

var svg = createSvg('body', svgHeight, svgWidth);

// Create our initial D3 chart.
svg.selectAll('rect').data(dataArray).enter().append('rect').attr('x', function (d, i) {
        return i * (svgWidth / dataArray.length);
}).attr('width', svgWidth / dataArray.length - barPadding);

// Continuously loop and update chart with frequency data.
function draw() {
    requestAnimationFrame(draw);

    // Copy frequency data to frequencyData array.
    analyser.getByteFrequencyData(dataArray);

    // Update d3 chart with new data.
    svg.selectAll('rect').data(dataArray).attr('y', function(d) {
        return svgHeight - d;
    })
    .attr('height', function(d) {
        return d;
    })
}

// Continuously loop and update chart with frequency data.
// function draw() {
//     requestAnimationFrame(draw);

//     // Copy frequency data to frequencyData array.
//     analyser.getByteFrequencyData(dataArray);

//     // Update d3 chart with new data.
//     canvasCtx.fillStyle = 'rgb(0, 0, 0)';
//     canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

//     var barWidth = (WIDTH / bufferLength) * 2.5;
//     var barHeight;
//     var x = 0;

//     for(var i = 0; i < bufferLength; i++) {
//         barHeight = dataArray[i] * 7;

//         canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
//         canvasCtx.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight/2);

//         x += barWidth + 1;
//     }
// }

// document.getElementById('thefile').addEventListener('change', handleFileSelect, false);
// document.getElementById('play').onclick = function() { 
//     audio.play();
// };

$(document).ready(function(){
    $("#pause").hide();
    $("#mute").hide();
    $("#duration").hide();

    // displays file name and reset slider
    $('input[type="file"]').change(function(e) {
        var file = this.files[0];
        var fileName = e.target.files[0].name;
        $("#files").html(fileName);
        audio.currentTime = 0;
        $("#progressbar").slider('value', audio.currentTime);
        if (file.type.indexOf('audio/') !== 0) {
            this.value = null;
            if (!alertify.errorAlert) {
                // alert for invalid files
                alertify.dialog('errorAlert',function factory() {
                  return {
                          build: function() {
                            var errorHeader = '<span class="fa fa-times-circle fa-2x" '
                            +    'style="vertical-align:middle;color:#e10000;">'
                            + '</span> Music Player Error';
                            this.setHeader(errorHeader);
                          }
                      };
                }, true,'alert');
            }
            alertify.errorAlert("This is not a valid audio file.");
            $("#files").html("");
        }
        
        // // hide duration text if there is no audio file uploaded
        // if ($('#files').is(':empty')) {
        //     $("#duration").hide();
        // }

        // else {
        //     $("#duration").show();
        // }

        // hide duration until play button is clicked
        $("#duration").hide();
    });

    $('#thefile').on('change', handleFileSelect);

    // play button
    $('#play').click(function() { 
        audio.play();
        $("#pause").show();
        $(this).hide();
        if ($('#files').is(':empty')) {
            if (!alertify.errorAlert) {
                // alert for no audio files detected
                alertify.dialog('errorAlert',function factory() {
                  return {
                          build: function() {
                            var errorHeader = '<span class="fa fa-times-circle fa-2x" '
                            +    'style="vertical-align:middle;color:#e10000;">'
                            + '</span> Music Player Error';
                            this.setHeader(errorHeader);
                          }
                      };
                }, true,'alert');
            }
            alertify.errorAlert("No audio files detected.");
            $("#play").show();
            $("#pause").hide();
        }
        draw();

        // show duration when song is playing
        $("#duration").show();
    });

    // pause button
    $('#pause').click(function() {
        audio.pause();
        $("#play").show();
        $(this).hide();
    });

    // pauses audio when user is trying to change songs
    $('#file-input').click(function() {
        audio.pause();
        $("#play").show();
        $("#pause").hide();
    });

    // when clicked, mutes the player
    $("#unmute").click(function() {
        audio.muted = true;
        $("#mute").show();
        $("#unmute").hide();
        $("#volume").slider("disable");
    });

    // // when clicked, unmutes the player if the player is muted
    $("#mute").click(function() {
        audio.muted = false;
        $("#unmute").show();
        $("#mute").hide();
        $("#volume").slider("enable");
    });

    // repeat song in a loop button
    $('#loop').click(function() {
        if (!audio.loop) {
            audio.loop = true;
            $(this).addClass("active");
        }

        else {
            audio.loop = false;
            $(this).removeClass("active");
        }
    });

    // when song is over, the play icon will display
    audio.addEventListener('timeupdate', function() {
        if (audio.currentTime === audio.duration) {
            $("#play").show();
            $("#pause").hide();
        }
    }, false);

    // $('#restart').click(function() {
    //     audio.currentTime = 0;
    // });

    audio.volume = 1;

    // get the duration of the song
    function getTime(time) {
        var minute = Math.floor(time / 60);
        var second = Math.floor(time % 60);
        if (minute < 10) {
            minute = "0" + minute;
        }

        if (second < 10) {
            second = "0" + second;
        }

        return minute + ":" + second;
    }

    // function progress bar of song duration
    function progress() {
        $("#progressbar").slider('value', Math.floor((100 / audio.duration) * audio.currentTime));
        $("#duration").text(getTime(audio.currentTime) + " / " + getTime(audio.duration));
    }

    // volume settings of the music player
    $("#volume").slider( {
        range: "min",
        value: audio.volume * 100,
        slide: function(event, ui) {
            audio.volume = ui.value / 100;
            if (audio.volume === 0) {
                $("#mute").show();
                $("#unmute").hide();
            }

            else {
                $("#unmute").show();
                $("#mute").hide();
            }
        }
    });

    // slider of progress bar
    $("#progressbar").slider( {
        range: "min",
        value: audio.currentTime,
        slide: function(event, ui) {
            audio.currentTime = audio.duration / 100 * ui.value;
        }
    });

    audio.addEventListener("timeupdate", progress, false);
});

// binds the event on to the styled button to trigger the file button
document.querySelector("#file-input").addEventListener("click", function() {
    var clickEvent = document.createEvent('MouseEvents');
    
    clickEvent.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    document.querySelector("#thefile").dispatchEvent(clickEvent);
});