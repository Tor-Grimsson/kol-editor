import React, { useState, useMemo } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Sankey, Tooltip, ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, AreaChart, Area, FunnelChart, Funnel, LabelList, Cell } from 'recharts';
import { TrendingUp, Zap, Target, Flame } from 'lucide-react';

export default function ExperimentalChessDashboard() {
  // Generate wild dummy data
  const generateDummyData = () => {
    const games = [];
    let rating = 1400;
    const timeClasses = ['blitz', 'rapid', 'bullet', 'daily'];
    const openings = ['e4', 'd4', 'Nf3', 'c4', 'other'];
    
    for (let i = 0; i < 8000; i++) {
      const isWhite = Math.random() > 0.5;
      const result = Math.random() < 0.53 ? 'win' : (Math.random() < 0.82 ? 'resigned' : 'agreed');
      const timeClass = timeClasses[Math.floor(Math.random() * timeClasses.length)];
      const opening = openings[Math.floor(Math.random() * openings.length)];
      const moves = Math.floor(Math.random() * 60) + 15;
      const avgMoveTime = Math.random() * 20 + 5;
      
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
        eco: opening,
        moves: moves,
        avgMoveTime: avgMoveTime,
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
          timeClass: game.time_class || 'unknown',
          date: new Date(parseInt(game.end_time) * 1000),
          eco: game.eco || 'Unknown',
          moves: game.moves || 0,
          avgMoveTime: game.avgMoveTime || 0,
          hour: game.hour || 0
        };
      } catch (e) {
        return null;
      }
    }).filter(g => g && g.rating > 0);

    // RADAR: Performance by hour of day
    const hourlyPerf = Array(24).fill(0).map((_, hour) => {
      const gamesAtHour = userGames.filter(g => g.hour === hour);
      const wins = gamesAtHour.filter(g => g.result === 'win').length;
      return {
        hour: `${hour}:00`,
        winRate: gamesAtHour.length > 0 ? (wins / gamesAtHour.length) * 100 : 0,
        games: gamesAtHour.length
      };
    });

    // SCATTER: Rating vs Game Length
    const scatterData = userGames
      .filter((g, i) => i % 40 === 0)
      .map(g => ({
        moves: g.moves,
        rating: g.rating,
        result: g.result,
        size: g.result === 'win' ? 100 : g.result === 'loss' ? 50 : 75
      }));

    // FUNNEL: Conversion from game start to win
    const totalGames = userGames.length;
    const completedGames = userGames.filter(g => g.moves > 10).length;
    const midGames = userGames.filter(g => g.moves > 25).length;
    const endGames = userGames.filter(g => g.moves > 40).length;
    const wins = userGames.filter(g => g.result === 'win').length;
    
    const funnelData = [
      { name: 'Games Started', value: totalGames, fill: '#8b5cf6' },
      { name: 'Past Opening (10+ moves)', value: completedGames, fill: '#6366f1' },
      { name: 'Middlegame (25+ moves)', value: midGames, fill: '#3b82f6' },
      { name: 'Endgame (40+ moves)', value: endGames, fill: '#10b981' },
      { name: 'Victories', value: wins, fill: '#f59e0b' }
    ];

    // HEATMAP DATA: Performance by rating diff vs time control
    const heatmapData = [];
    const timeControls = ['blitz', 'rapid', 'bullet', 'daily'];
    const ratingBrackets = ['Much Lower', 'Lower', 'Equal', 'Higher', 'Much Higher'];
    
    timeControls.forEach(tc => {
      ratingBrackets.forEach(bracket => {
        const games = userGames.filter(g => {
          const diff = g.rating - g.oppRating;
          const inTimeControl = g.timeClass === tc;
          let inBracket = false;
          
          if (bracket === 'Much Lower') inBracket = diff < -200;
          else if (bracket === 'Lower') inBracket = diff >= -200 && diff < -50;
          else if (bracket === 'Equal') inBracket = diff >= -50 && diff <= 50;
          else if (bracket === 'Higher') inBracket = diff > 50 && diff <= 200;
          else if (bracket === 'Much Higher') inBracket = diff > 200;
          
          return inTimeControl && inBracket;
        });
        
        const wins = games.filter(g => g.result === 'win').length;
        heatmapData.push({
          timeControl: tc,
          bracket: bracket,
          winRate: games.length > 0 ? (wins / games.length) * 100 : 0,
          games: games.length
        });
      });
    });

    // MOMENTUM: 50-game rolling win rate
    const momentumData = [];
    for (let i = 50; i < userGames.length; i += 25) {
      const window = userGames.slice(i - 50, i);
      const wins = window.filter(g => g.result === 'win').length;
      const winRate = (wins / 50) * 100;
      
      momentumData.push({
        game: i,
        winRate: winRate,
        rating: window[window.length - 1].rating,
        momentum: winRate > 55 ? 'hot' : winRate < 45 ? 'cold' : 'neutral'
      });
    }

    // TIME PRESSURE: Performance by avg move time
    const timePressureData = [
      { range: '<5s', winRate: 0, games: 0 },
      { range: '5-10s', winRate: 0, games: 0 },
      { range: '10-15s', winRate: 0, games: 0 },
      { range: '15-20s', winRate: 0, games: 0 },
      { range: '>20s', winRate: 0, games: 0 }
    ];
    
    userGames.forEach(g => {
      let idx = 4;
      if (g.avgMoveTime < 5) idx = 0;
      else if (g.avgMoveTime < 10) idx = 1;
      else if (g.avgMoveTime < 15) idx = 2;
      else if (g.avgMoveTime < 20) idx = 3;
      
      timePressureData[idx].games++;
      if (g.result === 'win') timePressureData[idx].winRate++;
    });
    
    timePressureData.forEach(d => {
      if (d.games > 0) d.winRate = (d.winRate / d.games) * 100;
    });

    return {
      hourlyPerf,
      scatterData,
      funnelData,
      heatmapData,
      momentumData,
      timePressureData,
      totalGames: userGames.length
    };
  }, [data, username]);

  if (!analytics) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-blue-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-10 h-10 text-yellow-400" />
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Experimental Chess Lab
            </h1>
          </div>
          <p className="text-slate-400">Unconventional metrics & wild visualizations</p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* RADAR: Circadian Performance */}
          <div className="bg-slate-900/50 backdrop-blur rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Circadian Performance Radar</h2>
            </div>
            <p className="text-slate-400 text-sm mb-4">Your win rate across 24-hour cycle</p>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={analytics.hourlyPerf.filter((_, i) => i % 3 === 0)}>
                <PolarGrid stroke="#6366f1" />
                <PolarAngleAxis dataKey="hour" stroke="#94a3b8" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#94a3b8" />
                <Radar name="Win Rate" dataKey="winRate" stroke="#a855f7" fill="#a855f7" fillOpacity={0.6} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #6366f1' }}
                  formatter={(value) => `${value.toFixed(1)}%`}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* SCATTER: Rating vs Complexity */}
          <div className="bg-slate-900/50 backdrop-blur rounded-xl p-6 border border-blue-500/20">
            <h2 className="text-xl font-bold text-white mb-4">Rating × Game Complexity Matrix</h2>
            <p className="text-slate-400 text-sm mb-4">Bubble size = outcome intensity</p>
            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" dataKey="moves" name="Moves" stroke="#9ca3af" />
                <YAxis type="number" dataKey="rating" name="Rating" stroke="#9ca3af" />
                <ZAxis type="number" dataKey="size" range={[20, 200]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #3b82f6' }}
                />
                <Scatter 
                  data={analytics.scatterData.filter(d => d.result === 'win')} 
                  fill="#10b981" 
                  fillOpacity={0.6}
                  name="Wins"
                />
                <Scatter 
                  data={analytics.scatterData.filter(d => d.result === 'loss')} 
                  fill="#ef4444" 
                  fillOpacity={0.6}
                  name="Losses"
                />
                <Scatter 
                  data={analytics.scatterData.filter(d => d.result === 'draw')} 
                  fill="#6b7280" 
                  fillOpacity={0.6}
                  name="Draws"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* FUNNEL: Victory Conversion Pipeline */}
          <div className="bg-slate-900/50 backdrop-blur rounded-xl p-6 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-white">Victory Conversion Funnel</h2>
            </div>
            <p className="text-slate-400 text-sm mb-4">How many games reach endgame & victory</p>
            <ResponsiveContainer width="100%" height={350}>
              <FunnelChart>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #f59e0b' }}
                />
                <Funnel
                  dataKey="value"
                  data={analytics.funnelData}
                  isAnimationActive
                >
                  <LabelList position="right" fill="#fff" stroke="none" dataKey="name" />
                  {analytics.funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>

          {/* MOMENTUM CHART */}
          <div className="bg-slate-900/50 backdrop-blur rounded-xl p-6 border border-green-500/20">
            <h2 className="text-xl font-bold text-white mb-4">Momentum Waves (50-game rolling)</h2>
            <p className="text-slate-400 text-sm mb-4">Detect hot & cold streaks</p>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={analytics.momentumData}>
                <defs>
                  <linearGradient id="momentumGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="game" stroke="#9ca3af" />
                <YAxis domain={[30, 70]} stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #10b981' }}
                  formatter={(value) => `${value.toFixed(1)}%`}
                />
                <Area 
                  type="monotone" 
                  dataKey="winRate" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#momentumGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* HEATMAP: Performance Matrix */}
          <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur rounded-xl p-6 border border-pink-500/20">
            <h2 className="text-xl font-bold text-white mb-4">Performance Heatmap: Time Control × Rating Differential</h2>
            <p className="text-slate-400 text-sm mb-4">Win rate by opponent strength & game speed</p>
            <div className="grid grid-cols-5 gap-2">
              {['Much Lower', 'Lower', 'Equal', 'Higher', 'Much Higher'].map(bracket => (
                <div key={bracket} className="text-center text-xs text-slate-400 font-semibold">
                  {bracket}
                </div>
              ))}
              {['blitz', 'rapid', 'bullet', 'daily'].map(tc => (
                <React.Fragment key={tc}>
                  {analytics.heatmapData
                    .filter(d => d.timeControl === tc)
                    .map((cell, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded flex items-center justify-center text-white font-bold text-sm relative group"
                        style={{
                          backgroundColor: `rgba(${
                            cell.winRate > 60 ? '16, 185, 129' :
                            cell.winRate > 50 ? '59, 130, 246' :
                            cell.winRate > 40 ? '139, 92, 246' :
                            '239, 68, 68'
                          }, ${Math.min(cell.winRate / 100, 0.9)})`
                        }}
                      >
                        {cell.games > 0 ? `${cell.winRate.toFixed(0)}%` : '-'}
                        {cell.games > 0 && (
                          <div className="absolute bottom-0 right-0 text-[8px] opacity-60">
                            {cell.games}
                          </div>
                        )}
                      </div>
                    ))}
                  <div className="col-span-5 text-xs text-slate-500 text-center capitalize -mb-1">
                    {tc}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Time Pressure Analysis */}
          <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur rounded-xl p-6 border border-cyan-500/20">
            <h2 className="text-xl font-bold text-white mb-4">Time Pressure Performance</h2>
            <p className="text-slate-400 text-sm mb-4">Win rate by average move speed</p>
            <div className="grid grid-cols-5 gap-4">
              {analytics.timePressureData.map((range, i) => (
                <div key={i} className="text-center">
                  <div 
                    className="h-32 rounded-lg flex items-end justify-center mb-2 relative overflow-hidden"
                    style={{ backgroundColor: '#1e293b' }}
                  >
                    <div 
                      className="w-full transition-all duration-1000 rounded-t-lg"
                      style={{
                        height: `${range.winRate}%`,
                        backgroundColor: range.winRate > 55 ? '#10b981' : 
                                       range.winRate > 45 ? '#3b82f6' : '#ef4444'
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                      {range.winRate.toFixed(0)}%
                    </div>
                  </div>
                  <div className="text-slate-400 text-xs font-semibold">{range.range}</div>
                  <div className="text-slate-600 text-[10px]">{range.games} games</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}