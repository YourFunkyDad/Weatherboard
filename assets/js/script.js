const apiKey = "f8bdee5d7df0d8080f755ec842a46146";
var userFormEl = $("#citySearch");

// API Call: api.openweathermap.org/data/2.5/weather?q=London,uk&APPID=f8bdee5d7df0d8080f755ec842a46146
// Updating Current Weather
var updateCurrentWeather = function(response) {
    var tempEl = $("#currentFeel");
    var iconEl = $("#currentIcon");
    var humidityEl = $("#currentHumidity");
    var windSpeedEl = $("#currentWindSpeed");
    var dateEl = $("currentNow");

    var currentFeel = response.main.temp;
    var currentIcon = response.weather[0].icon;
    var currentNow = new Date(currentTimeCodeUnix*1000).toLocaleDateString("en-US");
    var currentTimeCodeUnix = response.dt;
    var currentWindSpeed = response.wind.speed;
    var currentHumidity = response.main.humidity;

    dateEl.text(currentNow);
    tempEl.text(currentFeel);
    iconEl.attr("src", "https://openweathermap.org/img/w/" + currentIcon + ".png");
    humidityEl.text(currentHumidity);
    windSpeedEl.text(currentWindSpeed);

    var currentTimeCodeUnix = response.dt;
    var s = new Date(currentTimeCodeUnix*1000).toLocaleDateString("en-US")
    
    var locationArr = {
        lat: response.coord.lat,
        long: response.coord.lon
    }

    return locationArr;
};
// Calling Index
var getIndex = function(response) {
    var idx = 0
    for (i=1;i<response.list.length;i++) {
        var currentTime = new Date(response.list[i].dt*1000);
        var lastTime = new Date(response.list[i-1].dt*1000);
        if (currentTime.getDay() != lastTime.getDay()) {
            if (i == 8) {
                idx = 0;
                return idx;
            } else {
                idx = i;
                return idx;
            };
        };
    };
};

var updateUVIndex = function(val) {
    var uvEl = $("#currentUV");
    uvEl.text(val);
    uvEl.removeClass();

    if (val < 3) {
        uvEl.addClass("bg-success text-uppercase p-3");
    } else if (val < 6) {
        uvEl.addClass("bg-warning text-uppercase p-3");
    } else {
        uvEl.addClass("bg-danger text-uppercase p-3");
    };
};


// Fetching CurrentWeather
var getCurrentWeather = function (cityName) {
    var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=imperial&appid=" + apiKey;

    fetch(apiUrl).then(function(response) {
        if (response.ok) {
            response.json().then(function(response) {
                var cityContainerEl = $("#currentCity");
                cityContainerEl.text(cityName);
                updateSearchHistory(cityName);

                var location = updateCurrentWeather(response);
                get5DayForecast(cityName);

                var apiUrlUV = "https://api.openweathermap.org/data/2.5/uvi?lat=" + location.lat  + "&lon=" + location.long + "&appid=" + apiKey;
                return fetch(apiUrlUV);
            }).then(function(response) {
                response.json().then(function(response) {
                    updateUVIndex(response.value);
                });
            });
        } else {
            alert("Unable to Find City!");
        };
    }).catch(function(error) {
        alert("Problems Connecting to OpenWeather!");
    })
};

var updateSearchHistory = function(city) {
    var searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
    searchHistory.unshift(city);
    searchHistory.pop();
    localStorage.setItem("searchHistory",JSON.stringify(searchHistory));

    var listItems = $(".list-group-item");
    for (l in listItems) {
        listItems[l].textContent = searchHistory[l];
    };
}

var get5DayForecast = function(cityName) {
    var forecastContainerEl = $("#day-forecast");
    // clear any existing data
    forecastContainerEl.html("");
    
    var apiUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&units=imperial&appid=" + apiKey;

    fetch(apiUrl).then(function(response) {
        // dont need if response ok since already checked earlier
        response.json().then(function(response) {
            // build 
            // variable to hold index of the first date change
            var idx = getIndex(response);
    
            for (i=0;i<5;i++) {
                // based on the index value above, find the index value for the 5 days (add 4 so the printed data values are for the middle of the day)
                var actualIdx = i * 8 + idx + 4;
                if (actualIdx>39) {actualIdx = 39};
    
                // get data from api at Unix and convert
                var timeCodeUnix = response.list[actualIdx].dt;
                var time = new Date(timeCodeUnix*1000).toLocaleDateString("en-US");
                var icon = response.list[actualIdx].weather[0].icon;
                var temp = response.list[actualIdx].main.temp;
                var humidity = response.list[actualIdx].main.humidity;
    
                var cardEl = $("<div>").addClass("col-2 card bg-primary pt-2");
                var cardTitleEl = $("<h5>").addClass("card-title").text(time);
                var divEl = $("<div>").addClass("weather-icon");
                var cardIconEl = $("<img>").addClass("p-2").attr("src","https://openweathermap.org/img/w/" + icon + ".png");
                var cardTempEl = $("<p>").addClass("card-text").text("Temp: " + temp + " " + String.fromCharCode(176) + "F");
                var cardHumidityEl = $("<p>").addClass("card-text mb-2").text("Humidity: " + humidity + "%");
    
                cardEl.append(cardTitleEl);
                divEl.append(cardIconEl);
                cardEl.append(divEl);
                cardEl.append(cardTempEl);
                cardEl.append(cardHumidityEl);
                forecastContainerEl.append(cardEl);
            }
        });
    }).catch(function(error) {
        alert("Unable to connect to OpenWeather");
    })
};

var formSubmitHandler = function(event) {
    target = $(event.target);
    targetId = target.attr("id");

    if (targetId === "citySearchList") {
        var city = target.text();
    } else if (targetId === "search-submit") {
        var city = $("#citySearch").val();
    };

    if (city) {
        getCurrentWeather(city);
    } else {
        alert("Please Enter a City");
    }
    target.blur();
};

$('#citySearch').keypress(function(event){
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13'){
        var city = $("citySearch").val();
        if (city) {
            getCurrentWeather(city);
        } else {
            alert("Please Enter City");
        }
    }
});

getCurrentWeather("Cincinnati");
$("button").click(formSubmitHandler);
