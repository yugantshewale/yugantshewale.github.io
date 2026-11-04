let timeobject = document.querySelector(".time-object");
let dateobject = document.querySelector(".date-object");

function updateDateTime() {
    const currentDate = new Date();

    dateobject.textContent = "Date : " + currentDate.toDateString();
    timeobject.textContent = "Time : " + currentDate.toLocaleTimeString();
}

updateDateTime();
setInterval(updateDateTime, 1000);

let weatherObject = document.querySelector(".weather-object");

function getWeather() {
    // Check if browser supports location
    if (!navigator.geolocation) {
        console.log("Geolocation is not supported");
        return;
    }
}
  
// Ask visitor for permission
navigator.geolocation.getCurrentPosition(
    async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
    
        try {
            // Get weather for visitor's location
            const weatherurl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,is_day&forecast_days=1`;
    
            const response = await fetch(weatherurl);
    
            if (!response.ok) {
            throw new Error("Weather request failed");
            }
    
            const data = await response.json();
    
            //console.log("Temperature:", data.current.temperature_2m);
            //console.log("Is it daytime?", data.current.is_day);
            weatherObject.textContent = `Temperature: ${data.current.temperature_2m}°C`;

        } catch (error) {
            console.error("Weather error:", error);
        }
    },
    (error) => {
    console.log("Location permission denied or unavailable:", error.message);
    }
);


// Run the function
getWeather();
