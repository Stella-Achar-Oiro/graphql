// SVG Charts Module
const Charts = (() => {
    // Create a tooltip element
    const createTooltip = () => {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.style.opacity = 0;
        document.body.appendChild(tooltip);
        return tooltip;
    };
    
    const tooltip = createTooltip();
    
    // Show tooltip with content
    const showTooltip = (content, x, y) => {
        tooltip.innerHTML = content;
        tooltip.style.left = `${x + 10}px`;
        tooltip.style.top = `${y + 10}px`;
        tooltip.style.opacity = 1;
    };
    
    // Hide tooltip
    const hideTooltip = () => {
        tooltip.style.opacity = 0;
    };
    
    // Generate a bar chart for XP per project
    const createXpBarChart = (data, svgId) => {
        // Get the SVG element
        const svg = document.getElementById(svgId);
        if (!svg) return;
        
        // Clear any existing content
        svg.innerHTML = '';
        
        // Set dimensions
        const width = svg.clientWidth;
        const height = svg.clientHeight;
        const margin = { top: 40, right: 20, bottom: 60, left: 60 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;
        
        // Group projects and sum XP
        const projectXp = data.reduce((acc, item) => {
            const path = item.path;
            // Extract project name from path
            const pathParts = path.split('/');
            const projectName = pathParts[pathParts.length - 1];
            
            if (!acc[projectName]) {
                acc[projectName] = 0;
            }
            acc[projectName] += item.amount;
            return acc;
        }, {});
        
        // Convert to array for easier processing
        const projectData = Object.entries(projectXp).map(([name, xp]) => ({ name, xp }));
        
        // Sort by XP amount
        projectData.sort((a, b) => b.xp - a.xp);
        
        // Take top 10 projects
        const topProjects = projectData.slice(0, 10);
        
        // Create scaling functions
        const xScale = index => margin.left + (index * (chartWidth / topProjects.length)) + (chartWidth / topProjects.length / 2);
        const yScale = value => margin.top + chartHeight - (value / Math.max(...topProjects.map(p => p.xp)) * chartHeight);
        
        // Create group for chart elements
        const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        svg.appendChild(chartGroup);
        
        // Create bars
        topProjects.forEach((project, index) => {
            const barWidth = chartWidth / topProjects.length * 0.7;
            const barHeight = (project.xp / Math.max(...topProjects.map(p => p.xp))) * chartHeight;
            const x = xScale(index) - barWidth / 2;
            const y = margin.top + chartHeight - barHeight;
            
            // Create rectangle for bar
            const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bar.setAttribute('x', x);
            bar.setAttribute('y', y);
            bar.setAttribute('width', barWidth);
            bar.setAttribute('height', barHeight);
            bar.setAttribute('fill', '#3498db');
            bar.setAttribute('class', 'bar');
            
            // Add event listeners for tooltip
            bar.addEventListener('mousemove', (e) => {
                showTooltip(`${project.name}: ${project.xp} XP`, e.clientX, e.clientY);
            });
            bar.addEventListener('mouseout', hideTooltip);
            
            chartGroup.appendChild(bar);
            
            // Add labels
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', xScale(index));
            label.setAttribute('y', height - margin.bottom / 2);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('font-size', '12px');
            label.textContent = project.name.length > 10 ? project.name.substring(0, 10) + '...' : project.name;
            chartGroup.appendChild(label);
        });
        
        // Add y-axis
        const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        yAxis.setAttribute('x1', margin.left);
        yAxis.setAttribute('y1', margin.top);
        yAxis.setAttribute('x2', margin.left);
        yAxis.setAttribute('y2', margin.top + chartHeight);
        yAxis.setAttribute('stroke', '#333');
        yAxis.setAttribute('stroke-width', '2');
        chartGroup.appendChild(yAxis);
        
        // Add x-axis
        const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        xAxis.setAttribute('x1', margin.left);
        xAxis.setAttribute('y1', margin.top + chartHeight);
        xAxis.setAttribute('x2', margin.left + chartWidth);
        xAxis.setAttribute('y2', margin.top + chartHeight);
        xAxis.setAttribute('stroke', '#333');
        xAxis.setAttribute('stroke-width', '2');
        chartGroup.appendChild(xAxis);
        
        // Add y-axis label
        const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        yLabel.setAttribute('x', 20);
        yLabel.setAttribute('y', margin.top + chartHeight / 2);
        yLabel.setAttribute('text-anchor', 'middle');
        yLabel.setAttribute('transform', `rotate(-90, 20, ${margin.top + chartHeight / 2})`);
        yLabel.textContent = 'XP Amount';
        chartGroup.appendChild(yLabel);
        
        // Add title
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        title.setAttribute('x', width / 2);
        title.setAttribute('y', margin.top / 2);
        title.setAttribute('text-anchor', 'middle');
        title.setAttribute('font-size', '16px');
        title.setAttribute('font-weight', 'bold');
        title.textContent = 'XP per Project';
        chartGroup.appendChild(title);
    };
    
    // Generate a pie chart for pass/fail ratio
    const createPassFailPieChart = (data, svgId) => {
        // Get the SVG element
        const svg = document.getElementById(svgId);
        if (!svg) return;
        
        // Clear any existing content
        svg.innerHTML = '';
        
        // Set dimensions
        const width = svg.clientWidth;
        const height = svg.clientHeight;
        const margin = 40;
        const radius = Math.min(width, height) / 2 - margin;
        
        // Count pass/fail projects
        const passCount = data.filter(item => item.grade > 0).length;
        const failCount = data.filter(item => item.grade === 0).length;
        
        const total = passCount + failCount;
        const passRatio = passCount / total;
        const failRatio = failCount / total;
        
        // Create group for chart elements and center it
        const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        chartGroup.setAttribute('transform', `translate(${width / 2}, ${height / 2})`);
        svg.appendChild(chartGroup);
        
        // Colors for segments
        const colors = ['#2ecc71', '#e74c3c'];
        
        // Create pie segments
        const startAngle = 0;
        const passEndAngle = startAngle + (passRatio * Math.PI * 2);
        const failEndAngle = Math.PI * 2;
        
        // Create pass segment (if there are any passes)
        if (passCount > 0) {
            const passSegment = createPieSegment(0, 0, radius, startAngle, passEndAngle, colors[0]);
            passSegment.setAttribute('class', 'pie-segment');
            
            // Add event listeners for tooltip
            passSegment.addEventListener('mousemove', (e) => {
                showTooltip(`Passed: ${passCount} (${Math.round(passRatio * 100)}%)`, e.clientX, e.clientY);
            });
            passSegment.addEventListener('mouseout', hideTooltip);
            
            chartGroup.appendChild(passSegment);
        }
        
        // Create fail segment (if there are any fails)
        if (failCount > 0) {
            const failSegment = createPieSegment(0, 0, radius, passEndAngle, failEndAngle, colors[1]);
            failSegment.setAttribute('class', 'pie-segment');
            
            // Add event listeners for tooltip
            failSegment.addEventListener('mousemove', (e) => {
                showTooltip(`Failed: ${failCount} (${Math.round(failRatio * 100)}%)`, e.clientX, e.clientY);
            });
            failSegment.addEventListener('mouseout', hideTooltip);
            
            chartGroup.appendChild(failSegment);
        }
        
        // Add legend
        const legendGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        legendGroup.setAttribute('transform', `translate(${-radius}, ${radius + 20})`);
        chartGroup.appendChild(legendGroup);
        
        // Pass legend item
        const passRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        passRect.setAttribute('x', 0);
        passRect.setAttribute('y', 0);
        passRect.setAttribute('width', 20);
        passRect.setAttribute('height', 20);
        passRect.setAttribute('fill', colors[0]);
        legendGroup.appendChild(passRect);
        
        const passText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        passText.setAttribute('x', 30);
        passText.setAttribute('y', 15);
        passText.textContent = `Pass (${passCount})`;
        legendGroup.appendChild(passText);
        
        // Fail legend item
        const failRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        failRect.setAttribute('x', 0);
        failRect.setAttribute('y', 30);
        failRect.setAttribute('width', 20);
        failRect.setAttribute('height', 20);
        failRect.setAttribute('fill', colors[1]);
        legendGroup.appendChild(failRect);
        
        const failText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        failText.setAttribute('x', 30);
        failText.setAttribute('y', 45);
        failText.textContent = `Fail (${failCount})`;
        legendGroup.appendChild(failText);
        
        // Add title
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        title.setAttribute('x', 0);
        title.setAttribute('y', -radius - 10);
        title.setAttribute('text-anchor', 'middle');
        title.setAttribute('font-size', '16px');
        title.setAttribute('font-weight', 'bold');
        title.textContent = 'Project Pass/Fail Ratio';
        chartGroup.appendChild(title);
    };
    
    // Helper function to create a pie segment
    const createPieSegment = (cx, cy, r, startAngle, endAngle, fill) => {
        // Calculate points
        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);
        
        // Determine if the arc is more than 180 degrees
        const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
        
        // Create path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`);
        path.setAttribute('fill', fill);
        
        return path;
    };
    
    return {
        createXpBarChart,
        createPassFailPieChart
    };
})();