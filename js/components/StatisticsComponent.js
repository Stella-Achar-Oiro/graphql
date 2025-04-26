// StatisticsComponent.js
import FormatUtils from '../utils/FormatUtils.js';
import GraphQLClient from '../utils/GraphQLClient.js';
import { MODULE_75_RESULTS_QUERY } from '../utils/queries.js'; 

class StatisticsComponent {
  constructor(container, xpData, auditData) {
    this.container = container;
    this.xpData = xpData;
    this.auditData = auditData;
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
        tooltip.setAttribute('fill', 'var(--text-color)');
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
      text.setAttribute('fill', 'var(--text-color)');
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
      <div class="chart-title">Audit XP Distribution (Ratio: ${formattedRatio})</div>
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
      
      // Create path for pie slice
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
      path.setAttribute('stroke', 'white');
      path.setAttribute('stroke-width', '2');
      
      svg.appendChild(path);
      
      // Add label only if percent is a valid number
      if (percent > 0) {
        const labelAngle = startAngle + (endAngle - startAngle) / 2;
        const labelRadius = radius * 0.7;
        const labelX = centerX + labelRadius * Math.cos(labelAngle);
        const labelY = centerY + labelRadius * Math.sin(labelAngle);
        
        // Add label with formatted percentage
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', labelX);
        label.setAttribute('y', labelY);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('fill', 'white');
        label.setAttribute('font-size', '12');
        label.textContent = `${FormatUtils.formatPercentage(percent)}%`;
        
        svg.appendChild(label);
      }

      startAngle = endAngle;
    });

    // Add legend with formatted XP values
    const legendY = height - 40;
    data.forEach((item, index) => {
      const legendX = 60 + index * (width / 2);
      
      // Color square
      const square = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      square.setAttribute('x', legendX - 15);
      square.setAttribute('y', legendY);
      square.setAttribute('width', 10);
      square.setAttribute('height', 10);
      square.setAttribute('fill', colors[index]);
      
      // Label text with formatted XP value
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', legendX);
      text.setAttribute('y', legendY + 9);
      text.setAttribute('font-size', '12');
      text.setAttribute('fill', 'var(--text-color)');
      text.textContent = `${item.type}: ${item.formattedValue}`;
      
      svg.appendChild(square);
      svg.appendChild(text);
    });

    document.getElementById('audit-pie-container').appendChild(svg);
  }

  getProjectName(path) {
    // Extract the last part of the path which is the project name
    return path.split('/').pop();
  }

  renderProjectSuccessRate() {
    GraphQLClient.query(MODULE_75_RESULTS_QUERY)
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
        { status: 'PASS', count: passingProjects.length, color: 'var(--chart-success)', projects: passingProjects },
        { status: 'FAIL', count: failingProjects.length, color: 'var(--chart-error)', projects: failingProjects }
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
    const margin = { top: 30, right: 30, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
  
    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  
    // Create group for the chart (applying margin)
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${margin.left},${margin.top})`);
    svg.appendChild(g);
  
    // Find max count for scaling - add safety check
    const maxCount = Math.max(...data.map(d => d.count), 1); // Ensure maxCount is at least 1
    
    // X scale (categorical)
    const barWidth = innerWidth / data.length * 0.7;
    const barSpacing = innerWidth / data.length * 0.3;
    
    // Y scale (linear) with safety checks
    const yScale = count => {
      // Make sure we don't return NaN
      if (maxCount === 0 || isNaN(count)) {
        return innerHeight;
      }
      return innerHeight - (count / maxCount) * innerHeight;
    };
  
    // Create bars
    data.forEach((d, i) => {
      const barGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const x = i * (barWidth + barSpacing);
      
      // Add safety checks
      let y = yScale(d.count);
      let height = innerHeight - y;
      
      // Ensure values are valid numbers
      if (isNaN(y)) y = innerHeight;
      if (isNaN(height)) height = 0;
      
      // Bar rectangle
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', barWidth);
      rect.setAttribute('height', height);
      rect.setAttribute('fill', d.color || '#69b3a2');

      // Add tooltip functionality
      if (d.projects && d.projects.length > 0) {
        rect.addEventListener('mouseover', (e) => {
          const tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          tooltip.setAttribute('id', 'project-tooltip');
          
          const tooltipBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          tooltipBg.setAttribute('fill', 'white');
          tooltipBg.setAttribute('stroke', '#ccc');
          tooltipBg.setAttribute('rx', '4');
          tooltipBg.setAttribute('ry', '4');
          
          const tooltipTexts = d.projects.map((project, index) => {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x + barWidth + 10);
            text.setAttribute('y', y + (index * 20) + 20);
            text.setAttribute('font-size', '12');
            text.textContent = project.name;
            return text;
          });
          
          // Size the background rectangle based on content
          const maxTextWidth = Math.max(...tooltipTexts.map(t => t.textContent.length)) * 7;
          tooltipBg.setAttribute('x', x + barWidth + 5);
          tooltipBg.setAttribute('y', y + 5);
          tooltipBg.setAttribute('width', maxTextWidth + 10);
          tooltipBg.setAttribute('height', (d.projects.length * 20) + 10);
          
          tooltip.appendChild(tooltipBg);
          tooltipTexts.forEach(text => tooltip.appendChild(text));
          g.appendChild(tooltip);
        });
        
        rect.addEventListener('mouseout', () => {
          const tooltip = document.getElementById('project-tooltip');
          if (tooltip) tooltip.remove();
        });
      }
      
      barGroup.appendChild(rect);
      
      // Count label
      const countLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      countLabel.setAttribute('x', x + barWidth / 2);
      countLabel.setAttribute('y', Math.max(y - 10, 10)); // Ensure y is never below 10
      countLabel.setAttribute('text-anchor', 'middle');
      countLabel.textContent = d.count;
      countLabel.setAttribute('font-size', '14');
      barGroup.appendChild(countLabel);
      
      // Status label
      const statusLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      statusLabel.setAttribute('x', x + barWidth / 2);
      statusLabel.setAttribute('y', innerHeight + 20);
      statusLabel.setAttribute('text-anchor', 'middle');
      statusLabel.textContent = d.status;
      statusLabel.setAttribute('font-size', '12');
      barGroup.appendChild(statusLabel);
      
      g.appendChild(barGroup);
    });
  
    // Add Y axis
    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // Y axis line
    const yAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxisLine.setAttribute('x1', 0);
    yAxisLine.setAttribute('y1', 0);
    yAxisLine.setAttribute('x2', 0);
    yAxisLine.setAttribute('y2', innerHeight);
    yAxisLine.setAttribute('stroke', '#000');
    yAxis.appendChild(yAxisLine);
    
    // Y axis ticks
    const yTicks = 5;
    for (let i = 0; i <= yTicks; i++) {
      const tickValue = Math.round((maxCount / yTicks) * i);
      const y = yScale(tickValue);
      
      const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      tick.setAttribute('x1', -5);
      tick.setAttribute('y1', y);
      tick.setAttribute('x2', 0);
      tick.setAttribute('y2', y);
      tick.setAttribute('stroke', '#000');
      yAxis.appendChild(tick);
      
      const tickLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tickLabel.setAttribute('x', -10);
      tickLabel.setAttribute('y', y + 5);
      tickLabel.setAttribute('text-anchor', 'end');
      tickLabel.textContent = tickValue;
      yAxis.appendChild(tickLabel);
    }
    
    // Y axis label
    const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    yLabel.setAttribute('transform', 'rotate(-90)');
    yLabel.setAttribute('x', -innerHeight / 2);
    yLabel.setAttribute('y', -40);
    yLabel.setAttribute('text-anchor', 'middle');
    yLabel.textContent = 'Number of Projects';
    yAxis.appendChild(yLabel);
    
    g.appendChild(yAxis);
    
    // X axis line
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxis.setAttribute('x1', 0);
    xAxis.setAttribute('y1', innerHeight);
    xAxis.setAttribute('x2', innerWidth);
    xAxis.setAttribute('y2', innerHeight);
    xAxis.setAttribute('stroke', '#000');
    g.appendChild(xAxis);
    
    // Chart title
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('x', innerWidth / 2);
    title.setAttribute('y', -10);
    title.setAttribute('text-anchor', 'middle');
    title.setAttribute('font-weight', 'bold');
    title.textContent = 'Project Success Rate';
    g.appendChild(title);
  
    document.getElementById('project-chart-container').appendChild(svg);
  }
}

export default StatisticsComponent;