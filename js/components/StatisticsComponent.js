// StatisticsComponent.js
import FormatUtils from '../utils/FormatUtils.js';
import GraphQLClient from '../utils/GraphQLClient.js';
import { getResultsQuery } from '../utils/queries.js'; 

class StatisticsComponent {
  constructor(container, xpData, auditData, moduleId) {
    this.container = container;
    this.xpData = xpData;
    this.auditData = auditData;
    this.moduleId = moduleId;
  }

  render() {
    this.container.innerHTML = `
      <div class="statistics-grid">
        <div class="card chart-card">
          <div class="card-header">
            <h2><i class="fas fa-chart-line"></i> XP Progress Over Time</h2>
          </div>
          <div class="card-body">
            <div id="xp-chart-container" class="chart-container"></div>
          </div>
        </div>
        
        <div class="card chart-card">
          <div class="card-header">
            <h2><i class="fas fa-exchange-alt"></i> Audit Activity</h2>
          </div>
          <div class="card-body">
            <div id="audit-chart-container" class="chart-container"></div>
          </div>
        </div>
        
        <div class="card chart-card">
          <div class="card-header">
            <h2><i class="fas fa-check-circle"></i> Project Success Rate</h2>
          </div>
          <div class="card-body">
            <div id="project-chart-container" class="chart-container"></div>
          </div>
        </div>
      </div>
    `;
    
    this.addStyles();
    this.renderXPChart();
    this.renderAuditChart();
    this.renderProjectSuccessRate();
  }

  addStyles() {
    // Add component-specific styles
    const style = document.createElement('style');
    style.textContent = `
      .statistics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 20px;
      }
      
      .chart-card {
        height: 100%;
      }
      
      .chart-container {
        min-height: 300px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      @media (max-width: 768px) {
        .statistics-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  renderXPChart() {
    if (!this.xpData || !this.xpData.length) {
      document.getElementById('xp-chart-container').innerHTML = 
        '<p>No XP data available</p>';
      return;
    }

    // Sort data by date
    const sortedData = [...this.xpData].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
    
    // Calculate cumulative XP for the chart
    let cumulativeXP = 0;
    const processedData = sortedData.map(item => {
      cumulativeXP += item.amount;
      return {
        date: new Date(item.createdAt),
        cumulativeXP
      };
    });

    this.createSVGLineChart(processedData);
  }

  createSVGLineChart(data) {
    // SVG dimensions
    const width = 500;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 50, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Find min and max values
    const dates = data.map(d => d.date);
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    const maxXP = Math.max(...data.map(d => d.cumulativeXP));

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    // Add background rect for contrast
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('x', 0);
    bgRect.setAttribute('y', 0);
    bgRect.setAttribute('width', width);
    bgRect.setAttribute('height', height);
    bgRect.setAttribute('fill', 'var(--card-bg)');
    bgRect.setAttribute('rx', '8');
    svg.appendChild(bgRect);

    // Create group for the chart (applying margin)
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${margin.left},${margin.top})`);
    svg.appendChild(g);

    // X scale function
    const xScale = date => {
      const range = maxDate - minDate;
      const percent = (date - minDate) / range;
      return percent * innerWidth;
    };

    // Y scale function
    const yScale = value => {
      const percent = value / maxXP;
      return innerHeight - (percent * innerHeight);
    };

    // Generate path d attribute
    let pathD = '';
    data.forEach((d, i) => {
      const x = xScale(d.date);
      const y = yScale(d.cumulativeXP);
      pathD += i === 0 ? `M ${x},${y}` : ` L ${x},${y}`;
    });

    // Add path
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathD);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'var(--chart-primary)');
    path.setAttribute('stroke-width', '2');
    g.appendChild(path);

    // Add dots
    data.forEach(d => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', xScale(d.date));
      circle.setAttribute('cy', yScale(d.cumulativeXP));
      circle.setAttribute('r', '4');
      circle.setAttribute('fill', 'var(--chart-primary)');
      
      // Add tooltip on hover
      circle.addEventListener('mouseover', function(e) {
        const tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tooltip.setAttribute('x', xScale(d.date) + 10);
        tooltip.setAttribute('y', yScale(d.cumulativeXP) - 10);
        tooltip.setAttribute('fill', 'var(--chart-text)');
        tooltip.textContent = `${FormatUtils.formatDate(d.date)}: ${FormatUtils.formatXPSize(d.cumulativeXP)}`;
        tooltip.setAttribute('id', 'tooltip');
        g.appendChild(tooltip);
      });
      
      circle.addEventListener('mouseout', function() {
        const tooltip = document.getElementById('tooltip');
        if (tooltip) tooltip.remove();
      });
      
      g.appendChild(circle);
    });

    // Update all stroke colors for axes and ticks to use theme variables
    const allLines = g.querySelectorAll('line');
    allLines.forEach(line => {
      line.setAttribute('stroke', 'var(--chart-line)');
    });

    // Update all text colors to use theme variable
    const allTexts = g.querySelectorAll('text');
    allTexts.forEach(text => {
      text.setAttribute('fill', 'var(--chart-text)');
    });

    // Add X axis
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    xAxis.setAttribute('transform', `translate(0,${innerHeight})`);
    
    // X axis line
    const xAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxisLine.setAttribute('x1', 0);
    xAxisLine.setAttribute('y1', 0);
    xAxisLine.setAttribute('x2', innerWidth);
    xAxisLine.setAttribute('y2', 0);
    xAxisLine.setAttribute('stroke', 'var(--chart-line)');
    xAxis.appendChild(xAxisLine);
    
    // X axis label
    const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    xLabel.setAttribute('x', innerWidth / 2);
    xLabel.setAttribute('y', margin.bottom - 10);
    xLabel.setAttribute('text-anchor', 'middle');
    xLabel.setAttribute('fill', 'var(--chart-text)');
    xLabel.textContent = 'Date';
    xAxis.appendChild(xLabel);
    
    g.appendChild(xAxis);

    // Add Y axis
    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // Y axis line
    const yAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxisLine.setAttribute('x1', 0);
    yAxisLine.setAttribute('y1', 0);
    yAxisLine.setAttribute('x2', 0);
    yAxisLine.setAttribute('y2', innerHeight);
    yAxisLine.setAttribute('stroke', 'var(--chart-line)');
    yAxis.appendChild(yAxisLine);
    
    // Y axis label
    const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    yLabel.setAttribute('transform', 'rotate(-90)');
    yLabel.setAttribute('x', -innerHeight / 2);
    yLabel.setAttribute('y', -margin.left + 20);
    yLabel.setAttribute('text-anchor', 'middle');
    yLabel.setAttribute('fill', 'var(--chart-text)');
    yLabel.textContent = 'Cumulative XP';
    yAxis.appendChild(yLabel);
    
    // Y ticks
    const yTicks = 5;
    for (let i = 0; i <= yTicks; i++) {
      const tickValue = (maxXP / yTicks) * i;
      const y = yScale(tickValue);
      
      const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      tick.setAttribute('x1', -5);
      tick.setAttribute('y1', y);
      tick.setAttribute('x2', 0);
      tick.setAttribute('y2', y);
      tick.setAttribute('stroke', 'var(--chart-line)');
      yAxis.appendChild(tick);
      
      const tickLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tickLabel.setAttribute('x', -10);
      tickLabel.setAttribute('y', y + 5);
      tickLabel.setAttribute('text-anchor', 'end');
      tickLabel.textContent = FormatUtils.formatXPSize(tickValue);
      tickLabel.setAttribute('font-size', '10');
      tickLabel.setAttribute('fill', 'var(--chart-text)');
      yAxis.appendChild(tickLabel);
    }
    
    g.appendChild(yAxis);

    document.getElementById('xp-chart-container').appendChild(svg);
  }

  renderAuditChart() {
    if (!this.auditData || !this.auditData.length) {
      document.getElementById('audit-chart-container').innerHTML = 
        '<p>No audit data available</p>';
      return;
    }

    // Calculate XP totals for audits with safety checks
    const auditCounts = {
      up: this.auditData
        .filter(item => item.type === "up" && item.amount)
        .reduce((sum, audit) => sum + audit.amount, 0) || 0,
      down: this.auditData
        .filter(item => item.type === "down" && item.amount)
        .reduce((sum, audit) => sum + audit.amount, 0) || 0
    };

    const total = auditCounts.up + auditCounts.down;
    if (total === 0) {
      document.getElementById('audit-chart-container').innerHTML = 
        '<p>No audit data available</p>';
      return;
    }

    const pieData = [
      { 
        type: "XP Awarded", 
        value: auditCounts.up, 
        percent: (auditCounts.up / total) * 100 || 0,
        formattedValue: FormatUtils.formatXPSize(auditCounts.up),
        color: 'var(--chart-audit-awarded)'
      },
      { 
        type: "XP Received", 
        value: auditCounts.down, 
        percent: (auditCounts.down / total) * 100 || 0,
        formattedValue: FormatUtils.formatXPSize(auditCounts.down),
        color: 'var(--chart-audit-received)'
      }
    ];

    // Calculate and format ratio with safety check
    const ratio = auditCounts.down > 0 ? auditCounts.up / auditCounts.down : 0;
    const formattedRatio = FormatUtils.formatRatio(ratio);

    const container = document.getElementById('audit-chart-container');
    container.innerHTML = `
      <div class="chart-title">
        Audit XP Distribution (Ratio: ${formattedRatio})
        <div class="chart-subtitle">
          <span class="xp-stat">
            <span class="color-dot" style="background-color: var(--chart-audit-awarded)"></span>
            XP Awarded: ${FormatUtils.formatXPSize(auditCounts.up)}
          </span>
          <span class="xp-stat">
            <span class="color-dot" style="background-color: var(--chart-audit-received)"></span>
            XP Received: ${FormatUtils.formatXPSize(auditCounts.down)}
          </span>
        </div>
      </div>
      <div id="audit-pie-container"></div>
    `;

    this.createSVGPieChart(pieData);
  }

  createSVGPieChart(data) {
    // SVG dimensions
    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;
    const centerX = width / 2;
    const centerY = height / 2;

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    // Add a subtle shadow filter for better visibility
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', 'shadow');
    filter.innerHTML = `
      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.3"/>
    `;
    defs.appendChild(filter);
    svg.appendChild(defs);

    // Colors for pie slices - use theme variables
    const colors = data.map(item => item.color);

    // Calculate angles for pie slices
    let startAngle = 0;
    data.forEach((item, index) => {
      // Ensure percent is a valid number
      const percent = Number.isNaN(item.percent) ? 0 : item.percent;
      const endAngle = startAngle + (percent / 100) * (Math.PI * 2);
      
      // Calculate coordinates for path
      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);
      
      // Create path for pie slice with shadow
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
      
      // SVG path data
      const d = [
        `M ${centerX},${centerY}`,
        `L ${x1},${y1}`,
        `A ${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2}`,
        'Z'  // Close path
      ].join(' ');
      
      path.setAttribute('d', d);
      path.setAttribute('fill', colors[index]);
      path.setAttribute('stroke', 'rgba(255, 255, 255, 0.1)');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('filter', 'url(#shadow)');
      
      svg.appendChild(path);
      
      // Add label with improved visibility
      if (percent > 0) {
        const labelAngle = startAngle + (endAngle - startAngle) / 2;
        const labelRadius = radius * 0.7;
        const labelX = centerX + labelRadius * Math.cos(labelAngle);
        const labelY = centerY + labelRadius * Math.sin(labelAngle);
        
        // Add percentage label with better contrast
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', labelX);
        label.setAttribute('y', labelY);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('fill', 'white');
        label.setAttribute('font-size', '14');
        label.setAttribute('font-weight', '600');
        label.setAttribute('filter', 'url(#shadow)');
        label.textContent = `${FormatUtils.formatPercentage(percent)}%`;
        
        svg.appendChild(label);
      }

      startAngle = endAngle;
    });

    document.getElementById('audit-pie-container').appendChild(svg);
  }

  getProjectName(path) {
    // Extract the last part of the path which is the project name
    return path.split('/').pop();
  }

  renderProjectSuccessRate() {
    GraphQLClient.query(getResultsQuery(this.moduleId))
    .then(data => {      
      // Skip if no data
      if (!data || !data.result || data.result.length === 0) {
        document.getElementById('project-chart-container').innerHTML = 
          '<p>No project results available</p>';
        return;
      }
      
      // Process data with safety checks
      const results = data.result || [];
      // Only consider projects that have been audited (grade is not null)
      const auditedProjects = results.filter(r => r.grade !== null);
      const passingProjects = auditedProjects.filter(r => r.grade >= 1).map(r => ({
        ...r,
        name: this.getProjectName(r.path)
      }));
      const failingProjects = auditedProjects.filter(r => r.grade < 1).map(r => ({
        ...r,
        name: this.getProjectName(r.path)
      }));
    
      // Only create chart if we have audited projects
      if (auditedProjects.length === 0) {
        document.getElementById('project-chart-container').innerHTML = 
          '<p>No audited projects available</p>';
        return;
      }
      
      const chartData = [
        { status: 'PASS', count: passingProjects.length, color: 'var(--chart-audit-awarded)', projects: passingProjects },
        { status: 'FAIL', count: failingProjects.length, color: 'var(--chart-audit-received)', projects: failingProjects }
      ];
      
      this.createBarChart(chartData);
    })
    .catch(error => {
      console.error('Failed to load project data:', error);
      document.getElementById('project-chart-container').innerHTML = 
        '<p>Error loading project data</p>';
    });
  }

  createBarChart(data) {
    // SVG dimensions
    const width = 300;
    const height = 300;
    const margin = { top: 40, right: 30, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
  
    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  
    // Add defs for gradients and filters
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    // Add shadow filter
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', 'barShadow');
    filter.innerHTML = `
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.2"/>
    `;
    defs.appendChild(filter);

    // Create group for the chart (applying margin)
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${margin.left},${margin.top})`);
    
    // Add chart background for better contrast
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('x', -margin.left);
    bgRect.setAttribute('y', -margin.top);
    bgRect.setAttribute('width', width);
    bgRect.setAttribute('height', height);
    bgRect.setAttribute('fill', 'var(--card-bg)');
    bgRect.setAttribute('rx', '8');
    g.appendChild(bgRect);

    svg.appendChild(defs);
    svg.appendChild(g);
  
    // Find max count for scaling
    const maxCount = Math.max(...data.map(d => d.count), 1);
    
    // X scale (categorical)
    const barWidth = innerWidth / data.length * 0.6; // Make bars thinner
    const barSpacing = innerWidth / data.length * 0.4; // Increase spacing
    
    // Y scale (linear)
    const yScale = count => {
      return innerHeight - (count / maxCount) * innerHeight;
    };
  
    // Create bars with gradients
    data.forEach((d, i) => {
      const barGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const x = i * (barWidth + barSpacing) + barSpacing/2;
      const y = yScale(d.count);
      const height = innerHeight - y;

      // Create gradient for each bar
      const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      gradient.setAttribute('id', `barGradient-${i}`);
      gradient.innerHTML = `
        <stop offset="0%" stop-color="${d.color}" stop-opacity="1"/>
        <stop offset="100%" stop-color="${d.color}" stop-opacity="0.8"/>
      `;
      defs.appendChild(gradient);

      // Bar rectangle with gradient and effects
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', barWidth);
      rect.setAttribute('height', height);
      rect.setAttribute('fill', `url(#barGradient-${i})`);
      rect.setAttribute('stroke', 'rgba(255, 255, 255, 0.1)');
      rect.setAttribute('stroke-width', '1');
      rect.setAttribute('rx', '6');
      rect.setAttribute('filter', 'url(#barShadow)');

      // Add hover effect
      rect.addEventListener('mouseover', () => {
        rect.setAttribute('transform', 'scale(1.02)');
        rect.style.transition = 'transform 0.2s ease';
      });
      rect.addEventListener('mouseout', () => {
        rect.setAttribute('transform', 'scale(1)');
      });
      
      // Count label with shadow
      const countLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      countLabel.setAttribute('x', x + barWidth/2);
      countLabel.setAttribute('y', y - 15);
      countLabel.setAttribute('text-anchor', 'middle');
      countLabel.setAttribute('fill', 'var(--chart-text)');
      countLabel.setAttribute('font-size', '16');
      countLabel.setAttribute('font-weight', '600');
      countLabel.setAttribute('filter', 'url(#barShadow)');
      countLabel.textContent = d.count;
      
      // Status label
      const statusLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      statusLabel.setAttribute('x', x + barWidth/2);
      statusLabel.setAttribute('y', innerHeight + 25);
      statusLabel.setAttribute('text-anchor', 'middle');
      statusLabel.setAttribute('fill', 'var(--chart-text)');
      statusLabel.setAttribute('font-size', '14');
      statusLabel.setAttribute('font-weight', '500');
      statusLabel.textContent = d.status;
      
      barGroup.appendChild(rect);
      barGroup.appendChild(countLabel);
      barGroup.appendChild(statusLabel);
      g.appendChild(barGroup);

      // Add project names on hover if available
      if (d.projects && d.projects.length > 0) {
        rect.addEventListener('mouseover', () => {
          const tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          tooltip.setAttribute('id', 'tooltip');
          
          const tooltipBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          tooltipBg.setAttribute('fill', 'var(--chart-tooltip-bg)');
          tooltipBg.setAttribute('rx', '4');
          tooltipBg.setAttribute('filter', 'url(#barShadow)');
          
          const tooltipTexts = d.projects.slice(0, 3).map((project, index) => {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x + barWidth + 15);
            text.setAttribute('y', y + (index * 20) + 20);
            text.setAttribute('font-size', '12');
            text.setAttribute('fill', 'var(--chart-tooltip-text)');
            text.textContent = project.name;
            return text;
          });
          
          if (d.projects.length > 3) {
            const moreText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            moreText.setAttribute('x', x + barWidth + 15);
            moreText.setAttribute('y', y + 80);
            moreText.setAttribute('font-size', '12');
            moreText.setAttribute('fill', 'var(--chart-tooltip-text)');
            moreText.textContent = `+${d.projects.length - 3} more`;
            tooltipTexts.push(moreText);
          }
          
          const maxWidth = Math.max(...tooltipTexts.map(t => t.textContent.length)) * 7;
          tooltipBg.setAttribute('x', x + barWidth + 10);
          tooltipBg.setAttribute('y', y + 5);
          tooltipBg.setAttribute('width', maxWidth + 10);
          tooltipBg.setAttribute('height', Math.min(d.projects.length, 4) * 20 + 10);
          
          tooltip.appendChild(tooltipBg);
          tooltipTexts.forEach(text => tooltip.appendChild(text));
          g.appendChild(tooltip);
        });
        
        rect.addEventListener('mouseout', () => {
          const tooltip = document.getElementById('tooltip');
          if (tooltip) tooltip.remove();
        });
      }
    });
  
    // Add Y axis with improved styling
    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // Y axis line
    const yAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxisLine.setAttribute('x1', 0);
    yAxisLine.setAttribute('y1', 0);
    yAxisLine.setAttribute('x2', 0);
    yAxisLine.setAttribute('y2', innerHeight);
    yAxisLine.setAttribute('stroke', 'var(--chart-line)');
    yAxisLine.setAttribute('stroke-width', '1');
    yAxis.appendChild(yAxisLine);
    
    // Y axis ticks and labels
    const yTicks = 5;
    for (let i = 0; i <= yTicks; i++) {
      const tickValue = Math.round((maxCount / yTicks) * i);
      const y = yScale(tickValue);
      
      // Grid line
      const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      gridLine.setAttribute('x1', 0);
      gridLine.setAttribute('y1', y);
      gridLine.setAttribute('x2', innerWidth);
      gridLine.setAttribute('y2', y);
      gridLine.setAttribute('stroke', 'var(--chart-grid)');
      gridLine.setAttribute('stroke-dasharray', '4,4');
      g.appendChild(gridLine);
      
      // Tick
      const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      tick.setAttribute('x1', -5);
      tick.setAttribute('y1', y);
      tick.setAttribute('x2', 0);
      tick.setAttribute('y2', y);
      tick.setAttribute('stroke', 'var(--chart-line)');
      yAxis.appendChild(tick);
      
      // Label
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', -10);
      label.setAttribute('y', y + 5);
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('fill', 'var(--chart-text)');
      label.setAttribute('font-size', '12');
      label.textContent = tickValue;
      yAxis.appendChild(label);
    }
    
    // Y axis label
    const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    yLabel.setAttribute('transform', 'rotate(-90)');
    yLabel.setAttribute('x', -innerHeight/2);
    yLabel.setAttribute('y', -margin.left + 15);
    yLabel.setAttribute('text-anchor', 'middle');
    yLabel.setAttribute('fill', 'var(--chart-text)');
    yLabel.setAttribute('font-size', '13');
    yLabel.setAttribute('font-weight', '500');
    yLabel.textContent = 'Number of Projects';
    yAxis.appendChild(yLabel);
    
    g.appendChild(yAxis);
    
    // Add title
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('x', innerWidth/2);
    title.setAttribute('y', -margin.top/2);
    title.setAttribute('text-anchor', 'middle');
    title.setAttribute('fill', 'var(--chart-text)');
    title.setAttribute('font-size', '16');
    title.setAttribute('font-weight', '600');
    title.textContent = 'Project Success Rate';
    g.appendChild(title);
  
    document.getElementById('project-chart-container').appendChild(svg);
  }
}

export default StatisticsComponent;