import React, { createContext, useState, useEffect } from 'react'
import { getDayByLocation } from '../utils'

export const WeatherContext = createContext()

export const WeatherContextProvider = ({ children }) => {
	// const [units, setUnits] = useState()
	const [isLoading, setIsLoading] = useState(false)
	const [locationInput, setLocationInput] = useState('')
	const [weatherData, setWeatherData] = useState()
	const [weatherAlerts, setWeatherAlerts] = useState()

	useEffect(() => {
		const getWeatherData = async () => {
			if (!locationInput) return
			setIsLoading(true)

			const apiKey = process.env.REACT_APP_API_KEY
			const fetchBylocation = `https://api.openweathermap.org/data/2.5/weather?q=${locationInput}&appid=${apiKey}`

			await fetch(fetchBylocation)
				.then((res) => res.json())
				.then((initialData) => {
					const location = initialData.name
					const lat = initialData.coord.lat
					const lon = initialData.coord.lon
					const country = initialData.sys.country
					const fetchByLatLon = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=$hourly,minutely&appid=${apiKey}`

					fetch(fetchByLatLon)
						.then((res) => res.json())
						.then((data) => {
							const formattedData = [
								{
									location,
									country,
									day: getDayByLocation(data.timezone),
									currentTemp: data.current.temp,
									currentFeelsLike: data.current.feels_like,
									currentDescription: data.current.weather[0].description,
									currentIcon: data.current.weather[0].icon,
									description: data.daily[0].weather[0].description,
									icon: data.daily[0].weather[0].icon,
									temp: data.daily[0].temp,
									feelsLike: data.daily[0].feels_like,
								},
							]

							const upcomingArray = data.daily.splice(1)
							upcomingArray.forEach((day) => {
								let weatherData = {
									location,
									country,
									description: day.weather[0].description,
									icon: day.weather[0].icon,
									temp: day.temp,
									feelsLike: day.feels_like,
								}
								formattedData.push(weatherData)
							})

							setWeatherData(formattedData)
							setWeatherAlerts(data.alerts)
							setIsLoading(false)
						})
						.catch((err) => console.error(err))
				})
				.catch((err) => console.error(err))
		}
		getWeatherData()
	}, [locationInput])

	return (
		<WeatherContext.Provider
			value={{
				setLocationInput,
				isLoading,
				weatherData,
				weatherAlerts,
			}}>
			{children}
		</WeatherContext.Provider>
	)
}
