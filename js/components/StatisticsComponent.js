// StatisticsComponent.js
import FormatUtils from '../utils/FormatUtils.js';

class StatisticsComponent {
  constructor(container, xpData, auditData) {
    this.container = container;
    this.xpData = xpData;
    this.auditData = auditData;
  }

  render() {
    this.container.innerHTML = `
      <h2>Statistics (Module #75)</h2>
      <div class="graph-container">
        <div class="graph">
          <h3>XP Progress Over Time</h3>
          <div id="xp-chart-container"></div>
        </div>
        <div class="graph">
          <h3>Audit Ratio</h3>
          <div id="audit-chart-container"></div>
        </div>
        <div class="graph">
          <h3>Project Success Rate</h3>
          <div id="project-chart-container"></div>
        </div>
      </div>
    `;
  
    this.renderXPChart();
    this.renderAuditChart();
    this.renderProjectSuccessRate();
  }

  renderXPChart() {
    if (!this.xpData.length) {
      document.getElementById('xp-chart-container').innerHTML = 
        '<p>No XP data available for Module #75</p>';
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
    path.setAttribute('stroke', '#69b3a2');
    path.setAttribute('stroke-width', '2');
    g.appendChild(path);

    // Add dots
    data.forEach(d => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', xScale(d.date));
      circle.setAttribute('cy', yScale(d.cumulativeXP));
      circle.setAttribute('r', '4');
      circle.setAttribute('fill', '#69b3a2');
      
      // Add tooltip on hover
      circle.addEventListener('mouseover', function(e) {
        const tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tooltip.setAttribute('x', xScale(d.date) + 10);
        tooltip.setAttribute('y', yScale(d.cumulativeXP) - 10);
        tooltip.setAttribute('fill', '#333');
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

    // Add X axis
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    xAxis.setAttribute('transform', `translate(0,${innerHeight})`);
    
    // X axis line
    const xAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxisLine.setAttribute('x1', 0);
    xAxisLine.setAttribute('y1', 0);
    xAxisLine.setAttribute('x2', innerWidth);
    xAxisLine.setAttribute('y2', 0);
    xAxisLine.setAttribute('stroke', '#000');
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
    yAxisLine.setAttribute('stroke', '#000');
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
      tick.setAttribute('stroke', '#000');
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
    if (!this.auditData.length) {
      document.getElementById('audit-chart-container').innerHTML = 
        '<p>No audit data available for Module #75</p>';
      return;
    }

    // Process data for pie chart
    const auditCounts = {
      up: this.auditData.filter(item => item.type === "up").length,
      down: this.auditData.filter(item => item.type === "down").length
    };

    const total = auditCounts.up + auditCounts.down;
    if (total === 0) {
      document.getElementById('audit-chart-container').innerHTML = 
        '<p>No audit data available for Module #75</p>';
      return;
    }

    const pieData = [
      { type: "Audits Done", value: auditCounts.up, percent: (auditCounts.up / total) * 100 },
      { type: "Audits Received", value: auditCounts.down, percent: (auditCounts.down / total) * 100 }
    ];

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

    // Colors for pie slices
    const colors = ['#69b3a2', '#404080'];

    // Calculate angles for pie slices
    let startAngle = 0;
    data.forEach((item, index) => {
      const endAngle = startAngle + (item.percent / 100) * (Math.PI * 2);
      
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
      path.setAttribute('fill', colors[index % colors.length]);
      path.setAttribute('stroke', 'white');
      path.setAttribute('stroke-width', '2');
      
      svg.appendChild(path);
      
      // Add label
      const labelAngle = startAngle + (endAngle - startAngle) / 2;
      const labelRadius = radius * 0.7;
      const labelX = centerX + labelRadius * Math.cos(labelAngle);
      const labelY = centerY + labelRadius * Math.sin(labelAngle);
      
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', labelX);
      label.setAttribute('y', labelY);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('fill', 'white');
      label.setAttribute('font-size', '12');
      label.textContent = `${item.percent.toFixed(1)}%`;
      
      svg.appendChild(label);
      
      startAngle = endAngle;
    });

    // Add legend
    const legendY = height - 40;
    data.forEach((item, index) => {
      const legendX = 60 + index * (width / 2);
      
      // Color square
      const square = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      square.setAttribute('x', legendX - 15);
      square.setAttribute('y', legendY);
      square.setAttribute('width', 10);
      square.setAttribute('height', 10);
      square.setAttribute('fill', colors[index % colors.length]);
      svg.appendChild(square);
      
      // Label text
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', legendX);
      text.setAttribute('y', legendY + 9);
      text.setAttribute('font-size', '12');
      text.textContent = `${item.type}: ${item.value}`;
      svg.appendChild(text);
    });

    document.getElementById('audit-chart-container').appendChild(svg);
  }


renderProjectSuccessRate() {
    // Query for module #75 project results
    GraphQLClient.query(`{
      result(where: {
        path: {_ilike: "%#75%"},
        type: {_eq: "project"}
      }) {
        id
        grade
        path
        object {
          name
        }
      }
    }`)
    .then(data => {
      const results = data.result;
      
      // Skip if no data
      if (!results || results.length === 0) {
        document.getElementById('project-chart-container').innerHTML = 
          '<p>No project results available for Module #75</p>';
        return;
      }
  
      // Process data
      const passingProjects = results.filter(r => r.grade === 1);
      const failingProjects = results.filter(r => r.grade === 0);
      
      const chartData = [
        { status: 'PASS', count: passingProjects.length, color: '#69b3a2' },
        { status: 'FAIL', count: failingProjects.length, color: '#d14f4f' }
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
  
    // Find max count for scaling
    const maxCount = Math.max(...data.map(d => d.count));
    
    // X scale (categorical)
    const barWidth = innerWidth / data.length * 0.7;
    const barSpacing = innerWidth / data.length * 0.3;
    
    // Y scale (linear)
    const yScale = count => innerHeight - (count / maxCount) * innerHeight;
  
    // Create bars
    data.forEach((d, i) => {
      const barGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const x = i * (barWidth + barSpacing);
      const y = yScale(d.count);
      const height = innerHeight - y;
      
      // Bar rectangle
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', barWidth);
      rect.setAttribute('height', height);
      rect.setAttribute('fill', d.color);
      barGroup.appendChild(rect);
      
      // Count label
      const countLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      countLabel.setAttribute('x', x + barWidth / 2);
      countLabel.setAttribute('y', y - 10);
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