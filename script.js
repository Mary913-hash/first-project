document.addEventListener('DOMContentLoaded', () => {
    // Grabbing necessary DOM elements for user inputs and displaying results
    const cityInput = document.getElementById('cityInput');
    const searchButton = document.getElementById('searchButton');
    const weatherOutput = document.getElementById('weatherOutput');
    const cityNameElem = document.getElementById('cityName');
    const temperatureElem = document.getElementById('temperature');
    const conditionElem = document.getElementById('condition');
    const humidityElem = document.getElementById('humidity');
    
    // Additional inputs used for POST and PATCH requests
    const tempInput = document.getElementById('temperatureInput');
    const conditionInput = document.getElementById('conditionInput');
    const humidityInput = document.getElementById('humidityInput');
    
    // Buttons for actions (POST, PATCH, CLEAR)
    const postButton = document.getElementById('postButton');
    const patchButton = document.getElementById('patchButton');
    const clearButton = document.getElementById('clearButton');

    // Local JSON server URL
    const localUrl = 'http://localhost:3000/cities'; 
    // Public Weather API key to fetch weather data for cities
    const publicApiKey = '6f734ba7889242d9adc121547241410'; 

    // Event listener for searching a city's weather by input value
    searchButton.addEventListener('click', () => {
        const city = cityInput.value.trim().toLowerCase();
        if (!city) {
            alert('Please enter a city name');
            return;
        }
  
        fetchWeatherData(city);
    });
  
    // Event listener for adding a new city via POST request
    postButton.addEventListener('click', () => {
        const city = cityInput.value.trim().toLowerCase();
        const temperature = tempInput.value.trim();
        const condition = conditionInput.value.trim();
        const humidity = humidityInput.value.trim();
        
        // Ensuring all input fields are filled before making the POST request
        if (!city || !temperature || !condition || !humidity) {
            alert('Please fill in all fields to add a new city');
            return;
        }

        // Creating the new city object to send to the server
        const newCity = {
            name: city,
            temperature: parseFloat(temperature),
            condition: condition,
            humidity: parseInt(humidity),
        };
  
        postCityData(newCity);
    });
  
    // Function to send the POST request to add a new city
    async function postCityData(newCity) {
        try {
            const response = await fetch(localUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newCity)
            });
  
            if (!response.ok) throw new Error('Failed to add city');
  
            const data = await response.json();
            console.log('City added:', data);
            alert('City added successfully');
        } catch (error) {
            console.error('Error posting city data:', error);
        }
    }
  
    // Event listener for updating an existing city's details via PATCH request
    patchButton.addEventListener('click', async () => {
        const city = cityInput.value.trim().toLowerCase();
        const updatedTemperature = tempInput.value.trim();
        const updatedCondition = conditionInput.value.trim();
        const updatedHumidity = humidityInput.value.trim();
        
        // Ensuring the city name is provided for the update
        if (!city) {
            alert('Please enter the city name to update');
            return;
        }

        // Creating the updated data object with the new values provided
        const updatedData = {
            ...(updatedTemperature && { temperature: parseFloat(updatedTemperature) }),
            ...(updatedCondition && { condition: updatedCondition }),
            ...(updatedHumidity && { humidity: parseInt(updatedHumidity) }),
        };
  
        try {
            const cityData = await getCityByName(city);
            if (!cityData) {
                alert('City not found');
                return;
            }

            // Passing the city ID and updated data to the PATCH function
            patchCityData(cityData.id, updatedData);
        } catch (error) {
            console.error('Error finding city:', error);
        }
    });
  
    // Function to send the PATCH request to update a city's data
    async function patchCityData(id, updatedData) {
        try {
            const response = await fetch(`${localUrl}/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });
  
            if (!response.ok) throw new Error('Failed to update city data');
  
            const data = await response.json();
            console.log('City updated:', data);
            alert('City updated successfully');
        } catch (error) {
            console.error('Error updating city data:', error);
        }
    }
  
    // Event listener for clearing the displayed city data without deleting it from the server
    clearButton.addEventListener('click', () => {
      cityNameElem.textContent = '';
      cityInput.value = '';
      console.log('City data cleared from browser');
    });
  
    // Function to delete a city from the local server (not used in this case as per your preference)
    async function deleteCityData(id) {
        try {
            const response = await fetch(`${localUrl}/${id}`, {
                method: 'DELETE'
            });
  
            if (!response.ok) throw new Error('Failed to delete city');
  
            console.log('City deleted:', id);
            alert('City deleted successfully');
        } catch (error) {
            console.error('Error deleting city:', error);
        }
    }
  
    // Function to get city details by name from the local JSON server
    async function getCityByName(cityName) {
        try {
            const localData = await fetchLocalData();
            return localData.find(item => item.name.toLowerCase() === cityName);
        } catch (error) {
            console.error('Error fetching city by name:', error);
            return null;
        }
    }
  
    // Function to update the background based on the weather condition
    function updateBackground(condition) {
        let body = document.body;
      
        body.classList.remove('sunny', 'cloudy', 'rainy', 'clear', 'overcast');
      
        // Adding corresponding background class based on the weather condition
        if (condition.toLowerCase().includes('sunny')) {
            body.classList.add('sunny');
        } else if (condition.toLowerCase().includes('cloudy')) {
            body.classList.add('cloudy');
        } else if (condition.toLowerCase().includes('rainy')) {
            body.classList.add('rainy');
        } else if (condition.toLowerCase().includes('clear')) {
            body.classList.add('clear');
        } else if (condition.toLowerCase().includes('overcast')) {
            body.classList.add('overcast');
        }
    }
  
    // Function to fetch weather data for a city, first trying local data, then falling back to the public API
    async function fetchWeatherData(city) {
        try {
            const localData = await fetchLocalData();
  
            if (Array.isArray(localData) && localData.length > 0) {
                const cityData = localData.find(item => item.name.toLowerCase() === city);
  
                if (cityData) {
                    console.log('City found locally:', cityData);
                    displayWeather(cityData);
                } else {
                    const apiCityData = await fetchPublicData(city);
                    displayWeather(apiCityData);
                }
            } else {
                throw new Error('Cities data is missing or malformed in local API');
            }
        } catch (error) {
            console.error('Error fetching weather data:', error);
            alert('An error occurred while fetching the weather data. Please try again later.');
        }
    }
  
    // Function to fetch data from the local JSON server
    async function fetchLocalData() {
        const response = await fetch(localUrl);
        if (!response.ok) throw new Error('Local data fetch failed');
        return response.json();
    }
  
    // Function to fetch weather data from the public Weather API
    async function fetchPublicData(city) {
        const response = await fetch(getPublicApiUrl(city));
        if (!response.ok) throw new Error('Public API fetch failed');
        
        const data = await response.json();
      
        if (data && data.location && data.current) {
            return {
                name: data.location.name,
                temperature: data.current.temp_c,
                condition: data.current.condition.text,
                humidity: data.current.humidity,
            };
        } else {
            throw new Error('Public API data is malformed');
        }
    }
  
    // Function to construct the public API URL for fetching weather data
    function getPublicApiUrl(city) {
        return `https://api.weatherapi.com/v1/current.json?key=${publicApiKey}&q=${city}`;
    }
  
    // Function to display the fetched weather data on the page
    function displayWeather(data) {
        weatherOutput.style.display = 'block';
        cityNameElem.textContent = data.name;
        temperatureElem.textContent = `${data.temperature}°C`;
        conditionElem.textContent = data.condition;
        humidityElem.textContent = `${data.humidity}%`;
        updateBackground(data.condition);
    }
});

