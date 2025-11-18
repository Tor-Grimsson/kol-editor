
import React, { useState, useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts';
import { TrendingUp, Activity, Zap, Award } from 'lucide-react';

export default function EliteDashboard() {
  const generateDummyData = () => {
    const games = [];
    let rating = 1400;
    const timeClasses = ['blitz', 'rapid', 'bullet', 'daily'];
    
    for (let i = 0; i < 8000; i++) {
      const isWhite = Math.random() > 0.5;
      const result = Math.random() < 0.53 ? 'win' : (Math.random() < 0.82 ? 'resigned' : 'agreed');
      const timeClass = timeClasses[Math.floor(Math.random() * timeClasses.length)];
      
      rating += Math.floor(Math.random() * 40) - 18;
      rating = Math.max(900, Math.min(2100, rating));
      
      games.push({
        white: JSON.stringify({
          username: isWhite ? 'Biskupstunga' : 'Opponent' + i,
          rating: isWhite ? rating : rating + Math.floor(Math.random() * 300) - 150,
          result: isWhite ? result : (result === 'win' ? 'resigned' : result === 'resigned' ? 'win' : 'agreed')
        }),
        black: JSON.stringify({
          username: isWhite ? 'Opponent' + i : 'Biskupstunga',
          rating: isWhite ? rating + Math.floor(Math.random() * 300) - 150 : rating,
          result: isWhite ? (result === 'win' ? 'resigned' : result === 'resigned' ? 'win' : 'agreed') : result
        }),
        time_class: timeClass,
        end_time: String(Math.floor(Date.now() / 1000) - (8000 - i) * 43200),
        month: i % 12,
        hour: Math.floor(Math.random() * 24)
      });
    }
    return games;
  };

  const [data] = useState(generateDummyData());
  const [username] = useState('Biskupstunga');

  const analytics = useMemo(() => {
    if (!data || !username) return null;

    const userGames = data.map(game => {
      try {
        const whiteData = JSON.parse(game.white.replace(/'/g, '"'));
        const blackData = JSON.parse(game.black.replace(/'/g, '"'));
        
        const isWhite = whiteData.username.toLowerCase() === username.toLowerCase();
        const userData = isWhite ? whiteData : blackData;
        const oppData = isWhite ? blackData : whiteData;
        
        let result = 'draw';
        if (userData.result === 'win') result = 'win';
        else if (userData.result === 'resigned' || userData.result === 'checkmated' || 
                 userData.result === 'timeout' || userData.result === 'abandoned') result = 'loss';
        
        return {
          color: isWhite ? 'white' : 'black',
          result: result,
          rating: parseInt(userData.rating) || 0,
          oppRating: parseInt(oppData.rating) || 0,
          timeClass: game.time_class,
          month: game.month,
          hour: game.hour
        };
      } catch (e) {
        return null;
      }
    }).filter(g => g && g.rating > 0);

    // Smooth monthly performance waves
    const monthlyData = Array(12).fill(0).map((_, month) => {
      const gamesInMonth = userGames.filter(g => g.month === month);
      const wins = gamesInMonth.filter(g => g.result === 'win').length;
      const losses = gamesInMonth.filter(g => g.result === 'loss').length;
      
      return {
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month],
        wins: wins,
        losses: losses,
        draws: gamesInMonth.length - wins - losses,
        winRate: gamesInMonth.length > 0 ? (wins / gamesInMonth.length) * 100 : 0
      };
    });

    // Time control distribution (donut)
    const timeControlStats = {};
    userGames.forEach(g => {
      if (!timeControlStats[g.timeClass]) {
        timeControlStats[g.timeClass] = { total: 0, wins: 0 };
      }
      timeControlStats[g.timeClass].total++;
      if (g.result === 'win') timeControlStats[g.timeClass].wins++;
    });

    const donutData = Object.entries(timeControlStats).map(([name, stats]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: stats.total,
      winRate: (stats.wins / stats.total) * 100
    }));

    // Rating progression (smooth area)
    const ratingProgression = userGames
      .filter((g, i) => i % 50 === 0)
      .map((g, i) => ({
        game: i * 50,
        rating: g.rating,
        ma: userGames.slice(Math.max(0, i * 50 - 100), i * 50 + 1)
          .reduce((sum, game) => sum + game.rating, 0) / Math.min(100, i * 50 + 1)
      }));

    // Hourly heatmap
    const hourlyHeatmap = Array(24).fill(0).map((_, hour) => {
      const gamesAtHour = userGames.filter(g => g.hour === hour);
      const wins = gamesAtHour.filter(g => g.result === 'win').length;
      return {
        hour: hour,
        games: gamesAtHour.length,
        winRate: gamesAtHour.length > 0 ? (wins / gamesAtHour.length) * 100 : 0
      };
    });

    // Radial bars for color performance
    const whiteGames = userGames.filter(g => g.color === 'white');
    const blackGames = userGames.filter(g => g.color === 'black');
    const radialData = [
      {
        name: 'White',
        value: (whiteGames.filter(g => g.result === 'win').length / whiteGames.length) * 100,
        fill: '#f59e0b'
      },
      {
        name: 'Black', 
        value: (blackGames.filter(g => g.result === 'win').length / blackGames.length) * 100,
        fill: '#3b82f6'
      }
    ];

    const totalWins = userGames.filter(g => g.result === 'win').length;
    const totalGames = userGames.length;
    const currentRating = userGames[userGames.length - 1]?.rating || 0;
    const peakRating = Math.max(...userGames.map(g => g.rating));

    return {
      monthlyData,
      donutData,
      ratingProgression,
      hourlyHeatmap,
      radialData,
      totalWins,
      totalGames,
      currentRating,
      peakRating,
      winRate: ((totalWins / totalGames) * 100).toFixed(1)
    };
  }, [data, username]);

  if (!analytics) return null;

  const COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444', '#ec4899'];

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-8 h-8 text-orange-500" />
            <h1 className="text-4xl font-bold text-white tracking-tight">CHESS ANALYTICS</h1>
          </div>
          <p className="text-gray-500 text-sm">Performance metrics & statistical analysis</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-[#111111] rounded-lg p-4 border border-gray-800">
            <div className="text-gray-500 text-xs mb-1">Total Games</div>
            <div className="text-2xl font-bold text-white">{analytics.totalGames.toLocaleString()}</div>
            <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> Active
            </div>
          </div>
          <div className="bg-[#111111] rounded-lg p-4 border border-gray-800">
            <div className="text-gray-500 text-xs mb-1">Win Rate</div>
            <div className="text-2xl font-bold text-orange-500">{analytics.winRate}%</div>
            <div className="text-xs text-gray-600 mt-1">{analytics.totalWins} victories</div>
          </div>
          <div className="bg-[#111111] rounded-lg p-4 border border-gray-800">
            <div className="text-gray-500 text-xs mb-1">Current Rating</div>
            <div className="text-2xl font-bold text-white">{analytics.currentRating}</div>
            <div className="text-xs text-gray-600 mt-1">Peak: {analytics.peakRating}</div>
          </div>
          <div className="bg-[#111111] rounded-lg p-4 border border-gray-800">
            <div className="text-gray-500 text-xs mb-1">Performance</div>
            <div className="text-2xl font-bold text-blue-500">Elite</div>
            <div className="text-xs text-gray-600 mt-1">Top 15%</div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* Monthly Performance Waves */}
          <div className="col-span-2 bg-[#111111] rounded-lg p-5 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold text-sm">Monthly Performance</h3>
                <p className="text-gray-500 text-xs">Win/Loss distribution over time</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={analytics.monthlyData}>
                <defs>
                  <linearGradient id="winsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="lossesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                <XAxis dataKey="month" stroke="#666" style={{ fontSize: '11px' }} />
                <YAxis stroke="#666" style={{ fontSize: '11px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                  labelStyle={{ color: '#999', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="wins" stackId="1" stroke="#f59e0b" fill="url(#winsGradient)" strokeWidth={2} />
                <Area type="monotone" dataKey="losses" stackId="1" stroke="#3b82f6" fill="url(#lossesGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Time Control Distribution */}
          <div className="bg-[#111111] rounded-lg p-5 border border-gray-800">
            <h3 className="text-white font-semibold text-sm mb-4">Time Controls</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={analytics.donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {analytics.donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1">
              {analytics.donutData.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-gray-400">{item.name}</span>
                  </div>
                  <span className="text-white font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rating Progression */}
          <div className="col-span-2 bg-[#111111] rounded-lg p-5 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold text-sm">Rating Evolution</h3>
                <p className="text-gray-500 text-xs">Historical performance curve</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-white">{analytics.currentRating}</div>
                <div className="text-xs text-green-500">+{analytics.currentRating - 1200}</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={analytics.ratingProgression}>
                <defs>
                  <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                <XAxis dataKey="game" stroke="#666" style={{ fontSize: '11px' }} />
                <YAxis stroke="#666" style={{ fontSize: '11px' }} domain={['dataMin - 50', 'dataMax + 50']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="rating" stroke="#8b5cf6" fill="url(#ratingGradient)" strokeWidth={2} />
                <Line type="monotone" dataKey="ma" stroke="#f59e0b" strokeWidth={1} dot={false} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Color Performance Radial */}
          <div className="bg-[#111111] rounded-lg p-5 border border-gray-800">
            <h3 className="text-white font-semibold text-sm mb-4">Color Performance</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="30%" 
                outerRadius="90%" 
                data={analytics.radialData}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  background
                  dataKey="value"
                  cornerRadius={10}
                />
                <Legend 
                  iconSize={10}
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  wrapperStyle={{ fontSize: '11px' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                  formatter={(value) => `${value.toFixed(1)}%`}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>

          {/* Hourly Heatmap */}
          <div className="col-span-3 bg-[#111111] rounded-lg p-5 border border-gray-800">
            <h3 className="text-white font-semibold text-sm mb-4">24-Hour Performance Heatmap</h3>
            <div className="grid grid-cols-24 gap-1">
              {analytics.hourlyHeatmap.map((hour, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div 
                    className="w-full h-16 rounded transition-all cursor-pointer hover:opacity-80"
                    style={{
                      backgroundColor: hour.games === 0 ? '#1a1a1a' : 
                        `rgba(${
                          hour.winRate > 60 ? '245, 158, 11' :
                          hour.winRate > 50 ? '139, 92, 246' :
                          hour.winRate > 40 ? '59, 130, 246' :
                          '239, 68, 68'
                        }, ${Math.min(hour.winRate / 100, 0.9)})`
                    }}
                    title={`${hour.hour}:00 - ${hour.winRate.toFixed(0)}%`}
                  />
                  <div className="text-[9px] text-gray-600 mt-1">{hour.hour}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
              <span>Midnight</span>
              <span>Noon</span>
              <span>Midnight</span>
            </div>
          </div>

          {/* Win Rate Bar */}
          <div className="col-span-3 bg-[#111111] rounded-lg p-5 border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-sm">Monthly Win Rate</h3>
              <span className="text-xs text-gray-500">Last 12 months</span>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={analytics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                <XAxis dataKey="month" stroke="#666" style={{ fontSize: '10px' }} />
                <YAxis stroke="#666" style={{ fontSize: '10px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                  formatter={(value) => `${value.toFixed(1)}%`}
                />
                <Bar dataKey="winRate" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>
    </div>
  );
}