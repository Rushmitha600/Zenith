import React from 'react';

const SafetyTips = ({ weatherData }) => {
  const tips = [
    { icon: '🛡️', title: 'Wear Helmet', desc: 'Always wear a helmet while riding' },
    { icon: '💧', title: 'Stay Hydrated', desc: 'Drink water every 30 minutes' },
    { icon: '📱', title: 'Keep Phone Charged', desc: 'Ensure your phone has enough battery' },
  ];

  if (weatherData?.temp > 38) tips.push({ icon: '🔥', title: 'Heat Alert', desc: 'Take frequent breaks in shade' });
  if (weatherData?.rain > 30) tips.push({ icon: '🌧️', title: 'Rain Warning', desc: 'Use rain cover for phone' });

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">🛡️ Safety Tips</h3>
      <div className="space-y-4">
        {tips.map((tip, i) => (<div key={i} className="flex items-start space-x-3"><span className="text-2xl">{tip.icon}</span><div><p className="font-semibold">{tip.title}</p><p className="text-sm text-gray-600">{tip.desc}</p></div></div>))}
      </div>
    </div>
  );
};

export default SafetyTips;