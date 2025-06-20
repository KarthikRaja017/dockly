import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets, Eye, Thermometer, Compass } from 'lucide-react';

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState({
    temp: 72,
    condition: 'Partly Cloudy',
    location: 'Ashburn, VA',
    high: 78,
    low: 65,
    rain: 20,
    humidity: 65,
    windSpeed: 8,
    windDirection: 'NW',
    visibility: 10,
    uvIndex: 6,
    pressure: 30.15,
    feelsLike: 75,
    hourlyForecast: [
      { time: '12PM', temp: 72, icon: 'cloud' },
      { time: '1PM', temp: 74, icon: 'sun' },
      { time: '2PM', temp: 76, icon: 'sun' },
      { time: '3PM', temp: 78, icon: 'cloud' }
    ]
  });

  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const getWeatherIcon = (condition?: string) => {
    const iconCondition = condition || weather.condition;
    switch (iconCondition) {
      case 'Partly Cloudy':
      case 'cloud':
        return <Cloud size={20} style={{ opacity: 0.9 }} />;
      case 'Sunny':
      case 'sun':
        return <Sun size={20} style={{ opacity: 0.9 }} />;
      case 'Rainy':
      case 'rain':
        return <CloudRain size={20} style={{ opacity: 0.9 }} />;
      default:
        return <Cloud size={20} style={{ opacity: 0.9 }} />;
    }
  };

  const getUVLevel = (index: number) => {
    if (index <= 2) return { level: 'Low', color: '#10b981' };
    if (index <= 5) return { level: 'Moderate', color: '#f59e0b' };
    if (index <= 7) return { level: 'High', color: '#ef4444' };
    return { level: 'Very High', color: '#dc2626' };
  };

  const uvInfo = getUVLevel(weather.uvIndex);

  return (
    <div className="card-hover" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      borderRadius: '16px',
      padding: '16px',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
      opacity: 0,
      animation: 'fadeInUp 0.6s ease-out 0.1s forwards',
      minHeight: '100px'
    }}>
      {/* Background pattern */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-50%',
        width: '200%',
        height: '200%',
        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        opacity: 0.3
      }} />

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px',
        position: 'relative',
        zIndex: 1
      }}>
        <div>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            opacity: 0.95,
            margin: '0 0 2px 0'
          }}>
            Weather
          </h3>
          <p style={{
            fontSize: '11px',
            opacity: 0.8,
            margin: 0
          }}>
            {weather.location}
          </p>
        </div>
        <div style={{
          transform: isAnimating ? 'rotate(360deg)' : 'rotate(0deg)',
          transition: 'transform 1s ease-in-out'
        }}>
          {getWeatherIcon()}
        </div>
      </div>

      {/* Main Temperature */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: '12px',
        position: 'relative',
        zIndex: 1
      }}>
        <div>
          <p style={{
            fontSize: '32px',
            fontWeight: '700',
            margin: '0 0 2px 0',
            lineHeight: 1
          }}>
            {weather.temp}°
          </p>
          <p style={{
            fontSize: '12px',
            opacity: 0.9,
            margin: 0
          }}>
            {weather.condition}
          </p>
        </div>

        <div style={{ textAlign: 'right', fontSize: '11px', opacity: 0.9 }}>
          <div style={{ marginBottom: '2px' }}>
            <span style={{ fontWeight: '600' }}>H: {weather.high}°</span>
            <span style={{ marginLeft: '6px' }}>L: {weather.low}°</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
            <Thermometer size={10} />
            <span>Feels {weather.feelsLike}°</span>
          </div>
        </div>
      </div>

      {/* Weather Details Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
        marginBottom: '12px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center' }}>
          <CloudRain size={12} style={{ margin: '0 auto 2px' }} />
          <p style={{ fontSize: '10px', fontWeight: '600', margin: '0 0 1px 0' }}>{weather.rain}%</p>
          <p style={{ fontSize: '8px', opacity: 0.8, margin: 0 }}>Rain</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Wind size={12} style={{ margin: '0 auto 2px' }} />
          <p style={{ fontSize: '10px', fontWeight: '600', margin: '0 0 1px 0' }}>{weather.windSpeed}</p>
          <p style={{ fontSize: '8px', opacity: 0.8, margin: 0 }}>mph {weather.windDirection}</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Droplets size={12} style={{ margin: '0 auto 2px' }} />
          <p style={{ fontSize: '10px', fontWeight: '600', margin: '0 0 1px 0' }}>{weather.humidity}%</p>
          <p style={{ fontSize: '8px', opacity: 0.8, margin: 0 }}>Humidity</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Eye size={12} style={{ margin: '0 auto 2px' }} />
          <p style={{ fontSize: '10px', fontWeight: '600', margin: '0 0 1px 0' }}>{weather.visibility}</p>
          <p style={{ fontSize: '8px', opacity: 0.8, margin: 0 }}>mi Vis</p>
        </div>
      </div>

      {/* Hourly Forecast */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '6px',
        position: 'relative',
        zIndex: 1
      }}>
        {weather.hourlyForecast.map((hour, index) => (
          <div key={index} style={{ textAlign: 'center', flex: 1 }}>
            <p style={{ fontSize: '9px', opacity: 0.8, margin: '0 0 2px 0' }}>{hour.time}</p>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2px' }}>
              {getWeatherIcon(hour.icon)}
            </div>
            <p style={{ fontSize: '10px', fontWeight: '600', margin: 0 }}>{hour.temp}°</p>
          </div>
        ))}
      </div>

      {/* UV Index Indicator */}
      <div style={{
        position: 'absolute',
        bottom: '8px',
        right: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: '2px 6px',
        borderRadius: '6px',
        zIndex: 1
      }}>
        <Sun size={10} />
        <span style={{ fontSize: '9px', fontWeight: '500' }}>UV {weather.uvIndex}</span>
      </div>

      {/* Floating elements animation */}
      <div style={{
        position: 'absolute',
        top: '15px',
        right: '15px',
        width: '4px',
        height: '4px',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: '50%',
        animation: 'float 3s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '25px',
        left: '25px',
        width: '3px',
        height: '3px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '50%',
        animation: 'float 4s ease-in-out infinite reverse'
      }} />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
};

export default WeatherWidget;