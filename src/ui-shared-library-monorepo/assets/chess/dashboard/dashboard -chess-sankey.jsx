import React, { useState, useMemo } from 'react';
import { Sankey, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Activity, TrendingUp, Target } from 'lucide-react';

export default function SankeyChessDashboard() {
  const generateDummyData = () => {
    const games = [];
    let rating = 1400;
    const timeClasses = ['blitz', 'rapid', 'bullet'];
    const openings = ['e4', 'd4', 'Nf3', 'c4'];
    
    for (let i = 0; i < 10000; i++) {
      const isWhite = Math.random() > 0.5;
      const result = Math.random() < 0.52 ? 'win' : (Math.random() < 0.85 ? 'loss' : 'draw');
      const timeClass = timeClasses[Math.floor(Math.random() * timeClasses.length)];
      const opening = openings[Math.floor(Math.random() * openings.length)];
      
      rating += Math.floor(Math.random() * 40) - 18;
      rating = Math.max(900, Math.min(2100, rating));
      
      games.push({
        white: JSON.stringify({
          username: isWhite ? 'Biskupstunga' : 'Opponent' + i,
          rating: isWhite ? rating : rating + Math.floor(Math.random() * 300) - 150,
          result: isWhite ? result : (result === 'win' ? 'loss' : result === 'loss' ? 'win' : 'draw')
        }),
        black: JSON.stringify({
          username: isWhite ? 'Opponent' + i : 'Biskupstunga',
          rating: isWhite ? rating + Math.floor(Math.random() * 300) - 150 : rating,
          result: isWhite ? (result === 'win' ? 'loss' : result === 'loss' ? 'win' : 'draw') : result
        }),
        time_class: timeClass,
        opening: opening,
        color: isWhite ? 'white' : 'black',
        end_time: String(Math.floor(Date.now() / 1000) - (10000 - i) * 43200)
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
        
        let result = 'draw';
        if (userData.result === 'win') result = 'win';
        else if (userData.result === 'loss') result = 'loss';
        
        return {
          color: game.color,
          result: result,
          timeClass: game.time_class,
          opening: game.opening,
          rating: parseInt(userData.rating) || 0
        };
      } catch (e) {
        return null;
      }
    }).filter(g => g && g.rating > 0);

    // Build Sankey data: Opening -> Color -> Result
    const sankeyNodes = [
      // Openings (0-3)
      { name: 'e4' },
      { name: 'd4' },
      { name: 'Nf3' },
      { name: 'c4' },
      // Colors (4-5)
      { name: 'White' },
      { name: 'Black' },
      // Results (6-8)
      { name: 'Win' },
      { name: 'Loss' },
      { name: 'Draw' }
    ];

    const linkCounts = {};
    userGames.forEach(g => {
      // Opening to Color
      const openingIdx = ['e4', 'd4', 'Nf3', 'c4'].indexOf(g.opening);
      const colorIdx = g.color === 'white' ? 4 : 5;
      const key1 = `${openingIdx}-${colorIdx}`;
      linkCounts[key1] = (linkCounts[key1] || 0) + 1;
      
      // Color to Result
      const resultIdx = g.result === 'win' ? 6 : g.result === 'loss' ? 7 : 8;
      const key2 = `${colorIdx}-${resultIdx}`;
      linkCounts[key2] = (linkCounts[key2] || 0) + 1;
    });

    const sankeyLinks = Object.entries(linkCounts).map(([key, value]) => {
      const [source, target] = key.split('-').map(Number);
      return { source, target, value };
    });

    // Time control breakdown
    const timeControlStats = {};
    userGames.forEach(g => {
      if (!timeControlStats[g.timeClass]) {
        timeControlStats[g.timeClass] = { wins: 0, losses: 0, draws: 0 };
      }
      timeControlStats[g.timeClass][g.result + 's']++;
    });

    const timeControlData = Object.entries(timeControlStats).map(([name, stats]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      wins: stats.wins,
      losses: stats.losses,
      draws: stats.draws,
      total: stats.wins + stats.losses + stats.draws
    }));

    // Opening performance
    const openingStats = {};
    userGames.forEach(g => {
      if (!openingStats[g.opening]) {
        openingStats[g.opening] = { total: 0, wins: 0 };
      }
      openingStats[g.opening].total++;
      if (g.result === 'win') openingStats[g.opening].wins++;
    });

    const openingData = Object.entries(openingStats).map(([name, stats]) => ({
      name,
      winRate: ((stats.wins / stats.total) * 100).toFixed(1),
      games: stats.total
    }));

    // Color performance
    const colorStats = { white: { wins: 0, total: 0 }, black: { wins: 0, total: 0 } };
    userGames.forEach(g => {
      colorStats[g.color].total++;
      if (g.result === 'win') colorStats[g.color].wins++;
    });

    const totalGames = userGames.length;
    const totalWins = userGames.filter(g => g.result === 'win').length;

    return {
      sankeyNodes,
      sankeyLinks,
      timeControlData,
      openingData,
      colorStats,
      totalGames,
      totalWins,
      winRate: ((totalWins / totalGames) * 100).toFixed(1)
    };
  }, [data, username]);

  if (!analytics) return null;

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 bg-cyan-500 rounded"></div>
            <span className="text-white text-sm">White Pieces</span>
            <div className="w-3 h-3 bg-purple-500 rounded ml-4"></div>
            <span className="text-white text-sm">Black Pieces</span>
            <div className="w-3 h-3 bg-orange-500 rounded ml-4"></div>
            <span className="text-white text-sm">Results</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-1">Game Flow Analysis</h1>
          <p className="text-gray-500 text-sm">Opening → Color → Outcome patterns</p>
        </div>

        {/* Main Sankey */}
        <div className="bg-[#252525] rounded-lg p-8 border border-gray-800 mb-6">
          <div className="grid grid-cols-3 mb-6">
            <div>
              <div className="text-gray-500 text-xs uppercase tracking-wider mb-2">INPUT</div>
              <div className="text-white text-sm">Opening Moves</div>
            </div>
            <div className="text-center">
              <div className="text-gray-500 text-xs uppercase tracking-wider mb-2">FLOW</div>
              <div className="text-white text-sm">Piece Color</div>
            </div>
            <div className="text-right">
              <div className="text-gray-500 text-xs uppercase tracking-wider mb-2">OUTPUT</div>
              <div className="text-white text-sm">Game Results</div>
            </div>
          </div>

          <div className="relative">
            {/* Manual Sankey-style visualization */}
            <svg viewBox="0 0 1200 500" className="w-full">
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#06b6d4', stopOpacity: 0.6 }} />
                  <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 0.6 }} />
                </linearGradient>
                <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#8b5cf6', stopOpacity: 0.6 }} />
                  <stop offset="100%" style={{ stopColor: '#f59e0b', stopOpacity: 0.6 }} />
                </linearGradient>
              </defs>
              
              {/* Left nodes - Openings */}
              <g>
                <rect x="50" y="50" width="150" height="80" fill="#164e63" rx="4" />
                <text x="125" y="85" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">e4</text>
                <text x="125" y="105" textAnchor="middle" fill="#94a3b8" fontSize="12">25.2%</text>
                <text x="180" y="85" fill="#10b981" fontSize="11">↑6.2%</text>
                
                <rect x="50" y="150" width="150" height="80" fill="#164e63" rx="4" />
                <text x="125" y="185" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">d4</text>
                <text x="125" y="205" textAnchor="middle" fill="#94a3b8" fontSize="12">24.8%</text>
                <text x="180" y="185" fill="#ef4444" fontSize="11">↓2.1%</text>
                
                <rect x="50" y="250" width="150" height="80" fill="#164e63" rx="4" />
                <text x="125" y="285" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">Nf3</text>
                <text x="125" y="305" textAnchor="middle" fill="#94a3b8" fontSize="12">25.1%</text>
                
                <rect x="50" y="350" width="150" height="80" fill="#164e63" rx="4" />
                <text x="125" y="385" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">c4</text>
                <text x="125" y="405" textAnchor="middle" fill="#94a3b8" fontSize="12">24.9%</text>
                <text x="180" y="385" fill="#10b981" fontSize="11">↑1.8%</text>
              </g>

              {/* Center node */}
              <rect x="500" y="200" width="200" height="100" fill="#0ea5e9" rx="4" />
              <text x="600" y="240" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">ALL GAMES</text>
              <text x="600" y="265" textAnchor="middle" fill="white" fontSize="14">{analytics.totalGames.toLocaleString()}</text>

              {/* Right nodes - Results */}
              <g>
                <rect x="1000" y="50" width="150" height="80" fill="#166534" rx="4" />
                <text x="1075" y="85" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">Win</text>
                <text x="1075" y="105" textAnchor="middle" fill="#94a3b8" fontSize="12">{analytics.winRate}%</text>
                <text x="1030" y="85" fill="#10b981" fontSize="11">↑5.5%</text>
                
                <rect x="1000" y="200" width="150" height="80" fill="#7c2d12" rx="4" />
                <text x="1075" y="235" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">Loss</text>
                <text x="1075" y="255" textAnchor="middle" fill="#94a3b8" fontSize="12">35.2%</text>
                <text x="1030" y="235" fill="#10b981" fontSize="11">↑6.6%</text>
                
                <rect x="1000" y="350" width="150" height="80" fill="#44403c" rx="4" />
                <text x="1075" y="385" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">Draw</text>
                <text x="1075" y="405" textAnchor="middle" fill="#94a3b8" fontSize="12">12.8%</text>
                <text x="1030" y="385" fill="#10b981" fontSize="11">↑6.6%</text>
              </g>

              {/* Flow paths */}
              <path d="M 200 90 Q 350 90, 500 220" fill="none" stroke="url(#grad1)" strokeWidth="25" opacity="0.7" />
              <path d="M 200 130 Q 350 130, 500 235" fill="none" stroke="url(#grad1)" strokeWidth="20" opacity="0.6" />
              <path d="M 200 190 Q 350 190, 500 250" fill="none" stroke="url(#grad1)" strokeWidth="22" opacity="0.6" />
              <path d="M 200 290 Q 350 270, 500 260" fill="none" stroke="url(#grad1)" strokeWidth="24" opacity="0.6" />
              <path d="M 200 390 Q 350 350, 500 280" fill="none" stroke="url(#grad1)" strokeWidth="21" opacity="0.6" />

              <path d="M 700 230 Q 850 90, 1000 90" fill="none" stroke="url(#grad2)" strokeWidth="30" opacity="0.7" />
              <path d="M 700 250 Q 850 240, 1000 240" fill="none" stroke="url(#grad2)" strokeWidth="25" opacity="0.7" />
              <path d="M 700 270 Q 850 390, 1000 390" fill="none" stroke="url(#grad2)" strokeWidth="18" opacity="0.7" />
            </svg>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-[#252525] rounded-lg p-5 border border-gray-800">
            <div className="text-gray-500 text-xs mb-1">Total Games</div>
            <div className="text-3xl font-bold text-white mb-1">{analytics.totalGames.toLocaleString()}</div>
            <div className="text-xs text-green-500">↑ Active</div>
          </div>
          <div className="bg-[#252525] rounded-lg p-5 border border-gray-800">
            <div className="text-gray-500 text-xs mb-1">Win Rate</div>
            <div className="text-3xl font-bold text-orange-500 mb-1">{analytics.winRate}%</div>
            <div className="text-xs text-gray-600">{analytics.totalWins.toLocaleString()} victories</div>
          </div>
          <div className="bg-[#252525] rounded-lg p-5 border border-gray-800">
            <div className="text-gray-500 text-xs mb-1">White Win Rate</div>
            <div className="text-3xl font-bold text-cyan-500 mb-1">
              {((analytics.colorStats.white.wins / analytics.colorStats.white.total) * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600">{analytics.colorStats.white.total.toLocaleString()} games</div>
          </div>
          <div className="bg-[#252525] rounded-lg p-5 border border-gray-800">
            <div className="text-gray-500 text-xs mb-1">Black Win Rate</div>
            <div className="text-3xl font-bold text-purple-500 mb-1">
              {((analytics.colorStats.black.wins / analytics.colorStats.black.total) * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600">{analytics.colorStats.black.total.toLocaleString()} games</div>
          </div>
        </div>

        {/* Bottom Charts */}
        <div className="grid grid-cols-2 gap-4">
          {/* Opening Performance */}
          <div className="bg-[#252525] rounded-lg p-6 border border-gray-800">
            <h3 className="text-white font-semibold text-sm mb-4">Opening Win Rates</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={analytics.openingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" style={{ fontSize: '12px' }} />
                <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444', borderRadius: '6px' }}
                  formatter={(value) => `${value}%`}
                />
                <Bar dataKey="winRate" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Time Control Distribution */}
          <div className="bg-[#252525] rounded-lg p-6 border border-gray-800">
            <h3 className="text-white font-semibold text-sm mb-4">Time Control Distribution</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={analytics.timeControlData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis type="number" stroke="#666" style={{ fontSize: '12px' }} />
                <YAxis dataKey="name" type="category" stroke="#666" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444', borderRadius: '6px' }}
                />
                <Bar dataKey="wins" stackId="a" fill="#10b981" />
                <Bar dataKey="losses" stackId="a" fill="#ef4444" />
                <Bar dataKey="draws" stackId="a" fill="#6b7280" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}