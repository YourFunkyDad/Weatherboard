const apiKey = "f8bdee5d7df0d8080f755ec842a46146";
var userFormEl = $("#citySearch");

// API Call: api.openweathermap.org/data/2.5/weather?q=London,uk&APPID=f8bdee5d7df0d8080f755ec842a46146

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



// Updating Current Weather
var updateCurrentWeather = function(response) {
    var iconEl = $("#currentIcon");
    var humidityEl = $("#currentHumidity");
    var windSpeedEl = $("#currentWindSpeed");
    var dateEl = $("currentDate");
    var tempEl = $("currentTemp");

    var currentIcon = response.weather[0].icon;
    var currentDate = new Date(currentTimeCodeUnix*1000).toLocaleDateString("en-US");
    var currentTimeCodeUnix = response.dt;
    var currentTemp = response.main.temp;
    var currentWindSpeed = response.wind.speed;
    var currentHumidity = response.main.humidity;

    dateEl.text(currentDate);
    tempEl.text(currentTemp);
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

getCurrentWeather("Cincinnati");
