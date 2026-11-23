import React from 'react';

export const MetricCards = ({ stats, totalLeads = 0 }) => {
  const byStatus = stats?.byStatus || { New: 0, Contacted: 0, Qualified: 0, Lost: 0 };
  const total = totalLeads || stats?.total || 1;

  const getPercentage = (count) => {
    if (!total || total === 0) return '0%';
    const pct = ((count / total) * 100).toFixed(1);
    return `${pct.endsWith('.0') ? parseInt(pct) : pct}%`;
  };

  const cards = [
    {
      key: 'New',
      label: 'New',
      count: byStatus.New || 0,
      percentage: getPercentage(byStatus.New || 0),
      subtitle: 'Ready for first contact',
      colorClass: 'metric-new'
    },
    {
      key: 'Contacted',
      label: 'Contacted',
      count: byStatus.Contacted || 0,
      percentage: getPercentage(byStatus.Contacted || 0),
      subtitle: 'Conversations in progress',
      colorClass: 'metric-contacted'
    },
    {
      key: 'Qualified',
      label: 'Qualified',
      count: byStatus.Qualified || 0,
      percentage: getPercentage(byStatus.Qualified || 0),
      subtitle: 'Ready for the next step',
      colorClass: 'metric-qualified'
    },
    {
      key: 'Lost',
      label: 'Lost',
      count: byStatus.Lost || 0,
      percentage: getPercentage(byStatus.Lost || 0),
      subtitle: 'Closed opportunities',
      colorClass: 'metric-lost'
    }
  ];

  return (
    <div className="metric-cards-grid">
      {cards.map((card) => (
        <div key={card.key} className={`metric-card ${card.colorClass}`}>
          <div className="metric-card-top">
            <span className="metric-label">{card.label}</span>
            <span className="metric-percentage">{card.percentage}</span>
          </div>
          <div className="metric-card-middle">
            <span className="metric-count">{card.count}</span>
            <span className="metric-subtitle">{card.subtitle}</span>
          </div>
          <div className="metric-indicator-bar"></div>
        </div>
      ))}
    </div>
  );
};
