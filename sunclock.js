var latitude = 32.0666700;
var longitude = 34.7666700;

var scuPerDay = 24;
var	scuAtSunrise = 7;
var scuAtSunset = 20;

var msecPerDay = 24 * 3600 * 1000;

var calcSunrise;
var calcSunset;

function calcSunClockForDate(date)
{
	// get sunrise & sunset
	var					times = SunCalc.getTimes(date, latitude, longitude);
	var					sunrise = times.sunrise;
	var					sunset = times.sunset;
	
	// save
	calcSunrise = sunrise;
	calcSunset = sunset;
	
	// if provided date is between sunrise and sunset, it is mapped to [0..0.5]
	if ( sunrise <= date && sunset >= date )
	{
		var			range = sunset.getTime() - sunrise.getTime();
		var			portion = date.getTime() - sunrise.getTime();
		
		return 0.5 * portion / range;
	}
	
	// moving exactly one day back and forth can be problematic if taking in to account
	// the changing sunrise/sunset times a chance might happen that we move 0 or 2 days
	
	// if provided date is before sunrise, extrapolate from yesterday's sunset
	if ( sunrise >= date )
	{
		// move to yesterday
		var			yesterday = new Date(date.getTime() - msecPerDay);
		sunset = SunCalc.getTimes(yesterday, latitude, longitude).sunset;
		
		var			range = sunrise.getTime() - sunset.getTime();
		var			portion = sunrise.getTime() - date.getTime();
		
		return -0.5 * portion / range;
	}
	
	// else provided date is after sunset, extrapolate form tomorrow's sunrise
	if ( sunset <= date )
	{
		// move to tomorrow
		var			tomorrow = new Date(date.getTime() + msecPerDay);
		sunrise = SunCalc.getTimes(tomorrow, latitude, longitude).sunrise;

		var			range = sunrise.getTime() - sunset.getTime();
		var			portion = date.getTime() - sunset.getTime();
		
		return 0.5 + 0.5 * portion / range;
	}
	
	// if here, we are in error
	throw new Error("calcSunClockForDate: could not determine date relation to sunrise/sunset");
	return -1;
}

function calcSunClockDateForSunClock(sc)
{
	// start with the current date
	var				date = new Date();
	var				delta;
	
	// move back to midnight
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0);
	date.setMilliseconds(0);
	
	// move to sunrise
	delta = Math.round(scuAtSunrise / scuPerDay * msecPerDay);
	date = new Date(date.getTime() + delta);
	
	
	// daylight?
	if ( sc >= 0 && sc <= 0.5 )
	{
		delta = Math.round(2 * sc * (scuAtSunset - scuAtSunrise) / scuPerDay * msecPerDay);
		date = new Date(date.getTime() + delta);
		
		return date;
	}
	else if ( sc <= 0 )
	{
		delta = Math.round(2 * sc * (scuAtSunrise + scuPerDay - scuAtSunset) / scuPerDay * msecPerDay);
		date = new Date(date.getTime() + delta);
		
		return date;
	}
	else if ( sc >= 0.5 )
	{
		// move to sunset
		delta = Math.round((scuAtSunset - scuAtSunrise) / scuPerDay * msecPerDay);
		date = new Date(date.getTime() + delta);

		delta = Math.round(2 * (sc - 0.5) * (scuAtSunrise + scuPerDay - scuAtSunset) / scuPerDay * msecPerDay);
		date = new Date(date.getTime() + delta);
		
		return date;
	}
	
	// if here, we are in error
	throw new Error("calcSunClockForDate: could not determine date relation to sunrise/sunset");
}

