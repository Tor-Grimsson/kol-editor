import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Upload, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function ChessDashboard() {
  // Generate dummy data for demo
  const generateDummyData = () => {
    const games = [];
    let rating = 1200;
    const timeClasses = ['blitz', 'rapid', 'bullet', 'daily'];
    
    for (let i = 0; i < 5000; i++) {
      const isWhite = Math.random() > 0.5;
      const result = Math.random() < 0.52 ? 'win' : (Math.random() < 0.85 ? 'resigned' : 'agreed');
      
      rating += Math.floor(Math.random() * 30) - 14;
      rating = Math.max(800, Math.min(2000, rating));
      
      games.push({
        white: JSON.stringify({
          username: isWhite ? 'Biskupstunga' : 'Opponent' + i,
          rating: isWhite ? rating : rating + Math.floor(Math.random() * 200) - 100,
          result: isWhite ? result : (result === 'win' ? 'resigned' : result === 'resigned' ? 'win' : 'agreed')
        }),
        black: JSON.stringify({
          username: isWhite ? 'Opponent' + i : 'Biskupstunga',
          rating: isWhite ? rating + Math.floor(Math.random() * 200) - 100 : rating,
          result: isWhite ? (result === 'win' ? 'resigned' : result === 'resigned' ? 'win' : 'agreed') : result
        }),
        time_class: timeClasses[Math.floor(Math.random() * timeClasses.length)],
        end_time: String(Math.floor(Date.now() / 1000) - (5000 - i) * 86400),
        eco: 'B01'
      });
    }
    return games;
  };

  const [data, setData] = useState(generateDummyData());
  const [username, setUsername] = useState('Biskupstunga');

  const parseCSV = (csvText) => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    
    const games = lines.slice(1).filter(line => line.trim()).map(line => {
      const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
      const game = {};
      
      headers.forEach((header, i) => {
        if (values[i]) {
          game[header.trim()] = values[i].replace(/^"|"$/g, '').trim();
        }
      });
      
      return game;
    });

    return games;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const games = parseCSV(e.target.result);
        setData(games);
        
        // Extract username from first game
        try {
          const firstGame = games[0];
          const whiteData = JSON.parse(firstGame.white.replace(/'/g, '"'));
          const blackData = JSON.parse(firstGame.black.replace(/'/g, '"'));
          
          // Determine which player is the user (appears in both colors)
          const whiteName = whiteData.username;
          const blackName = blackData.username;
          
          setUsername(whiteName);
        } catch (e) {
          console.error('Error parsing username:', e);
        }
      };
      reader.readAsText(file);
    }
  };

  const analytics = useMemo(() => {
    if (!data || !username) return null;

    const userGames = data.map(game => {
      try {
        const whiteData = JSON.parse(game.white.replace(/'/g, '"'));
        const blackData = JSON.parse(game.black.replace(/'/g, '"'));
        
        const isWhite = whiteData.username.toLowerCase() === username.toLowerCase();
        const userColor = isWhite ? 'white' : 'black';
        const userData = isWhite ? whiteData : blackData;
        const oppData = isWhite ? blackData : whiteData;
        
        let result = 'draw';
        if (userData.result === 'win') result = 'win';
        else if (userData.result === 'resigned' || userData.result === 'checkmated' || 
                 userData.result === 'timeout' || userData.result === 'abandoned') result = 'loss';
        
        return {
          color: userColor,
          result: result,
          rating: parseInt(userData.rating) || 0,
          oppRating: parseInt(oppData.rating) || 0,
          timeClass: game.time_class || 'unknown',
          date: new Date(parseInt(game.end_time) * 1000),
          eco: game.eco || 'Unknown',
        };
      } catch (e) {
        return null;
      }
    }).filter(g => g && g.rating > 0);

    // Overall stats
    const totalGames = userGames.length;
    const wins = userGames.filter(g => g.result === 'win').length;
    const losses = userGames.filter(g => g.result === 'loss').length;
    const draws = userGames.filter(g => g.result === 'draw').length;

    // Color stats
    const whiteGames = userGames.filter(g => g.color === 'white');
    const blackGames = userGames.filter(g => g.color === 'black');
    
    const whiteWins = whiteGames.filter(g => g.result === 'win').length;
    const blackWins = blackGames.filter(g => g.result === 'win').length;

    // Time control stats
    const timeControls = {};
    userGames.forEach(g => {
      if (!timeControls[g.timeClass]) {
        timeControls[g.timeClass] = { total: 0, wins: 0, losses: 0, draws: 0 };
      }
      timeControls[g.timeClass].total++;
      timeControls[g.timeClass][g.result + 's']++;
    });

    // Rating progression (sample every 100 games for performance)
    const ratingProgression = userGames
      .filter((g, i) => i % Math.max(1, Math.floor(userGames.length / 200)) === 0)
      .map((g, i) => ({
        game: i * Math.max(1, Math.floor(userGames.length / 200)),
        rating: g.rating,
        date: g.date.toLocaleDateString()
      }));

    // Recent form (last 50 games)
    const recentGames = userGames.slice(-50);
    const recentWins = recentGames.filter(g => g.result === 'win').length;
    const recentForm = ((recentWins / recentGames.length) * 100).toFixed(1);

    // Current rating
    const currentRating = userGames[userGames.length - 1]?.rating || 0;
    const peakRating = Math.max(...userGames.map(g => g.rating));

    return {
      totalGames,
      wins,
      losses,
      draws,
      winRate: ((wins / totalGames) * 100).toFixed(1),
      whiteWinRate: ((whiteWins / whiteGames.length) * 100).toFixed(1),
      blackWinRate: ((blackWins / blackGames.length) * 100).toFixed(1),
      whiteGames: whiteGames.length,
      blackGames: blackGames.length,
      timeControls,
      ratingProgression,
      currentRating,
      peakRating,
      recentForm,
      recentWins,
      recentGames: recentGames.length
    };
  }, [data, username]);

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-lg shadow-2xl p-8 max-w-md w-full border border-slate-700">
          <div className="text-center">
            <Upload className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white mb-2">Chess Analytics Dashboard</h1>
            <p className="text-slate-400 mb-6">Upload your chess.com games CSV to analyze your performance</p>
            <label className="block">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="block w-full text-sm text-slate-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-emerald-500 file:text-white
                  hover:file:bg-emerald-600 cursor-pointer"
              />
            </label>
          </div>
        </div>
      </div>
    );
  }

  const pieData = [
    { name: 'Wins', value: analytics.wins, color: '#10b981' },
    { name: 'Losses', value: analytics.losses, color: '#ef4444' },
    { name: 'Draws', value: analytics.draws, color: '#6b7280' }
  ];

  const colorData = [
    { name: 'White', games: analytics.whiteGames, wins: parseFloat(analytics.whiteWinRate) },
    { name: 'Black', games: analytics.blackGames, wins: parseFloat(analytics.blackWinRate) }
  ];

  const timeControlData = Object.entries(analytics.timeControls).map(([name, stats]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    winRate: ((stats.wins / stats.total) * 100).toFixed(1),
    games: stats.total
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{username}'s Chess Stats</h1>
          <p className="text-slate-400">{analytics.totalGames.toLocaleString()} games analyzed</p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">Current Rating</div>
            <div className="text-3xl font-bold text-white">{analytics.currentRating}</div>
            <div className="text-sm text-slate-500 mt-1">Peak: {analytics.peakRating}</div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">Overall Win Rate</div>
            <div className="text-3xl font-bold text-emerald-400">{analytics.winRate}%</div>
            <div className="text-sm text-slate-500 mt-1">{analytics.wins}W - {analytics.losses}L - {analytics.draws}D</div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">Recent Form</div>
            <div className="text-3xl font-bold text-blue-400">{analytics.recentForm}%</div>
            <div className="text-sm text-slate-500 mt-1">Last {analytics.recentGames} games ({analytics.recentWins} wins)</div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">Color Performance</div>
            <div className="text-lg font-bold text-white">
              <span className="text-slate-300">⚪ {analytics.whiteWinRate}%</span>
              <span className="mx-2 text-slate-600">|</span>
              <span className="text-slate-400">⚫ {analytics.blackWinRate}%</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Rating Progression */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Rating Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.ratingProgression}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="game" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Line type="monotone" dataKey="rating" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Results Pie */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Game Results</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Color Performance */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Performance by Color</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={colorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="wins" fill="#10b981" name="Win Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Time Control Performance */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Win Rate by Time Control</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeControlData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="winRate" fill="#8b5cf6" name="Win Rate %" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {timeControlData.map((tc, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-slate-400">{tc.name}</span>
                  <span className="text-slate-300">{tc.games} games</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}